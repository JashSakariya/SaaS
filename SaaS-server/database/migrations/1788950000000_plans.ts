import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Plans extends BaseSchema {
  protected tableName = 'plans'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 100).notNullable()
      table.string('slug', 100).notNullable().unique()
      table.text('description').nullable()
      table.integer('price').unsigned().notNullable() // Price in paise (e.g. 49900 = ₹499)
      table.string('currency', 10).defaultTo('INR').notNullable()
      table.enum('billing_cycle', ['monthly', 'yearly']).defaultTo('monthly').notNullable()
      table.integer('duration_days').unsigned().defaultTo(30).notNullable()
      table.json('features').notNullable() // JSON array of feature strings
      table.boolean('is_popular').defaultTo(false).notNullable()
      table.boolean('is_active').defaultTo(true).notNullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
