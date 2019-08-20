module.exports = (sequelize, DataTypes) => {
  return sequelize.define('role', {
    id_user: {type: DataTypes.NUMERIC},
    id_permission: {type: DataTypes.NUMERIC}
  });
};
