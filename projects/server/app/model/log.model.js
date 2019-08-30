module.exports = (sequelize, DataTypes) => {
  const Logs = sequelize.define('log', {
    login: {type: DataTypes.STRING},
    value: {type: DataTypes.STRING},
    id_event: {type: DataTypes.STRING}
  });
  return Logs;
};
