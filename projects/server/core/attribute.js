const documentTypes = require('../json/documentType');

exports.getAttributeList = function(documentTypeName) {
  const attributes = getAttributes(documentTypeName);
  if (attributes) {
    const result = [];
    getList(result, attributes);
    return result;
  }
};

function getList(list, attributes) {
  for (let attribute of attributes) {
    if (attribute.parents && attribute.children) {
      for (let parent of attribute.parents) {
        push(list, parent);
      }

      getList(list, attribute.children);
    } else push(list, attribute);
  }
}

exports.getAttributeTree = function(documentTypeName) {
  const attributes = getAttributes(documentTypeName);
  if (attributes) {
    const result = [];
    setChildren(attributes, result);
    return result;
  }

  return [];
};

function getAttributes(documentTypeName) {
  const documentType = documentTypes.find(t => t._id === documentTypeName);
  if (documentType) return documentType.attributes;
}

function setChildren(attributes, root) {
  for (let attribute of attributes) {
    if (attribute.parents && attribute.children) {
      const level = [];

      for (let parent of attribute.parents) {
        push(level, parent);
      }

      for (let parent of level) {
        parent.children = [];
        setChildren(attribute.children, parent.children);
      }

      for (let child of level) {
        root.push(child);
      }
    } else push(root, attribute);
  }
}

function push(array, attribute) {
  if (typeof attribute === 'string') {
    attribute = {
      kind: attribute,
      type: 'string'
    };
  }
  if (!attribute.type) {
    attribute.type = 'string';
  }
  array.push(attribute);
}
