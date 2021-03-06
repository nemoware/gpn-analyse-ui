const fs = require('fs-promise');
const request = require('request');
const url = require('../config').parser.url;
const template = require('../config').conclusion.template;
const { Document } = require('../models');
const path = require('path');
const logger = require('../core/logger');

exports.test = async () => {
  const filename = 'test.docx';
  const docPath = path.join(__dirname, '..', 'file', filename);

  try {
    const data = await fs.readFile(docPath);
    const options = getOptions(filename, data);
    const response = await post(options);
    const result = JSON.parse(response.body);
    info(result.version);
  } catch (err) {
    info();
  }
};

function info(version) {
  console.log(`Document parser`);
  console.log(`Url: ${url}`);
  console.log(`Status: ${version ? 'on' : 'off'}`);
  if (version) {
    console.log(`Version: ${version}`);
  }
  console.log();
}

function getOptions(filename, content) {
  let base64data = Buffer.from(content, 'binary').toString('base64');
  let extension = path
    .extname(filename)
    .substring(1)
    .toUpperCase();
  let body = {
    base64Content: base64data,
    documentFileType: extension
  };
  return {
    url: `${url}/document-parser`,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  };
}

async function parse(root, filename, audit) {
  let options;
  try {
    const content = await fs.readFile(path.join(root, filename));
    options = getOptions(filename, content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await postDocument(
        {
          documentType: err.code,
          message: 'File not found'
        },
        audit,
        filename,
        0
      );
      return;
    } else {
      logger.logLocalError(err);
    }
  }

  try {
    const response = await post(options);
    const result = JSON.parse(response.body);
    const version = result.version;
    if (result.documents) {
      for (let i = 0; i < result.documents.length; i++) {
        let doc = null;
        const document = result.documents[i];
        if (document.documentType === 'ANNEX') {
          for (let j = i - 1; j >= 0; j--) {
            const contract = result.documents[j];
            if (contract.documentType === 'CONTRACT') {
              doc = await Document.findOne({
                auditId: audit._id,
                filename: filename
              });
            }
          }
        }
        await postDocument(
          document,
          audit,
          filename,
          response.code,
          version,
          doc
        );
      }
    } else {
      await postDocument(result, audit, filename, response.code);
    }
  } catch (err) {
    if (err.code !== 'ECONNREFUSED') return logger.logLocalError(err);

    await postDocument(
      {
        documentType: err.code,
        message: 'Parser module is off'
      },
      audit,
      filename,
      504
    );
  }
}

exports.parse = parse;

function post(options) {
  return new Promise((resolve, reject) => {
    request.post(options, (err, response, body) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          code: response.statusCode,
          body: body
        });
      }
    });
  });
}

async function postDocument(data, audit, filename, responseCode, version, doc) {
  if (!data.version) {
    data.version = version;
  }

  const document = new Document({
    filename: filename,
    parse: data,
    parserResponseCode: responseCode
  });

  if (data.documentType === 'ANNEX') {
    audit.links.push({
      fromId: document._id,
      toId: doc._id,
      type: 'parser'
    });
  }

  if (data.documentType !== 'CHARTER') {
    document.auditId = audit._id;
  }

  try {
    await document.save();
    if (data.documentType === 'CHARTER') {
      audit.charters.push(document._id);
    }
  } catch (err) {
    console.log(err);
  }
}

exports.parseAudit = async audit => {
  audit.status = 'Loading';
  await audit.save();

  await parseDirectory(audit);

  await this.setResult(audit);
};

exports.setResult = async audit => {
  let count = await Document.countDocuments({
    auditId: audit._id,
    parserResponseCode: 504
  });
  if (count) {
    audit.status = 'LoadingFailed';
  } else {
    count = await Document.countDocuments({
      auditId: audit._id,
      parserResponseCode: 200
    });
    if (audit.charters) count += audit.charters.length;
    audit.status = 'InWork';
    audit.checkedDocumentCount = count;
  }
  await audit.save();
};

async function parseDirectory(audit) {
  const directory = audit.ftpUrl;
  let filePaths = await getPaths(directory);
  let promises = [];
  for (let filePath of filePaths) {
    promises.push(parse(directory, filePath, audit));
  }
  await Promise.all(promises);
}

async function parseFile(charter) {
  const url = charter.ftpUrl;
  const filename = path.basename(url);
  let options;
  try {
    const content = await fs.readFile(url);
    options = getOptions(filename, content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      charter.parse = {
        documentType: err.code,
        message: 'File not found'
      };
      charter.responseCode = 0;
      charter.filename = filename;
      await charter.save();
      return;
    } else {
      logger.logLocalError(err);
    }
  }

  try {
    const response = await post(options);
    const result = JSON.parse(response.body);
    if (result.documents) charter.parse = result.documents[0];
    charter.filename = filename;
    charter.parserResponseCode = response.code;
  } catch (err) {
    if (err.code !== 'ECONNREFUSED') return logger.logLocalError(err);
    charter.parse = {
      documentType: err.code,
      message: 'Parser module is off'
    };
    charter.filename = filename;
    charter.parserResponseCode = 504;
  }
}

exports.parseFile = parseFile;

async function getPaths(directory, root) {
  if (!root) {
    root = directory;
  }
  let filenames = await fs.readdir(directory);
  let result = [];
  for (let filename of filenames) {
    const stat = await fs.stat(path.join(directory, filename));
    if (stat && stat.isDirectory()) {
      const subdirectory = await getPaths(path.join(directory, filename), root);
      result = result.concat(subdirectory);
    } else {
      result.push(path.relative(root, path.join(directory, filename)));
    }
  }
  return result;
}

exports.getPaths = getPaths;

exports.getFiles = fileObjects => {
  let files = [];
  for (let fileObject of fileObjects) {
    //Получаем части пути (последовательность директорий, и последний элемент - сам файл)
    const pathParts = fileObject.filename.split(path.sep);
    let file,
      array = files;
    for (let i = 0; i < pathParts.length; i++) {
      //если file != null, значит это директория
      if (file) {
        //в таком случае добавляем массив файлов
        if (!file.files) {
          file.files = [];
        }
        //и заменяем им текущий массив array
        array = file.files;
      }
      //проверяем, добавлен ли уже элемент с таким именем (если да - то это директория)
      let directory = array.find(e => e.name === pathParts[i]);
      if (!directory) {
        //если нет, добавляем файл в текущий массив файлов
        file = {
          name: pathParts[i]
        };
        if (i === pathParts.length - 1 && fileObject.error) {
          file.error = fileObject.error;
        }
        array.push(file);
      } else {
        file = directory;
      }
    }
  }

  return files;
};

async function exportConclusion(
  subsidiaryName,
  createDate,
  auditStart,
  auditEnd,
  violations,
  conclusion
) {
  const body = {
    base64Template: template,
    subsidiaryName: subsidiaryName,
    auditDate: createDate,
    violations: violations,
    auditStart: auditStart,
    auditEnd: auditEnd,
    intro: conclusion.intro,
    shortSummary: conclusion.shortSummary,
    corporateStructure1: conclusion.corporateStructure1,
    corporateStructure2: conclusion.corporateStructure2,
    results1: conclusion.results1,
    results2: conclusion.results2,
    strengths: conclusion.strengths,
    disadvantages: conclusion.disadvantages,
    risks: conclusion.risks,
    recommendations: conclusion.recommendations,
    result1: conclusion.result1,
    result2: conclusion.result2
  };

  // const fs = require('fs');
  // let data = JSON.stringify(violations, null, 2);
  // fs.writeFileSync('test.json', data);

  const options = {
    url: `${url}/document-generator/conclusion`,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  };
  let response = {};
  try {
    response = await post(options);
  } catch (err) {
    if (err.code !== 'ECONNREFUSED') return logger.logLocalError(err);
    charter.parse = {
      documentType: err.code,
      message: 'Parser module is off'
    };
  }
  return JSON.parse(response.body);
}

exports.exportConclusion = exportConclusion;
