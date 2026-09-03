import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Client from 'App/Models/Client'
import Task from 'App/Models/Task'

export default class ClientProject extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column()
  public clientId!: number

  @column()
  public title!: string

  @column()
  public description: string | null = null

  @column()
  public status!: 'active' | 'completed' | 'on_hold'

  @column.date()
  public dueDate: DateTime | null = null 

  @column.dateTime({ autoCreate: true })
  public createdAt!: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt!: DateTime

  @belongsTo(() => Client)
  public client!: BelongsTo<typeof Client>

  @hasMany(() => Task, { foreignKey: 'projectId' })
  public tasks!: HasMany<typeof Task>
}