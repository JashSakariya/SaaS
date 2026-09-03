import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Tasks extends BaseSchema {
  protected tableName = 'tasks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table
        .integer('project_id')
        .unsigned()
        .references('id')
        .inTable('client_projects')
        .onDelete('CASCADE')
        .notNullable()

      table.string('title', 255).notNullable()
      table.date('due_date').nullable()
      table.string('assignee', 255).nullable()

      table
        .enum('status', ['todo', 'in_progress', 'completed', 'blocked'])
        .defaultTo('todo')
        .notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
