const db = require('../config/db.config.js');
const Contract = db.contracts;
const Tags = db.tags;

exports.getContracts = (req, res) => {
  Contract.findAll().then(contract => {
    res.json(contract);
    console.log('get contracts');
  }).catch(err => {
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

exports.getTags = (req, res) => {
  Tags.findAll().then(tags => {
    res.json(tags);
    console.log('get tags');
  }).catch(err => {
    console.log(err);
    res.status(500).json({msg: "error", details: err});
  });
};


