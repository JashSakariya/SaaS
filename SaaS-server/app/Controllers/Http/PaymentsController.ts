import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'
import Plan from 'App/Models/Plan'
import PaymentOrder from 'App/Models/PaymentOrder'
import PaymentTransaction from 'App/Models/PaymentTransaction'
import Subscription from 'App/Models/Subscription'
import User from 'App/Models/User'
import RazorpayService from 'App/Services/RazorpayService'

export default class PaymentsController {
  /**
   * POST /payments/create-order
   * Creates an order in Razorpay and stores it in payment_orders table
   */
  public async createOrder({ request, response }: HttpContextContract) {
    try {
      const planId = request.input('planId')

      if (!planId) {
        return response.badRequest({
          success: false,
          message: 'planId is required to create a payment order',
        })
      }

      // 1. Fetch and validate plan from database (prevents price tampering)
      const plan = await Plan.find(planId)
      if (!plan) {
        return response.notFound({
          success: false,
          message: 'Plan not found',
        })
      }

      if (!plan.isActive) {
        return response.badRequest({
          success: false,
          message: 'This plan is currently inactive and cannot be purchased',
        })
      }

      // 2. Identify the user (from auth token or fallback for testing)
      let user = request.user
      if (!user) {
        // Fallback for direct testing if token not supplied
        const fallbackUserId = request.input('userId') || 1
        user = await User.find(fallbackUserId)
      }

      if (!user) {
        return response.unauthorized({
          success: false,
          message: 'User authentication required',
        })
      }

      // 3. Generate unique internal receipt identifier
      const receipt = `rcpt_${user.id}_${Date.now()}`

      // 4. Call Razorpay API via RazorpayService to create order
      const rzpOrder = await RazorpayService.createOrder(plan.price, receipt, {
        userId: user.id,
        planId: plan.id,
        planName: plan.name,
        userEmail: user.email || '',
      })

      // 5. Store order in MySQL payment_orders table with status 'created'
      await PaymentOrder.create({
        userId: user.id,
        planId: plan.id,
        razorpayOrderId: rzpOrder.id,
        amount: plan.price,
        currency: rzpOrder.currency || 'INR',
        status: 'created',
        receipt: receipt,
        notes: {
          planName: plan.name,
          userEmail: user.email || '',
        },
      })

      // 6. Return order details to frontend to open checkout modal
      return response.status(201).json({
        success: true,
        message: 'Razorpay order created successfully',
        data: {
          orderId: rzpOrder.id,
          amount: rzpOrder.amount, // in paise
          currency: rzpOrder.currency,
          keyId: Env.get('RAZORPAY_KEY_ID'),
          plan: {
            id: plan.id,
            name: plan.name,
            price: plan.price,
            billingCycle: plan.billingCycle,
          },
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
      })
    } catch (error) {
      console.error('Error in PaymentsController.createOrder:', error)
      return response.internalServerError({
        success: false,
        message: error.message || 'Failed to create Razorpay payment order',
      })
    }
  }

  /**
   * POST /payments/verify
   * Cryptographically verifies payment signature, records transaction, and activates subscription
   */
  public async verifyPayment({ request, response }: HttpContextContract) {
    try {
      const orderId = request.input('razorpay_order_id') || request.input('orderId')
      const paymentId = request.input('razorpay_payment_id') || request.input('paymentId')
      const signature = request.input('razorpay_signature') || request.input('signature')

      if (!orderId || !paymentId || !signature) {
        return response.badRequest({
          success: false,
          message: 'Missing required payment verification parameters (orderId, paymentId, signature)',
        })
      }

      // 1. Cryptographic Signature Verification (HMAC-SHA256)
      const isValid = RazorpayService.verifySignature(orderId, paymentId, signature)
      if (!isValid) {
        return response.badRequest({
          success: false,
          message: 'Invalid payment signature. Payment verification failed.',
        })
      }

      // 2. Find the payment order
      const paymentOrder = await PaymentOrder.query().where('razorpay_order_id', orderId).first()
      if (!paymentOrder) {
        return response.notFound({
          success: false,
          message: 'Associated payment order was not found in the system',
        })
      }

      // 3. Idempotency Check: If already processed and paid, return active state
      if (paymentOrder.status === 'paid') {
        const activeSub = await Subscription.query()
          .where('user_id', paymentOrder.userId)
          .where('status', 'active')
          .first()

        return response.json({
          success: true,
          message: 'Payment was already verified and subscription is active',
          data: {
            subscription: activeSub,
          },
        })
      }

      // 4. Fetch payment details from Razorpay to get method (upi, card, netbanking)
      let method = 'unknown'
      let rawResponse: any = null
      try {
        rawResponse = await RazorpayService.fetchPayment(paymentId)
        method = rawResponse.method || 'unknown'
      } catch (err) {
        console.warn('Could not fetch payment method from Razorpay:', err.message)
      }

      // 5. Execute atomic Database Transaction (all or nothing with rollback)
      const trx = await Database.transaction()
      try {
        // a. Mark payment order as paid
        paymentOrder.status = 'paid'
        paymentOrder.useTransaction(trx)
        await paymentOrder.save()

        // b. Insert transaction audit log
        await PaymentTransaction.create({
          userId: paymentOrder.userId,
          paymentOrderId: paymentOrder.id,
          razorpayPaymentId: paymentId,
          razorpayOrderId: orderId,
          razorpaySignature: signature,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          method: method,
          status: 'captured',
          rawResponse: rawResponse,
        }, { client: trx })

        // c. Fetch the plan for duration
        const plan = await Plan.findOrFail(paymentOrder.planId)
        const durationDays = plan.durationDays || 30
        const now = DateTime.now()
        const endsAt = now.plus({ days: durationDays })

        // d. Deactivate any prior active subscriptions for this user
        await Subscription.query({ client: trx })
          .where('user_id', paymentOrder.userId)
          .where('status', 'active')
          .update({ status: 'expired' })

        // e. Create new active subscription
        const subscription = await Subscription.create({
          userId: paymentOrder.userId,
          planId: plan.id,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: endsAt,
        }, { client: trx })

        await trx.commit()

        return response.json({
          success: true,
          message: 'Payment verified and subscription activated successfully!',
          data: {
            subscriptionId: subscription.id,
            planName: plan.name,
            status: subscription.status,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
          },
        })
      } catch (dbError) {
        await trx.rollback()
        console.error('Transaction failed during payment verification, rolled back:', dbError)
        throw dbError
      }
    } catch (error) {
      console.error('Error in PaymentsController.verifyPayment:', error)
      return response.internalServerError({
        success: false,
        message: error.message || 'Payment verification failed',
      })
    }
  }

  /**
   * GET /payments/subscription/current
   * Returns current active subscription of the user
   */
  public async currentSubscription({ request, response }: HttpContextContract) {
    try {
      let user = request.user
      if (!user) {
        const fallbackUserId = request.input('userId') || 1
        user = await User.find(fallbackUserId)
      }

      if (!user) {
        return response.json({ success: true, data: null })
      }

      const subscription = await Subscription.query()
        .where('user_id', user.id)
        .where('status', 'active')
        .preload('plan')
        .first()

      return response.json({
        success: true,
        data: subscription,
      })
    } catch (error) {
      console.error('Error in PaymentsController.currentSubscription:', error)
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch current subscription',
      })
    }
  }
}
