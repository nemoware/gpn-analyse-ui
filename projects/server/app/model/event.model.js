module.exports = (sequelize, DataTypes) => {
  const Events = sequelize.define('event', {
    description: {type: DataTypes.STRING}
  });
  return Events;
};
