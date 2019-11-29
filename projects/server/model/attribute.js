const dictionaries = require('../json/dictionary');

class Attribute {
  constructor(attribute) {
    this.kind = attribute.kind;
    this.type = attribute.type;
    this.dictionaryName = attribute.dictionaryName;
    this.parents = attribute.parents;
    this.show = attribute.show;
    this.children = [];
    this.root = !this.parents;
  }

  toJSON() {
    const result = {
      kind: this.kind,
      type: this.type,
      show: this.show
    };

    if (this.dictionaryName) {
      const dictionary = dictionaries.find(d => d._id === this.dictionaryName);
      if (dictionary) {
        result.values = dictionary.values;
      }
    }

    if (this.children.length > 0) {
      result.children = this.children;
    }

    return result;
  }
}

module.exports = Attribute;
