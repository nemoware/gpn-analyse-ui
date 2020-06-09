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
  principal: process.env.GPN_AD_PRINCIPAL,
  groups: {
    admin: process.env.GPN_ADMIN_GROUP,
    audit: process.env.GPN_AUDIT_GROUP,
    event: process.env.GPN_EVENT_GROUP
  }
};

exports.parser = {
  pathFolder: process.env.GPN_DOC_DIRECTORY,
  url: process.env.GPN_PARSER_URL
};
