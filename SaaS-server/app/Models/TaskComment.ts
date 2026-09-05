import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Task from './Task'

export default class TaskComment extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public taskId: number;

  @column()
  public author: string | null;

  @column()
  public text: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Task, { foreignKey: 'taskId' })
  public task!: BelongsTo<typeof Task>
}
