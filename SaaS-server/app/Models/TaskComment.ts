import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Task from './Task'
import Developer from './Developer'

export default class TaskComment extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public taskId: number

  @column()
  public developerId: number | null

  @column()
  public author: string | null

  @column()
  public content: string

  // Keep text getter/setter for compatibility
  public get text(): string {
    return this.content
  }

  public set text(val: string) {
    this.content = val
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Task, { foreignKey: 'taskId' })
  public task!: BelongsTo<typeof Task>

  @belongsTo(() => Developer, { foreignKey: 'developerId' })
  public developer!: BelongsTo<typeof Developer>
}
