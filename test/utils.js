const Knex = require('knex');
const { ViewModel } = require('../index');

module.exports = {
  testDatabaseConfigs: [
    {
      client: 'postgres',
      connection: {
        host: '127.0.0.1',
        database: 'objection_switch_test',
        user: 'postgres',
        password: 'postgres'
      },
      pool: {
        min: 0,
        max: 10
      }
    },
  ],

  initialize: function (knexConfig) {
    const knex = Knex(knexConfig);
    return {
      config: knexConfig,
      models: createModels(knex),
      knex: knex
    };
  },

  dropDb: async function (session) {
    await session.knex.raw('drop view if exists ??', ['PersonView']);

    await session.knex.schema
      .dropTableIfExists('Person');
  },

  createDb: async function (session) {
    await session.knex.schema.createTable('Person', table => {
      table.bigincrements('id').unsigned().primary();
      table.integer('age');
      table.biginteger('pid').unsigned().references('Person.id').index();
      table.string('firstName');
      table.string('lastName');
      table.string('nickName');
    });

    await session.knex.raw(`
      create view ?? as (
        select * from ??
      );
    `, ['PersonView', 'Person']
    );
  }
};

function createModels(knex) {
  class Person extends ViewModel {
    static get tableName() {
      return 'Person';
    }

    static get relationMappings() {
      return {};
    }
  }

  class PersonView extends ViewModel {
    static get tableName() {
      return 'PersonView';
    }

    static get delegatesWritesTo() {
      return Person;
    }

    static get relationMappings() {
      return {};
    }
  }

  Person.knex(knex);
  return { Person, PersonView };
}
