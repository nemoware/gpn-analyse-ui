const db = require('../config/db.config.js');
const Contract = db.contracts;
const TagTypes = db.tag_types;
const DocumTypes = db.docum_types;

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
