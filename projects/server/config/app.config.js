exports.db = {
  name: process.env.GPN_DB_NAME,
  port: process.env.GPN_DB_PORT,
  host: process.env.GPN_DB_HOST
};

exports.ad = {
  url: process.env.GPN_AD_URL,
  baseDN: process.env.GPN_AD_BASEDN,
  username: process.env.GPN_AD_USERNAME,
  password: process.env.GPN_AD_PASS,
  groupName: process.env.GPN_AD_GROUP_NAME,
  on: true,
  login: 'admin'
};

exports.parser = {
  pathFolder: 'C:\\WORK\\gpn_docs\\test\\',
  url: 'http://localhost:8888/document-parser'
};
