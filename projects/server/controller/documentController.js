const db = require('../config/db.config');
const logger = require('../core/logger');
const Document = db.Document;
const Audit = db.Audit;
const Link = db.Link;
const documentTypes = require('../json/documentType');

const documentFields = `filename
parse.documentDate
parse.documentType
parse.documentNumber
user
state
analysis.analyze_timestamp
analysis.version
analysis.warnings
`;

exports.getDocuments = async (req, res) => {
  if (!req.query.auditId) {
    let err = 'Can not find documents: auditId is null';
    logger.logError(req, res, err, 400);
    return;
  }

  try {
    let include;
    if (req.query.full === 'false') {
      include = documentFields + `analysis.attributes`;
    }

    let documents = await Document.find(
      { auditId: req.query.auditId, parserResponseCode: 200 },
      include,
      { lean: true }
    );

    documents = documents.map(d => {
      // TODO: remove this weirdest mapping!
      let document = {
        filename: d.filename,
        state: d.state,
        documentDate: d.parse.documentDate,
        documentType: d.parse.documentType,
        documentNumber: d.parse.documentNumber,
        _id: d._id
      };
      if (d.analysis && d.analysis.attributes) {
        if (d.user) {
          document.user = d.user;
        } else {
          document.analysis = d.analysis;
        }
      }
      return document;
    });

    res.status(200).json(documents);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getDocument = async (req, res) => {
  try {
    if (!req.query.id) {
      let err = `Can not find document because id is null`;
      logger.logError(req, res, err, 400);
      return;
    }

    let document = await Document.findOne(
      { _id: req.query.id, parserResponseCode: 200 },
      documentFields + `analysis auditId`
    ).lean();

    if (document) {
      logger.log(req, res, 'Просмотр документа');

      let audit = await Audit.findOne(
        { _id: document.auditId },
        `subsidiary.name auditStart auditEnd status -_id`
      ).lean();

      if (audit) {
        audit.subsidiaryName = audit.subsidiary.name;
        delete audit.subsidiary;

        document.documentDate = document.parse.documentDate;
        document.documentType = document.parse.documentType;
        document.documentNumber = document.parse.documentNumber;
        document.audit = audit;
        delete document.parse;

        if (document.user) {
          delete document.analysis.attributes;
        }

        document.wrappedText = wrapWords(
          document.analysis.tokenization_maps.words,
          document.analysis.normal_text
        );

        res.status(200).json(document);
      } else {
        let err = `Can not find audit with id ${document.auditId}`;
        logger.logError(req, res, err, 404);
      }
    } else {
      let err = `Can not find document with id ${req.query.id}`;
      logger.logError(req, res, err, 404);
    }
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

function wrapWords(words, normal_text) {
  let result = normal_text;
  for (let i = words.length - 1; i >= 0; i--) {
    const word = normal_text.slice(words[i][0], words[i][1]);
    result =
      result.slice(0, words[i][0]) +
      `<span id="span_${i}" >` +
      word +
      '</span>' +
      result.slice(words[i][1]);
  }
  return '<span id="top"></span>' + result + '<span id ="foot"></span>';
}

exports.updateDocument = async (req, res) => {
  let document = await Document.findOne({ _id: req.query._id });
  if (!document) {
    let err = 'Document not found';
    logger.logError(req, res, err, 404);
    return;
  }

  document.user.attributes = req.body.user;
  document.user.author = req.session.message;
  document.user.updateDate = new Date();

  try {
    await document.save();
    logger.log(req, res, 'Изменение документа');
    res.status(200).json(document);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getAttributes = async (req, res) => {
  if (!req.query.name) {
    let err = `Can not find attributes because type name is null`;
    logger.logError(req, res, err, 400);
    return;
  }
  try {
    let documentType = documentTypes.find(l => l.type === req.query.name);
    if (documentType) {
      const root = [];
      const attributes = documentType.attributes;
      setChildren(attributes, root);

      res.send(root);
    } else {
      let err = `Can not find document type with name ${req.query.name}`;
      logger.logError(req, res, err, 404);
    }
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

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

exports.getLinks = async (req, res) => {
  if (!req.query.documentId) {
    let err = `Can not get links for document because documentId is null`;
    logger.logError(req, res, err, 400);
    return;
  }

  const documentId = req.query.documentId;

  try {
    let linksFrom = await Link.find({ fromId: documentId }, `toId`, {
      lean: true
    });
    let linksTo = await Link.find({ toId: documentId }, `fromId`, {
      lean: true
    });

    let links = linksFrom.concat(linksTo);

    let documents = [];
    for (let link of links) {
      let documentId = link.toId ? link.toId : link.fromId;
      let document = await Document.findOne(
        {
          _id: documentId,
          parserResponseCode: 200
        },
        `filename parse.documentDate parse.documentType parse.documentNumber`
      ).lean();

      document.documentDate = document.parse.documentDate;
      document.documentType = document.parse.documentType;
      document.documentNumber = document.parse.documentNumber;
      document.linkId = link._id;
      delete document.parse;

      documents.push(document);
    }

    res.status(200).json(documents);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.postLink = async (req, res) => {
  try {
    let link = new Link(req.body);
    await link.save();
    res.status(201).json(link);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.updateLink = async (req, res) => {
  let link = await Link.findOne({ _id: req.body._id });
  if (!link) {
    let err = 'Link not found';
    logger.logError(req, res, err, 404);
    return;
  }

  try {
    await Link.replaceOne({ _id: link._id }, req.body);
    res.status(200).send();
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.deleteLink = async (req, res) => {
  if (!req.query.id) {
    let msg = 'Cannot delete link because id is null';
    logger.logError(req, res, msg, 400);
    return;
  }

  try {
    await Link.deleteOne({ _id: req.query.id });
    res.status(200).send();
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getDocumentsByType = async (req, res) => {
  if (!req.query.auditId) {
    let err = 'Can not find documents: auditId is null';
    logger.logError(req, res, err, 400);
    return;
  }

  if (!req.query.type) {
    let err = 'Can not find documents: type is null';
    logger.logError(req, res, err, 400);
    return;
  }

  try {
    let documents = await Document.find(
      {
        auditId: req.query.auditId,
        'parse.documentType': req.query.type,
        parserResponseCode: 200
      },
      `parse.documentDate
    filename
    parse.documentNumber`,
      { lean: true }
    );

    documents = documents.map(d => {
      return {
        filename: d.filename,
        documentDate: d.parse.documentDate,
        documentType: d.parse.documentType,
        documentNumber: d.parse.documentNumber,
        _id: d._id
      };
    });

    res.status(200).json(documents);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};
