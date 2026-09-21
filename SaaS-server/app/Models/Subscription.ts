import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Plan from 'App/Models/Plan'

export default class Subscription extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'user_id' })
  public userId: number

  @column({ columnName: 'plan_id' })
  public planId: number

  @column()
  public status: 'active' | 'expired' | 'cancelled'

  @column.dateTime({ columnName: 'current_period_start' })
  public currentPeriodStart: DateTime

  @column.dateTime({ columnName: 'current_period_end' })
  public currentPeriodEnd: DateTime

  @column.dateTime({ columnName: 'cancelled_at' })
  public cancelledAt: DateTime | null

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
