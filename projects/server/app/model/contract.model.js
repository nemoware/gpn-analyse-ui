module.exports = (sequelize, DataTypes) => {
  const Contract = sequelize.define('contract', {
    json_name_new: {type: DataTypes.STRING},
    json_value: {type: DataTypes.STRING},
    json_path: {type: DataTypes.STRING},
    dtc: {type: DataTypes.DATE},
    id_type: {type: DataTypes.STRING},
    filename: {type: DataTypes.STRING},
    short_filename: {type: DataTypes.STRING},
    checksum:  {type: DataTypes.NUMBER},
    filemtime:  {type: DataTypes.NUMBER}
  });
  return Contract;
};
