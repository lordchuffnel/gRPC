exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('blogs')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('blogs').insert([
        { author: 'frank', title: 'the blog title', content: 'first blog' },
        { author: 'bill', title: 'super blog title', content: 'first blog' },
        { author: 'steve', title: 'great blog title', content: 'first blog' }
      ]);
    });
};
