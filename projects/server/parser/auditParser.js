var fs = require('fs');
var Request = require('request');
var config = require('../config/app.config');
const db = require('../config/db.config');
const parserConfig = config.parser;
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

    var audit = await Audit.findOne({ _id: auditId });
    if (audit) {
      audit.status = await AuditStatus.findOne({ name: 'Завершен' });
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

function parser(filename, content, auditId) {
  var base64data = Buffer.from(content, 'binary').toString('base64');
  var body = {
    base64Content: base64data,
    documentFileType: 'DOCX'
  };

  var options = {
    url: parserConfig.url,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  };

  Request.post(options, (error, response, body) => {
    if (error) {
      return console.dir(error);
    }

    var docum = JSON.parse(body);
    docum.name = filename;
    docum.auditId = auditId;
    postDocument(docum);
  });
}

postDocument = async data => {
  let document = new Document(data);
  document.save(async err => {
    if (err) {
      console.log(err);
    }
  });
};

exports.auditParser = auditId => {
  readFiles(auditId, parserConfig.pathFolder, parser, function(err) {
    throw err;
  });
};
