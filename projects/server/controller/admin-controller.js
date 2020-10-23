const roles = require('../json/role');
const logger = require('../core/logger');
const adService = require('../services/ad-service');
const { Group } = require('../models');

exports.getADGroups = async (req, res) => {
  try {
    const groups = await adService.getGroups(req.query.filter);
    const appGroups = await Group.find({}, 'distinguishedName', { lean: true });
    res.send(
      groups.filter(
        g =>
          !appGroups.map(a => a.distinguishedName).includes(g.distinguishedName)
      )
    );
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getAppGroups = async (req, res) => {
  try {
    let where = {};
    const filter = req.query.filter;
    if (filter) {
      where.cn = {
        $regex: `.*${filter}.*`,
        $options: 'i'
      };
    }

    const groups = await Group.find(where);
    res.send(groups);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.updateGroup = async (req, res) => {
  const id = req.body._id;

  try {
    const group = await Group.findById(id);
    if (!group) return res.status(404).send(`No group found with id = ${id}`);

    group.roles = req.body.roles;

    await group.save();
    await logger.log(
      req,
      res,
      'Обновление прав группы',
      `Роли ${group.target} назначены права "${group.roles
        .map(r => r.name)
        .join('", "')}"`
    );

    res.send(group);
  } catch (err) {
    logger.logError(req, res, err, 500);
  }
};

exports.getRoles = (req, res) => res.send(roles);
