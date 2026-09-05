import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Developers extends BaseSchema {
  protected tableName = 'developers'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.string('category').notNullable()
      table.string('email').nullable()
      table.string('phone').nullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
