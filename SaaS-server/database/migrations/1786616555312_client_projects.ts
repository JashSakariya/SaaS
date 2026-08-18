import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ClientProjects extends BaseSchema {
  protected tableName = 'client_projects'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table
        .integer('client_id')
        .unsigned()
        .references('id')
        .inTable('clients')
        .onDelete('CASCADE')
        .notNullable()

      table.string('title', 255).notNullable()
      table.text('description').nullable()

      table
        .enum('status', ['active', 'completed', 'on_hold'])
        .defaultTo('active')
        .notNullable()

      table.date('due_date').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
