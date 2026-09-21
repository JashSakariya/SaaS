import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PaymentTransactions extends BaseSchema {
  protected tableName = 'payment_transactions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.integer('payment_order_id').unsigned().nullable().references('id').inTable('payment_orders').onDelete('CASCADE')
      table.string('razorpay_payment_id', 100).notNullable().unique()
      table.string('razorpay_order_id', 100).notNullable()
      table.string('razorpay_signature', 255).nullable()
      table.integer('amount').unsigned().notNullable() // in paise
      table.string('currency', 10).defaultTo('INR').notNullable()
      table.string('method', 50).nullable() // e.g. upi, card, netbanking, wallet
      table.enum('status', ['captured', 'failed', 'refunded']).defaultTo('captured').notNullable()
      table.string('error_code', 100).nullable()
      table.text('error_description').nullable()
      table.json('raw_response').nullable()
      table.timestamps(true, true)

      // Indexes
      table.index(['user_id', 'status'])
      table.index('razorpay_payment_id')
      table.index('razorpay_order_id')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
