import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CreateUserTablePropers extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {

      table.string('name', 100).notNullable()

      table.string('email', 255)
        .unique()
        .notNullable()

      table.string('number', 15)
        .notNullable()

      table.enum('gender', [
        'male',
        'female',
        'other'
      ]).notNullable()

      table.date('date_of_birth')
        .notNullable()

      table.string('password', 255)
        .notNullable()

    })
  }
  public async down () {
    this.schema.alterTable(this.tableName, (table) => {

      table.dropColumn('name')
      table.dropColumn('email')
      table.dropColumn('number')
      table.dropColumn('gender')
      table.dropColumn('date_of_birth')
      table.dropColumn('password')

    })
  }
}
