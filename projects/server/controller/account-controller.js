exports.getUserInfo = async (req, res) => {
  res.send(res.locals.user);
};

exports.getRobotState = (req, res) => {
  res.send({ state: global.robot });
};
