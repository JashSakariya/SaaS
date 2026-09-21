import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import PaymentOrder from 'App/Models/PaymentOrder'

export default class PaymentTransaction extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'user_id' })
  public userId: number

  @column({ columnName: 'payment_order_id' })
  public paymentOrderId: number | null

  @column({ columnName: 'razorpay_payment_id' })
  public razorpayPaymentId: string

  @column({ columnName: 'razorpay_order_id' })
  public razorpayOrderId: string

  @column({ columnName: 'razorpay_signature' })
  public razorpaySignature: string | null

  @column()
  public amount: number // in paise

  @column()
  public currency: string

  @column()
  public method: string | null // upi, card, netbanking, etc.

  @column()
  public status: 'captured' | 'failed' | 'refunded'

  @column({ columnName: 'error_code' })
  public errorCode: string | null

  @column({ columnName: 'error_description' })
  public errorDescription: string | null

  @column({
    prepare: (value: any) => (value ? JSON.stringify(value) : null),
    consume: (value: any) => {
      if (!value) return null
      if (typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch {
          return null
        }
      }
      return value
    },
  })
  public rawResponse: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @belongsTo(() => PaymentOrder, {
    foreignKey: 'paymentOrderId',
  })
  public paymentOrder: BelongsTo<typeof PaymentOrder>
}
