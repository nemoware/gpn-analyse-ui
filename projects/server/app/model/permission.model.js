module.exports = (sequelize, DataTypes) => {
  return sequelize.define('permission', {
    app_page : {type: DataTypes.STRING},
    description: {type: DataTypes.STRING}
  });
};
