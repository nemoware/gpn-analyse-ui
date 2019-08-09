module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('tag', {
    name: {type: DataTypes.STRING},
    name_color: {type: DataTypes.STRING},
    name_class: {type: DataTypes.STRING}
  });
  return Tag;
};
