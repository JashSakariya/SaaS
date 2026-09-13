import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Invoices extends BaseSchema {
  protected tableName = 'invoices'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('client_id')
        .unsigned()
        .references('id')
        .inTable('clients')
        .onDelete('CASCADE')
        .notNullable()

      table.string('invoice_number', 50).notNullable().unique()

      table.date('due_date').notNullable()

      table
        .enum('status', ['draft', 'sent', 'paid'])
        .defaultTo('draft')
        .notNullable()

      table.decimal('total_amount', 12, 2).defaultTo(0).notNullable()

      table.text('notes').nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
