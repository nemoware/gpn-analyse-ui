module.exports = (sequelize, DataTypes) => {
  const DocumType = sequelize.define('docum_type', {
    name: {type: DataTypes.STRING},
    str_id: {type: DataTypes.STRING}
  });
  return DocumType;
};
