import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddDeveloperToTaskComments extends BaseSchema {
  protected tableName = 'task_comments'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('developer_id')
        .unsigned()
        .references('id')
        .inTable('developers')
        .onDelete('SET NULL')
        .nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['developer_id'])
      table.dropColumn('developer_id')
    })
  }
}
