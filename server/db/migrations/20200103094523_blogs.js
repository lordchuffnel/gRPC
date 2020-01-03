
exports.up = function(knex) {
  return knex.schema.createTable('blogs', function(table) {
    table.increments();
    table.string('author').notNullable()
    table.string('title').notNullable()
    table.string('content').notNullable()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('blogs')
};
