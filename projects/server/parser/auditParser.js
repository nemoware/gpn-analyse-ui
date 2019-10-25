const fs = require('fs-promise');
const request = require('request');
const config = require('../config/app.config');
const parserConfig = config.parser;
const db = require('../config/db.config');
const Document = db.Document;
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
    let response = await post(options);
    let result = JSON.parse(response.body);
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
  let extension = path
    .extname(filename)
    .substring(1)
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

async function parse(root, filename, auditId) {
  const content = await fs.readFile(path.join(root, filename));

  let options = getOptions(filename, content);

  try {
    const response = await post(options);
    const result = JSON.parse(response.body);
    const version = result.version;
    if (result.documents) {
      for (let document of result.documents) {
        await postDocument(document, auditId, filename, response.code, version);
      }
    } else {
      await postDocument(result, auditId, filename, response.code);
    }
  } catch (err) {
    logger.logLocalError(err);
  }
}

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

  await parseDirectory(audit.ftpUrl, audit._id);

  audit.status = 'InWork';
  await audit.save();
};

async function parseDirectory(directory, auditId) {
  let filePaths = await getPaths(directory);
  let promises = [];
  for (let filePath of filePaths) {
    promises.push(parse(directory, filePath, auditId));
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
    for (let part of pathParts) {
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
      let directory = array.find(e => e.name === part);
      if (!directory) {
        //если нет, добавляем файл в текущий массив файлов
        file = {
          name: part
        };
        if (fileObject.error) {
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
