import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Subscriptions extends BaseSchema {
  protected tableName = 'subscriptions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.integer('plan_id').unsigned().notNullable().references('id').inTable('plans').onDelete('CASCADE')
      table.enum('status', ['active', 'expired', 'cancelled']).defaultTo('active').notNullable()
      table.dateTime('current_period_start', { useTz: true }).notNullable()
      table.dateTime('current_period_end', { useTz: true }).notNullable()
      table.dateTime('cancelled_at', { useTz: true }).nullable()
      table.timestamps(true, true)

      // Index for fast lookup by user and status
      table.index(['user_id', 'status'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
