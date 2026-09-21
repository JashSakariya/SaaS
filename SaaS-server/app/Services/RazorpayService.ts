import crypto from 'crypto'
import Razorpay from 'razorpay'
import Env from '@ioc:Adonis/Core/Env'

export default class RazorpayService {
  private static instance: Razorpay | null = null

  /**
   * Get or initialize the Razorpay SDK instance
   */
  private static getClient(): Razorpay {
    if (!this.instance) {
      const keyId = Env.get('RAZORPAY_KEY_ID')
      const keySecret = Env.get('RAZORPAY_KEY_SECRET')

      if (!keyId || !keySecret) {
        throw new Error('Razorpay API keys (RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET) are missing from environment.')
      }

      this.instance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      })
    }
    return this.instance
  }

  /**
   * Create an Order in Razorpay
   * @param amount Amount in paise (e.g. 149900 = ₹1,499)
   * @param receipt Unique internal receipt identifier
   * @param notes Optional metadata attached to the order
   */
  public static async createOrder(amount: number, receipt: string, notes: Record<string, any> = {}) {
    const razorpay = this.getClient()
    const options = {
      amount, // In paise
      currency: 'INR',
      receipt,
      notes,
    }

    return await razorpay.orders.create(options)
  }

  /**
   * Cryptographically verify Razorpay payment signature using HMAC-SHA256
   * @param orderId Razorpay order ID (e.g. order_xxx)
   * @param paymentId Razorpay payment ID (e.g. pay_xxx)
   * @param signature Cryptographic signature returned by Razorpay
   */
  public static verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const secret = Env.get('RAZORPAY_KEY_SECRET')
    if (!secret || !signature) {
      return false
    }

    const payload = `${orderId}|${paymentId}`
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8')
    const actualBuffer = Buffer.from(signature, 'utf-8')

    // timingSafeEqual requires buffers of identical length
    if (expectedBuffer.length !== actualBuffer.length) {
      return false
    }

    return crypto.timingSafeEqual(new Uint8Array(expectedBuffer), new Uint8Array(actualBuffer))
  }

  /**
   * Fetch payment details from Razorpay to retrieve method (upi, card, netbanking)
   * @param paymentId Razorpay payment ID
   */
  public static async fetchPayment(paymentId: string) {
    const razorpay = this.getClient()
    return await razorpay.payments.fetch(paymentId)
  }
}
