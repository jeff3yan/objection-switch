const { Model } = require('objection');

class ViewQueryBuilder extends Model.QueryBuilder {
  execute (...rest) {
    if (this.isFindQuery()) {
      return super.execute(...rest);
    }
    else {
      const modelClass = this.modelClass();
      const delegatesWritesTo = modelClass.delegatesWritesTo;
      if (modelClass === delegatesWritesTo) {
        return super.execute(...rest);
      }
      else {
        return delegatesWritesTo.query()
          .childQueryOf(this)
          .copyFrom(this)
          .execute(...rest);
      }
    }
  }
}

module.exports.ViewQueryBuilder = ViewQueryBuilder;