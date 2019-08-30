const db = require('../config/db.config.js');
const authorization = require('../authorization/authorization');
const common = require('./common');
const auth_ad = require('../authorization/auth.ad');

const Users = db.users;
const Permissions = db.permissions;
const Roles = db.roles;

exports.getPermissions = (req, res) => {
  Permissions.findAll().then(permissions => {
    res.json(permissions);
    console.log('get permissions');
  }).catch(err => {
    console.log(err);
    res.status(500).json({msg: "error", details: err});
  });
};

exports.getPermissionsByUser = (req, res) => {

  const login = JSON.parse(req.session.message).login;
  let query = `select
    p.id as name,
    p.app_page,
    p.description
    from users u
    join roles r on r.id_user = u.id
    join permissions p on p.id = r.id_permission 
    where upper(u.login) = upper('${login}')`;

  db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT})
    .then(role => {
      const name = JSON.parse(req.session.message).displayName;;
      res.json( { name: name,  roles : role });

      common.createLog(req, 'login', `User Authorization`);
      console.log('get permissions');
    }).catch( err => {
    console.log(err);
    res.status(500).json({msg: "error", details: err});
  });

};

exports.getPermissionsByUserID = (req, res) => {
  const id = req.query.id;
  let query = `select id_permission from roles r where r.id_user = ${id}`;
  db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT})
    .then(contract => {
      res.json(contract);
      console.log('get permissions by user id = ' + id);
    }).catch( err => {
    console.log(err);
    res.status(500).json({msg: "error", details: err});
  });
};

exports.gerUsers = (req, res) => {
  common.hasPermission(req, 'CAAdministrator').then( function(response) {
      if(response) {
        let query = `select u.id, u.login, u.name, u.description,
(SELECT ARRAY(select id_permission from roles where id_user = u.id order by id_permission)) as roles
from users u order by u.id`;

        db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT })
          .then(users => {
            res.json(users);
            common.createLog(req, 'get_list_user', `Request a list of registered users of the application`);
            console.log('get users');
          }).catch(err => {
          console.log(err);
          res.status(500).json({ msg: "error", details: err });
        });
      }
      else
        res.status(500).json({msg: "У Вас нет прав на работу с данным окном!"});
    }, function(error) {
      console.log('Error!', error);
    }
  );
};

exports.createUser = (req, res) => {
  Users.create({
    "login": req.body.login,
    "name": req.body.name,
    "description": req.body.description
  }).then(user => {
    res.json(user);
    common.createLog(req, 'add_user',`Add user ${req.body.login}`);
    console.log('create users ' + user.id);
  }).catch(err => {
    console.log(err);
    res.status(500).json({msg: "error", details: err});
  });
};

exports.updateUser = (req, res) => {
  const id = req.query.id;
  Users.update( req.body,
    {
      where: {id: id} }).then(() => {
    console.log("Updated Successfully -> Users Id = " + id);

    Roles.destroy({
      where: { id_user: id }
    });

    for (const r of req.body.roles){
      Roles.create({
        "id_user": id,
        "id_permission": r
      });
    }

    res.status(200).json( { mgs: "Updated Successfully -> Users Id = " + id } );

  }).catch(err => {
    console.log(err);
    res.status(500).json({msg: "error", details: err});
  });
};

exports.deleteUser = (req, res) => {
  const id = req.query.id;
  Users.destroy({
    where: { id: id }
  }).then(() => {
    console.log('Deleted Successfully -> user Id = ' + id);
    common.createLog(req, 'delete_user', `Delete user ${id}`);
    res.status(200).json( { msg: 'Deleted Successfully -> user Id = ' + id } );
  }).catch(err => {
    console.log(err);
    res.status(500).json({msg: "error", details: err});
  });
};

exports.saveRoles = async (req, res) => {
  const id_user = req.query.id_user;
  result = true;
  for(const role of JSON.parse(req.query.roles)) {
    if(role.status === 'insert') {
      await createRole(req, id_user, role.id, result);
      if(!result) { res.status(500).json({msg: "error"}); }
    }
    else if(role.status === 'delete') {
      await deleteRole(req, id_user, role.id, result);
      if(!result) { res.status(500).json({msg: "error"}); }
    }
  }

  let query = `select ARRAY(select id_permission as roles from roles r where r.id_user = ${id_user}) as roles`;
  db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT})
    .then(roles => {
      res.json(roles);
      console.log('get permissions by user id = ' + id_user);
    }).catch( err => {
    console.log(err);
    res.status(500).json({msg: "error", details: err});
  });
};

createRole = (req, id_user, id_permission, result) => {
  Roles.create({
    "id_user": Number(id_user),
    "id_permission": id_permission
  }).then( role => {
    common.createLog(req, 'add_role', `Give role ${id_permission} to user ${id_user}`);
    result = true;
  }).catch( err => { console.log(err); result = false;});
};

deleteRole = (req, id_user, id_permission, result) =>{
  Roles.destroy({
    where: { id_user: Number(id_user), id_permission: id_permission }
  }).then( role => {
    common.createLog(req, 'delete_role', `Delete role ${id_permission} from user ${id_user}`);
    result = true;
  }).catch( err => { console.log(err); result = false;});
};

exports.getUsersGroup = (req, res) => {
  common.hasPermission(req, 'CAAdministrator').then( function(response) {
      if(response) {
        common.createLog(req, 'get_list_user', `Request group user list`);
        auth_ad.get_users(req, res);
      }
      else
        res.status(500).json({msg: "У Вас нет прав на работу с данным окном!"});
    }, function(error) {
      console.log('Error!', error);
    }
  );
};
