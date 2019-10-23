const fs = require('fs-promise');
const request = require('request-promise');
const config = require('../config/app.config');
const parserConfig = config.parser;
const db = require('../config/db.config');
const Document = db.Document;
const Audit = db.Audit;
const path = require('path');
const logger = require('../core/logger');

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

async function parse(filename, auditId) {
  const content = await fs.readFile(filename);

  let options = getOptions(filename, content);

  try {
    const body = await request.post(options);
    let result = JSON.parse(body);
    if (result.documents && result.documents.length > 0) {
      let parentId = await postDocument(result.documents[0], auditId, filename);
      for (let i = 1; i < result.documents.length; i++) {
        await postDocument(
          result.documents[i],
          auditId,
          `${filename} (${i})`,
          parentId
        );
      }
    }
  } catch (err) {
    let document = {
      documentType: 'PARSE_ERROR'
    };
    await postDocument(document, auditId, filename, null, err.message);
  }
}

postDocument = async (data, auditId, name, parentId, parseError) => {
  let document = new Document(data);
  document.auditId = auditId;
  document.name = name;
  if (parentId) document.parentId = parentId;
  if (parseError) document.parseError = parseError;

  try {
    await document.save();
    return document._id;
  } catch (err) {
    console.log(err);
  }
};

exports.parseAudit = async audit => {
  audit.status = 'Loading';
  await audit.save();

  await parseDirectory(audit.ftpUrl, audit._id);

  audit.status = 'InWork';
  await audit.save();
};

async function parseDirectory(directory, auditId) {
  let filenames = await fs.readdir(directory);
  let promises = [];
  for (let filename of filenames) {
    const stat = await fs.stat(path.join(directory, filename));
    if (stat && stat.isDirectory()) {
      await parseDirectory(path.join(directory, filename), auditId);
    } else {
      promises.push(parse(path.join(directory, filename), auditId));
    }
  }
  await Promise.all(promises);
}
