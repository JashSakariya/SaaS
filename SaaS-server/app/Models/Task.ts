import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import ClientProject from 'App/Models/ClientProject'

export default class Task extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column()
  public projectId!: number

  @column()
  public title!: string

  @column.date()
  public dueDate: DateTime | null = null

  @column()
  public assignee: string | null = null

  @column()
  public status!: 'todo' | 'in_progress' | 'completed' | 'blocked'

  @column.dateTime({ autoCreate: true })
  public createdAt!: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt!: DateTime

  @belongsTo(() => ClientProject, { foreignKey: 'projectId' })
  public project!: BelongsTo<typeof ClientProject>
}
