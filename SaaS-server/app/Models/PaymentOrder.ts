import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Plan from 'App/Models/Plan'

export default class PaymentOrder extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'user_id' })
  public userId: number

  @column({ columnName: 'plan_id' })
  public planId: number

  @column({ columnName: 'razorpay_order_id' })
  public razorpayOrderId: string

  @column()
  public amount: number // in paise (e.g. 149900 = ₹1,499)

  @column()
  public currency: string

  @column()
  public status: 'created' | 'paid' | 'failed'

  @column()
  public receipt: string

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
  public notes: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Plan, {
    foreignKey: 'planId',
  })
  public plan: BelongsTo<typeof Plan>
}
