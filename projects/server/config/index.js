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

exports.jwt = {
  options: {
    secretOrKey: process.env.GPN_JWT_SECRET
  },
  expiresIn: process.env.GPN_JWT_EXPIRES_IN || '1h'
};

exports.conclusion = {
  logo:
    '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',
  template:
    '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'
};
