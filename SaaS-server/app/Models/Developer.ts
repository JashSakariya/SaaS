import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Task from './Task'
import TaskComment from './TaskComment'

export default class Developer extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public category: string

  @column()
  public email: string | null

  @column()
  public phone: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Task, { foreignKey: 'developerId' })
  public tasks!: HasMany<typeof Task>

  @hasMany(() => TaskComment, { foreignKey: 'developerId' })
  public comments!: HasMany<typeof TaskComment>
}
