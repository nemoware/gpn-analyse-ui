const db = require('../config/db.config.js');
const authorization = require('../authorization/authorization');
const Contract = db.contracts;
const TagTypes = db.tag_types;
const DocumTypes = db.docum_types;
const Users = db.users;
const Permissions = db.permissions;
const Roles = db.roles;
const Logs = db.logs;
const auth_ad = require('../authorization/auth.ad');

exports.getContracts = (req, res) => {
  let query = 'SELECT * FROM "contracts" c where 1 = 1';

  if(req.query.docum_type) {
    let str = '';
    var array = JSON.parse(req.query.docum_type);
    for (var s of array)
      str = str.length === 0 ? "'" + s + "'" : str + "," + "'" + s + "'";
    query += ` and ( select count(*) from "docum_tags" tg join "tag_types" tp on tp.id = tg.id_type where tp.field_query = 'docum_type' and tg.id_docum = c.id and tg.value in (${str})) > 0 `;
  }

  if(req.query.name_org)
    query += ` and ( select count(*) from "docum_tags" tg join "tag_types" tp on tp.id = tg.id_type where tp.field_query = 'name_org' and tg.id_docum = c.id and upper(tg.value) like upper('%${req.query.name_org.replace(/"/g,'')}%')) > 0 `;

  if(req.query.date_from)
    query += ` and c.filemtime >= ${req.query.date_from} `;

  if(req.query.date_to)
    query += ` and c.filemtime <= ${req.query.date_to} `;

  if(req.query.sort_by)
    query += ' order by c.' + req.query.sort_by;

  if(req.query.sort_dir)
    query += ' ' + req.query.sort_dir;

  if(req.query.page)
    query += ` OFFSET ${req.query.page*30} LIMIT ${(req.query.page+1)*30}`;

  db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT})
    .then(contract => {
      res.json(contract);
      console.log('get contracts');
    }).catch( err => {
    console.log(err);
    res.status(500).json({msg: "error", details: err});
  });
};

exports.getContractById = (req, res) => {
  Contract.findByPk(req.params.id).then(contract => {
    res.json(contract);
    console.log( 'get id = ' + contract.id);
  }).catch(err => {
    console.log(err);
    res.status(500).json({msg: "error", details: err});
  });
};

exports.getTagTypes = (req, res) => {
  TagTypes.findAll().then(tags => {
    res.json(tags);
    console.log('get tag_types');
  }).catch(err => {
    console.log(err);
    res.status(500).json({msg: "error", details: err});
  });
};

exports.getDocumTypes = (req, res) => {
  DocumTypes.findAll().then(tags => {
    res.json(tags);
    console.log('get docum_types');
  }).catch(err => {
    console.log(err);
    res.status(500).json({msg: "error", details: err});
  });
};

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

  const login = req.session.message;
  console.log('get permissions by ' + login);

  let query = `select
    u.name,
    ARRAY(
    select
    p.name
    from
    permissions p
    join roles r on r.id_permission = p.id
    where 
    r.id_user = u.id
    ) as roles
    from users u 
    where upper(u.login) = upper('${login}')`;

  db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT})
    .then(contract => {
      res.json(contract);
      console.log('get permissions by user ' + login);
      createLog(req.session.message, `User has been logged`);
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

exports.hasPermission = async (req, role) => {
  let login = '';
  let promise = new Promise((resolve, reject) => {

    login = req.session.message;
    let has_role = false;
    if (login.length === 0) return false;
    let query = `select public.f_has_permission ('${login}', '${role}') as HAS `;

    db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT })
      .then(value => {
        if (value[0].has === '1')
          resolve(true);
        else
          resolve(false);
      }).catch(err => {
      console.log(err);
    });
  });
  let result = await promise;
  console.log(`${login} has role ${role} = ${result}`);
  return result;
};

exports.getUsers = (req, res) => {

  this.hasPermission(req, 'ADMINISTRATOR').then( function(response) {
      if(response) {

        createLog(req.session.message, `Requested a list of users`);
        let query = `select u.id, u.login, u.name, u.description,
(SELECT ARRAY(select id_permission from roles where id_user = u.id order by id_permission)) as roles
from users u order by u.id`;

        db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT })
          .then(contract => {
            res.json(contract);
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
    createLog(req.session.message, `Created user ${req.body.login}`);
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
    createLog(req.session.message, `Deleted user ${id}`);
    res.status(200).json( { msg: 'Deleted Successfully -> user Id = ' + id } );
  }).catch(err => {
    console.log(err);
    res.status(500).json({msg: "error", details: err});
  });
};

exports.saveRoles = async (req, res) => {
  const id_user = req.query.id_user;

  for(const role of JSON.parse(req.query.roles)) {
    if(role.status === 'insert') {
      await createRole(req, id_user, role.id);
    }
    else if(role.status === 'delete') {
      await deleteRole(req, id_user, role.id);
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

createRole = (req, id_user, id_permission) =>{
  Roles.create({
    "id_user": Number(id_user),
    "id_permission": Number(id_permission)
  }).then( role => {
    createLog(req.session.message, `Add role ${id_permission} to user ${id_user}`);
    return true;
  }).catch( err => { console.log(err); return false;});
};

deleteRole = (req, id_user, id_permission) =>{
  Roles.destroy({
    where: { id_user: Number(id_user), id_permission: Number(id_permission) }
  }).then( role => {
    createLog(req.session.message, `Remove role ${id_permission} to user ${id_user}`);
    return true;
  }).catch( err => { console.log(err); return false;});
};

createLog = (login, message) => {
  Logs.create({
    "login": login,
    "value": message
  }).then( data => {
    return true;
  }).catch( err => { console.log(err); return false;});
};

exports.getUsersGroup = (req, res) => {
  auth_ad.get_users(req, res);
};
