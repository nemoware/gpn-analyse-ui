const fs = require('fs');
const request = require('request');
const config = require('../config/app.config');
const parserConfig = config.parser;
const db = require('../config/db.config');
const Document = db.Document;
const Audit = db.Audit;
const AuditStatus = db.AuditStatus;

function readFiles(auditId, dirname, onFileContent, onError) {
  fs.readdir(dirname, async function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach(function(filename) {
      fs.readFile(dirname + filename, function(err, content) {
        if (err) {
          onError(err);
          return;
        }
        onFileContent(filename, content, auditId);
      });
    });

    let audit = await Audit.findOne({ _id: auditId });
    if (audit) {
      audit.status = await AuditStatus.findOne({ name: 'В работе' });
      audit.save(err => {
        if (err) {
          console.log(err);
        }
      });
    } else {
      console.log('Не найден аудит ID = ' + auditId);
    }
  });
}

function parse(filename, content, auditId) {
  let base64data = Buffer.from(content, 'binary').toString('base64');
  let extension = filename
    .substring(filename.lastIndexOf('.') + 1)
    .toUpperCase();
  let body = {
    base64Content: base64data,
    documentFileType: extension
  };

  let options = {
    url: parserConfig.url,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  };

  request.post(options, async (error, response, body) => {
    if (error) {
      return console.dir(error);
    }

    let result = JSON.parse(body);
    if (
      'documents' in result &&
      result.documents != null &&
      result.documents.length > 0
    ) {
      let document = result.documents[0];
      document.auditId = auditId;
      document.name = filename;
      let parentId = await postDocument(document);
      for (let i = 1; i < result.documents.length; i++) {
        document = result.documents[i];
        document.parentId = parentId;
        document.auditId = auditId;
        document.name = `${filename} (${i})`;
        await postDocument(document);
      }
    }
  });
}

postDocument = async data => {
  let document = new Document(data);
  try {
    await document.save();
    return document._id;
  } catch (err) {
    console.log(err);
  }
};

exports.parseAudit = auditId => {
  readFiles(auditId, parserConfig.pathFolder, parse, function(err) {
    throw err;
  });
};