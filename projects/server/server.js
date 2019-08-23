const path = require('path');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const routes = require('./app/route/contract.route');
const moment = require('moment-timezone');
const db = require('./app/config/db.config.js');
const fs = require('fs');
const morgan = require('morgan');
const auth_bd = require('./app/authorization/authorization');
const auth_ad = require('./app/authorization/auth.ad');
const uuid = require('uuid/v4');
const session = require('express-session');

const CONTEXT = `/${process.env.CONTEXT || 'gpn-ui'}`;
const PORT = process.env.PORT || 3000;
const app = express();

db.sequelize.sync({force: false}).then(() => {
  console.log('DB synchronized');
});

morgan.token('date', (req, res, tz) => {return moment().tz(tz).format();});
morgan.token('ip', (req, res) => {return req.connection.remoteAddress.slice(7); });
morgan.format('myformat', '[:date[Europe/Moscow]] :ip ":method :url" :status :res[content-length] - :response-time ms');
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

app.use(morgan('myformat', { stream: accessLogStream }));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  genid: (req) => {
    return uuid();
  },
  secret: 'there_is_need_secret_word',
  key: 'express.sid',
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: 60000
  }
}));

app.use(async function(req, res, next) {

  let login = '';
  let checked = false;

  if(!req.session.message) {

    await auth_ad.get_login(req, res).then(
      result => {
        login = result.sAMAccountName;
      },
      error => {
        console.log("Rejected: " + error);
      }
    );

    await auth_bd.check_login(login).then(
      result => {
        checked = result;
        if(checked) req.session.message = login;
      },
      error => {
        console.log("Rejected: " + error);
      }
    );
  }
  else
    checked = true;

  if(checked) next();
  else
    res.sendFile('index.html', {
      root: path.join(__dirname, './')
    });

});

app.use(
  CONTEXT,
  express.static(
    path.resolve(__dirname, '../../dist/gpn-ui')
  )
);

app.use(
  '/',
  express.static(
    path.resolve(__dirname, '../../dist/gpn-ui')
  )
);

app.use('/api', routes);

app.listen(PORT, () =>
  console.log(`App running on http://localhost:${PORT}${CONTEXT}`)
);
