const db = require('../config/db');
const Document = db.Document;

function getAttributeName(attribute) {
  const subAttributes = attribute.split('/');
  let subAttribute = subAttributes[subAttributes.length - 1];
  const parts = subAttribute.replace(/_/g, '-').split('-');
  if (!Number.isNaN(+parts[parts.length - 1])) {
    parts.pop();
  }
  return parts.join('-');
}

exports.getAttributes = async (req, res) => {
  const type = req.query.type;
  const documents = await Document.find({ 'parse.documentType': type }, null, {
    lean: true
  });
  const results = [];
  for (let document of documents) {
    if (document.analysis && document.analysis.attributes) {
      const docAttributes = document.analysis.attributes;
      for (let attribute in docAttributes) {
        let attributeName = getAttributeName(attribute);
        let result;
        if (results.map(a => a.kind).indexOf(attributeName) < 0) {
          result = {
            kind: attributeName
          };
          results.push(result);
        }

        if (!result) {
          result = results.find(r => r.kind === attributeName);
        }

        let parent = docAttributes[attribute].parent;
        if (parent) {
          const parentName = getAttributeName(parent);
          if (!result.parents) {
            result.parents = [];
          }
          if (result.parents.indexOf(parentName) < 0)
            result.parents.push(parentName);
        }

        if (!result.type) {
          let type = Object.prototype.toString
            .call(docAttributes[attribute].value)
            .split(' ')[1];
          type = type.substring(0, type.length - 1).toLowerCase();
          if (type !== 'null') {
            result.type = type;
          }
        }
      }
    }
  }

  res.send(results);
};

exports.getDocumentAttributes = async (req, res) => {
  const document = await Document.findById(
    req.params.id,
    `analysis.attributes`
  );
  const attributes = [];

  if (document.analysis && document.analysis.attributes) {
    for (let attribute in document.analysis.attributes) {
      attributes.push(attribute);
    }
  }

  res.send(attributes);
};
