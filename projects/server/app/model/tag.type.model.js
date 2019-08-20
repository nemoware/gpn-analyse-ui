module.exports = (sequelize, DataTypes) => {
  const TagType = sequelize.define('tag_type', {
    name: {type: DataTypes.STRING},
    name_color: {type: DataTypes.STRING},
    name_class: {type: DataTypes.STRING},
    id_parent: {type: DataTypes.NUMERIC},
  });
  return TagType;
};
