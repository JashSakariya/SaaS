import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import ClientProject from './ClientProject'
import Invoice from './Invoice'

export default class Client extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public email: string

  @column()
  public gender: 'male' | 'female' | 'other'

  @column()
  public phone: string

  @column({ columnName: 'company_name' })
  public companyName: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => ClientProject, { foreignKey: 'clientId' })
  public projects: HasMany<typeof ClientProject>

  @hasMany(() => Invoice, { foreignKey: 'clientId' })
  public invoices: HasMany<typeof Invoice>
}
