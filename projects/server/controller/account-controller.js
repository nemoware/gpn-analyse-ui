exports.getUserInfo = async (req, res) => {
  res.send(res.locals.user);
};
