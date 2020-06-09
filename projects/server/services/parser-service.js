const fs = require('fs-promise');
const request = require('request');
const url = require('../config/config').parser.url;
const db = require('../models');
const Document = db.Document;
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
        audit._id,
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
      for (let document of result.documents) {
        await postDocument(
          document,
          audit._id,
          filename,
          response.code,
          version
        );
      }
    } else {
      await postDocument(result, audit._id, filename, response.code);
    }
  } catch (err) {
    if (err.code !== 'ECONNREFUSED') return logger.logLocalError(err);

    await postDocument(
      {
        documentType: err.code,
        message: 'Parser module is off'
      },
      audit._id,
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

async function postDocument(data, auditId, filename, responseCode, version) {
  if (!data.version) {
    data.version = version;
  }

  let document = new Document({
    auditId: auditId,
    filename: filename,
    parse: data,
    parserResponseCode: responseCode
  });

  try {
    await document.save();
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
