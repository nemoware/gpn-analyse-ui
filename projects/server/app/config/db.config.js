const env = require('./env.js');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(env.database, env.username, env.password, {
  host: env.host,
  dialect: env.dialect,
  operatorsAliases: false,
  pool: {
    max: env.max,
    min: env.pool.min,
    acquire: env.pool.acquire,
    idle: env.pool.idle
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

module.exports = db;
