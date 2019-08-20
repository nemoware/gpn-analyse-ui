const env = {
  database: 'contract',
  username: 'postgres',
  password: 'ZAQ12ws',
  host: 'bm-dev.infoenergo.loc',
  port: '5432',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
module.exports = env;
