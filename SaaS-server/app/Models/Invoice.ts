import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany  } from '@ioc:Adonis/Lucid/Orm'
import type { BelongsTo, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Client from './Client'
import InvoiceLineItem from './InvoiceLineItem'

export default class Invoice extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public clientId: number

  @column()
  public invoiceNumber: string

  @column.date()
  public dueDate: DateTime

  @column()
  public status: 'draft' | 'sent' | 'paid'

  @column()
  public totalAmount: number

  @column()
  public notes: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Client)
  public client: BelongsTo<typeof Client>

  @hasMany(() => InvoiceLineItem)
  public lineItems: HasMany<typeof InvoiceLineItem>
}
