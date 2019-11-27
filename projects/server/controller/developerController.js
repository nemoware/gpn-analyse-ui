const fs = require('fs-promise');
const path = require('path');
const logger = require('../core/logger');
const db = require('../config/db.config');
const Audit = db.Audit;
const Document = db.Document;

exports.postAudit = async (req, res) => {
  if (req.body.jsonDirectory) {
    try {
      let audit = new Audit({
        author: req.session.message,
        status: 'Ended',
        subsidiary: {
          name: 'ООО "АЛЬФА-ИНТЕГРАТОР-ИНФОЭНЕРГО"'
        },
        auditStart: new Date(2019, 11, 1),
        auditEnd: new Date(2019, 11, 30),
        createDate: new Date()
      });

      await audit.save();

      let directory = req.body.jsonDirectory;
      const filenames = await fs.readdir(directory);
      for (let filename of filenames) {
        let type;
        if (filename.toLowerCase().indexOf('договор') >= 0) {
          type = 'CONTRACT';
        } else if (filename.toLowerCase().indexOf('протокол') >= 0) {
          type = 'PROTOCOL';
        } else if (filename.toLowerCase().indexOf('устав') >= 0) {
          type = 'CHARTER';
        }

        if (type) {
          try {
            let content = await fs.readFile(path.resolve(directory, filename));
            let json = JSON.parse(content);
            json.analyze_timestamp = new Date();
            let document = new Document({
              auditId: audit._id,
              analysis: json,
              filename: filename,
              parse: {
                documentType: type
              },
              parserResponseCode: 200
            });

            await document.save();
          } catch (err) {
            console.log(err);
          }
        }
      }

      res.status(201).json(audit);
    } catch (err) {
      logger.logError(req, res, err, 500);
    }
  }
};

exports.getAttributes = async (req, res) => {
  const documents = await Document.find(
    { 'parse.documentType': req.query.type },
    `analysis.attributes`
  );
  const attributes = [];
  for (let document of documents) {
    if (document.analysis && document.analysis.attributes) {
      for (let attribute in document.analysis.attributes) {
        if (attributes.indexOf(attribute) < (await 0)) {
          attributes.push(attribute);
        }
      }
    }
  }

  res.send(attributes);
  /*res.send(attributes.map(a => {
    return {
      kind: a,
      type: 'string'
    };
  }));*/
};
