const fs = require('fs-promise');
const request = require('request-promise');
const config = require('../config/app.config');
const parserConfig = config.parser;
const db = require('../config/db.config');
const Document = db.Document;
const Audit = db.Audit;

async function readFiles(auditId, dirname, onFileContent, onError) {
  let audit = await Audit.findOne({ _id: auditId });
  if (audit) {
    try {
      audit.status = 'Loading';
      await audit.save();

      let filenames = await fs.readdir(audit.ftpUrl);
      for (let filename of filenames) {
        const content = await fs.readFile(audit.ftpUrl + '\\' + filename);
        await onFileContent(filename, content, auditId);
      }

      audit.status = 'InWork';
      await audit.save();
    } catch (err) {
      onError(err);
    }
  } else {
    console.log('Не найден аудит ID = ' + auditId);
  }
}

exports.test = async () => {
  let filename = 'test.docx';
  let data;
  try {
    data = await fs.readFile(`./file/${filename}`);
  } catch (err) {
    console.log(err);
    return;
  }

  let options = getOptions(filename, data);
  try {
    let body = await request.post(options);
    let result = JSON.parse(body);
    info(result.version);
  } catch (err) {
    info();
  }
};

function info(version) {
  console.log(`Document parser`);
  console.log(`Url: ${parserConfig.url}`);
  console.log(`Status: ${version ? 'on' : 'off'}`);
  if (version) {
    console.log(`Version: ${version}`);
  }
  console.log();
}

function getOptions(filename, content) {
  let base64data = Buffer.from(content, 'binary').toString('base64');
  let extension = filename
    .substring(filename.lastIndexOf('.') + 1)
    .toUpperCase();
  let body = {
    base64Content: base64data,
    documentFileType: extension
  };
  return {
    url: `${parserConfig.url}/${parserConfig.method}`,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  };
}

async function parse(filename, content, auditId) {
  let options = getOptions(filename, content);
  await request.post(options, async (error, response, body) => {
    if (error) {
      return console.dir(error);
    }

    let result = JSON.parse(body);
    if (result.documents && result.documents.length > 0) {
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
