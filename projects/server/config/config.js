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
  realm: process.env.GPN_AD_REALM,
  group: process.env.GPN_DEFAULT_GROUP
};

exports.parser = {
  pathFolder: process.env.GPN_DOC_DIRECTORY,
  url: process.env.GPN_PARSER_URL
};
