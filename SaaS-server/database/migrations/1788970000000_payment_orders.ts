import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PaymentOrders extends BaseSchema {
  protected tableName = 'payment_orders'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.integer('plan_id').unsigned().notNullable().references('id').inTable('plans').onDelete('CASCADE')
      table.string('razorpay_order_id', 100).notNullable().unique()
      table.integer('amount').unsigned().notNullable() // Amount in paise (e.g. 149900 = ₹1,499)
      table.string('currency', 10).defaultTo('INR').notNullable()
      table.enum('status', ['created', 'paid', 'failed']).defaultTo('created').notNullable()
      table.string('receipt', 100).notNullable().unique()
      table.json('notes').nullable()
      table.timestamps(true, true)

      // Indexes
      table.index(['user_id', 'status'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
