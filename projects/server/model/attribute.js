class Attribute {
  constructor(attribute) {
    this.kind = attribute.kind;
    this.type = attribute.type;
    this.once = attribute.once;
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
      show: this.show,
      once: this.once,
      dictionaryName: this.dictionaryName
    };

    if (this.children.length > 0) {
      result.children = this.children;
    }

    return result;
  }
}

module.exports = Attribute;
