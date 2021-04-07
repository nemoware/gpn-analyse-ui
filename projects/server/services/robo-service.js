const roboServiceUrl = require('../config').parser.roboServiceUrl;
const logger = require('../core/logger');
const request = require('request');

exports.test = async () => {
  try {
    const options = {
      url: `${roboServiceUrl}/status`,
      headers: { 'content-type': 'application/json' }
    };
    const response = await get(options);
    const result = JSON.parse(response.body);
    info(result.version);
  } catch (err) {
    info();
  }
};

function info(version) {
  console.log(`Robot Service`);
  console.log(`Url: ${roboServiceUrl}`);
  console.log(`Status: ${version ? 'on' : 'off'}`);
  if (version) {
    console.log(`Version: ${version}`);
  }
  console.log();
}

exports.postFiles = async (documents, author) => {
  try {
    const options = getOptions(documents, author);
    const fs = require('fs');
    let data = JSON.stringify(options.body, null, 2);
    fs.writeFileSync('test.json', data);
    await post(options);
  } catch (err) {
    logger.log(err);
  }
};

function getOptions(documents, author) {
  let body = {
    documents: documents,
    author: author
  };
  return {
    url: `${roboServiceUrl}/upload_docs`,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  };
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

function get(options) {
  return new Promise((resolve, reject) => {
    request.get(options, (err, response, body) => {
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
