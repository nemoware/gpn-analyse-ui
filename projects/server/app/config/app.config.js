const db = {
  database: process.env.GPN_DB_NAME,
  username: process.env.GPN_DB_USER,
  password: process.env.GPN_DB_PASS,
  host: process.env.GPN_DB_HOST,
  port: '5432',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

const ad = {
  "url": process.env.GPN_AD_URL,
  "baseDN": process.env.GPN_AD_BASEDN,
  "username": process.env.GPN_AD_USERNAME,
  "password": process.env.GPN_AD_PASS
};

const group_name = process.env.GPN_NAME_GROUP_AD;

module.exports = { db, ad, group_name };
