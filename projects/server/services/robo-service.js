const roboServiceUrl = require('../config').parser.roboServiceUrl;
const logger = require('../core/logger');
const request = require('request');

exports.postFiles = async (documents, author) => {
  try {
    const options = getOptions(documents, author);
    const fs = require('fs');
    let data = JSON.stringify(options.body, null, 2);
    fs.writeFileSync('test.json', data);
    const response = await post(options);
    console.log(response);
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
