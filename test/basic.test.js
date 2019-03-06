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

      before(function () {
        return testUtils.dropDb(session);
      });

      before(function () {
        return testUtils.createDb(session);
      });

      it('should insert using view', async () => {
        const { firstName } = await PersonView.query().insert({ firstName: 'test' });
        firstName.should.equal('test');
      });
    });
  });
});
