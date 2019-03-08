require('chai').should();
const testUtils = require('./utils');

describe('basic', function () {
  testUtils.testDatabaseConfigs.forEach(function(knexConfig) {
    describe(knexConfig.client, function() {
      let session, PersonView;

      before(function () {
        session = testUtils.initialize(knexConfig);
        PersonView = session.models.PersonView;
      });

      before(async function() {
        return testUtils.dropDb(session);
      });

      before(async function () {
        return testUtils.createDb(session);
      });

      it('should insert', async () => {
        const { firstName } = await PersonView.query().insert({ firstName: 'test' });
        firstName.should.equal('test');
      });

      it('should findById', async () => {
        const { id } = await PersonView.query().insert({ firstName: 'test' });
        const { id: foundId } = await PersonView.query().findById(id);
        foundId.should.equal(id);
      });
    });
  });
});
