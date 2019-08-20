module.exports = (sequelize, DataTypes) => {
  const DocumTag = sequelize.define('docum_tag', {
    id_docum: {type: DataTypes.NUMERIC},
    id_type: {type: DataTypes.NUMERIC},
    value: {type: DataTypes.STRING}
  });
  return DocumTag;
};
