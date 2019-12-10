const db = require('../config/db.config');
const Document = db.Document;

exports.getAttributes = async (req, res) => {
  const documents = await Document.find(
    { 'parse.documentType': req.query.type },
    `analysis.attributes`
  );
  const attributes = [];
  for (let document of documents) {
    if (document.analysis && document.analysis.attributes) {
      for (let attribute in document.analysis.attributes) {
        const subAttributes = attribute.split('/');
        for (let i = 0; i < subAttributes.length; i++) {
          const level = i + 1;
          let subAttribute = subAttributes[i];
          const parts = subAttribute.split('-');
          if (!Number.isNaN(+parts[parts.length - 1])) {
            parts.pop();
          }
          subAttribute = parts.join('-');
          if (attributes.map(a => a.kind).indexOf(subAttribute) < 0) {
            attributes.push({
              kind: subAttribute,
              type: 'string',
              level
            });
          }
        }
      }
    }
  }

  res.send(attributes);
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
