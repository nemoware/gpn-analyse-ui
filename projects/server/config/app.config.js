exports.db = {
  name: process.env.GPN_DB_NAME,
  port: process.env.GPN_DB_PORT,
  host: process.env.GPN_DB_HOST
};

exports.ad = {
  options: {
    url: process.env.GPN_AD_URL,
    baseDN: process.env.GPN_AD_BASEDN,
    username: process.env.GPN_AD_USERNAME,
    password: process.env.GPN_AD_PASS
  },
  groupName: process.env.GPN_AD_GROUP_NAME,
  realm: process.env.GPN_AD_REALM,
  on: true,
  login: 'admin'
};

exports.parser = {
  pathFolder: process.env.GPN_DOC_DIRECTORY,
  url: 'http://localhost:8888',
  method: 'document-parser'
};
