const app_conf = require('./app.config.js');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(app_conf.env.database, app_conf.env.username, app_conf.env.password, {
  host: app_conf.env.host,
  dialect: app_conf.env.dialect,
  operatorsAliases: false,
  pool: {
    max: app_conf.env.max,
    min: app_conf.env.pool.min,
    acquire: app_conf.env.pool.acquire,
    idle: app_conf.env.pool.idle
  }
});
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.contracts = require('../model/contract.model.js')(sequelize, Sequelize);
db.tag_types = require('../model/tag.type.model.js')(sequelize, Sequelize);
db.docum_types = require('../model/docum_type')(sequelize, Sequelize);
db.docum_tags = require('../model/docum_tag')(sequelize, Sequelize);
db.permissions = require('../model/permission.model')(sequelize, Sequelize);
db.users = require('../model/user.model')(sequelize, Sequelize);
db.roles = require('../model/role.model')(sequelize, Sequelize);
db.logs = require('../model/log.model')(sequelize, Sequelize);

module.exports = db;
