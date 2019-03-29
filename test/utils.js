const Knex = require('knex');
const { ViewModel } = require('../index');
const path = require('path');
const os = require('os');

module.exports = {
  testDatabaseConfigs: [{
      client: 'sqlite3',
      connection: {
        filename: path.join(os.tmpdir(), 'objection_view_model_test.db')
      },
      useNullAsDefault: true
    },
    {
      client: 'postgres',
      connection: {
        host: '127.0.0.1',
        database: 'objection_view_model_test'
      },
      pool: {
        min: 0,
        max: 10
      }
    }, {
      client: 'mysql',
      connection: {
        host: '127.0.0.1',
        user: 'travis',
        database: 'objection_view_model_test'
      },
      pool: {
        min: 0,
        max: 10
      }
    }
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
      table.biginteger('parentId').unsigned().references('Person.id').index();
      table.biginteger('countryId').unsigned().references('Country.id').index();
      table.string('firstName');
      table.string('lastName');
      table.string('nickName');
    });

    await session.knex.schema.createTable('Animal', table => {
      table.bigincrements('id').unsigned().primary();
      table.biginteger('ownerId').unsigned().references('Person.id').index();
      table.string('name');
    });

    await session.knex.schema.createTable('Country', table => {
      table.bigincrements('id').unsigned().primary();
      table.string('name');
    });

    await session.knex.raw(`
      create view ?? as
      select * from ??
      ;
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

  class Animal extends ViewModel {
    static get tableName() {
      return 'Animal';
    }

    static get relationMappings() {
      return {
        owner: {
          relation: objection.BelongsToOneRelation,
          modelClass: Person,
          join: {
            from: 'Animal.ownerId',
            to: 'PersonView.id'
          }
        }
      };
    }
  }

  class Country extends ViewModel {
    static get tableName() {
      return 'Country';
    }

    static get relationMappings() {
      return {
        people: {
          relation: objection.HasManyRelation,
          modelClass: Person,
          join: {
            from: 'Country.id',
            to: 'PersonView.countryId'
          }
        }
      };
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
      return {
        pets: {
          relation: objection.HasManyRelation,
          modelClass: Animal,
          join: {
            from: 'PersonView.id',
            to: 'Animal.ownerId'
          }
        },

        country: {
          relation: objection.BelongsToOneRelation,
          modelClass: Person,
          join: {
            from: 'PersonView.countryId',
            to: 'Country.id'
          }
        }
      };
    }
  }

  Person.knex(knex);
  PersonView.knex(knex);
  Animal.knex(knex);
  Country.knex(knex);
  return { Person, PersonView };
}
