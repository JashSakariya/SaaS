import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Plan extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public slug: string

  @column()
  public description: string | null

  @column()
  public price: number // Price in paise (e.g. 49900 = ₹499)

  @column()
  public currency: string

  @column({ columnName: 'billing_cycle' })
  public billingCycle: 'monthly' | 'yearly'

  @column({ columnName: 'duration_days' })
  public durationDays: number

  @column({
    prepare: (value: string[] | string) => (typeof value === 'string' ? value : JSON.stringify(value)),
    consume: (value: string[] | string) => {
      if (!value) return []
      if (typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch {
          return []
        }
      }
      return value
    },
  })
  public features: string[]

  @column({ columnName: 'is_popular' })
  public isPopular: boolean

  @column({ columnName: 'is_active' })
  public isActive: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
