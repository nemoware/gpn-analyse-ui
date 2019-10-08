var fs = require('fs');
var Request = require('request');
var config = require('../config/app.config');
const db = require('../config/db.config');
const parserConfig = config.parser;
const Document = db.Document;
const Audit = db.Audit;
const AuditStatus = db.AuditStatus;

function readFiles(idAudit, dirname, onFileContent, onError) {
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
        onFileContent(filename, content, idAudit);
      });
    });

    var audit = await Audit.findOne({ _id: idAudit });
    if (audit) {
      audit.status = await AuditStatus.findOne({ name: 'Завершен' });
      audit.save(err => {
        if (err) {
          console.log(err);
        }
      });
    } else {
      console.log('Не найден аудит ID = ' + idAudit);
    }
  });
}

function parser(filename, content, idAudit) {
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
    docum.idAudit = idAudit;
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

exports.auditParser = idAudit => {
  readFiles(idAudit, parserConfig.pathFolder, parser, function(err) {
    throw err;
  });
};
