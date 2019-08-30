const db = require('../config/db.config.js');
const Events = db.events;
const common = require('./common');

exports.getEvents = (req, res) => {
  Events.findAll().then(permissions => {
    res.json(permissions);
    console.log('get events type');
  }).catch(err => {
    console.log(err);
    res.status(500).json({msg: "error", details: err});
  });
};

exports.getEventsApp = (req, res) => {
  common.hasPermission(req, 'CAEventViewer').then( function(response) {
      if(response) {
        let query = 'SELECT * FROM "logs" c where 1 = 1';

        if(req.query.event_type) {
          let str = '';
          var array = JSON.parse(req.query.event_type);
          for (var s of array)
            str = str.length === 0 ? "'" + s + "'" : str + "," + "'" + s + "'";
          query += ` and c.id_event in (${str}) `;
        }

        if(req.query.login)
          query += ` and upper(c.login) like upper('%${req.query.login.replace(/"/g,'')}%') `;

        if(req.query.date_from)
          query += ` and extract(epoch from c."createdAt") >= ${req.query.date_from} `;

        if(req.query.date_to)
          query += ` and extract(epoch from c."createdAt") <= ${req.query.date_to} `;

        if(req.query.sort_by)
          query += ' order by c."' + req.query.sort_by +'"' ;

        if(req.query.sort_dir)
          query += ' ' + req.query.sort_dir;

        if(req.query.page)
          query += ` OFFSET ${req.query.page*30} LIMIT ${(req.query.page+1)*30}`;

        db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT})
          .then(events => {
            res.json(events);
            common.createLog(req, 'get_events_app',`Requested Application Event Log`);
            console.log('get events');
          }).catch( err => {
          console.log(err);
          res.status(500).json({msg: "error", details: err});
        });
      }
      else
        res.status(500).json({msg: "У Вас нет прав на работу с данным окном!"});
    }, function(error) {
      console.log('Error!', error);
    }
  );
};
