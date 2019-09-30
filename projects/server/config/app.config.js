const db = {
  name: process.env.GPN_DB_NAME,
  port: process.env.GPN_DB_PORT,
  host: process.env.GPN_DB_HOST
};

const ad = {
  url: process.env.GPN_AD_URL,
  baseDN: process.env.GPN_AD_BASEDN,
  username: process.env.GPN_AD_USERNAME,
  password: process.env.GPN_AD_PASS
};

const group_name = process.env.GPN_NAME_GROUP_AD;

module.exports = { db, ad, group_name };
