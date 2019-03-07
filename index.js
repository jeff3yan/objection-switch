const { Model } = require('objection');

class ViewQueryBuilder extends Model.QueryBuilder {
  execute (...rest) {
    if (this.isFind()) {
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
          .copyFrom(this, true)
          .execute(...rest);
      }
    }
  }
}

class ViewModel extends Model {
  static get delegatesWritesTo () {
    return this;
  }

  static get QueryBuilder () {
    return ViewQueryBuilder;
  }
}

module.exports = { ViewModel, ViewQueryBuilder };