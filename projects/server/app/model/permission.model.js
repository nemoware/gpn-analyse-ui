module.exports = (sequelize, DataTypes) => {
  return sequelize.define('permission', {
    name: {type: DataTypes.STRING},
    description: {type: DataTypes.STRING},
  });
};
