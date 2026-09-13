import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class InvoiceLineItems extends BaseSchema {
  protected tableName = 'invoice_line_items'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

       table
        .integer('invoice_id')
        .unsigned()
        .references('id')
        .inTable('invoices')
        .onDelete('CASCADE')
        .notNullable()

      table.string('description', 255).notNullable()

      table.integer('quantity').defaultTo(1).notNullable()

      table.decimal('unit_price', 10, 2).notNullable()

      table.decimal('amount', 12, 2).notNullable()
      
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
