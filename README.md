[![Build Status](https://travis-ci.org/jeff3yan/objection-view-model.svg?branch=master)](https://travis-ci.org/jeff3yan/objection-view-model)

# What is objection-view-model

A model to point reads and writes to the tables/views of your choice. Use a SQL view for filtering or aggregation, but write into the main table.

# Usage

```js
const { ViewModel } = require('objection-view-model');

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
```