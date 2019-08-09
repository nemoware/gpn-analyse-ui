const env = {
  database: '',
  username: '',
  password: '',
  host: '',
  port: '',
  dialect: '',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
module.exports = env;
