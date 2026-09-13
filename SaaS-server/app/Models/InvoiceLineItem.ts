import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@ioc:Adonis/Lucid/Orm'
import type { BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Invoice from './Invoice'

export default class InvoiceLineItem extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public invoiceId: number

  @column()
  public description: string

  @column()
  public quantity: number

  @column()
  public unitPrice: number

  @column()
  public amount: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Invoice)
  public invoice: BelongsTo<typeof Invoice>
}
