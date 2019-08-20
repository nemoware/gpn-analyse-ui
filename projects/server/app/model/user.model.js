module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user', {
    login: {type: DataTypes.STRING},
    name: {type: DataTypes.STRING},
    description: {type: DataTypes.STRING},
  });
};
