const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const routes = require('./route/routes');
const path = require('path');
const uuid = require('uuid');
const fs = require('fs');
const session = require('express-session');
const appConfig = require('./config/app.config');
const adAuth = require('./authorization/adAuthorization');
const dbAuth = require('./authorization/dbAuthorization');

const CONTEXT = `/${process.env.CONTEXT || 'gpn-ui'}`;

const port = process.env.PORT || 3000;
const app = express();

if (process.argv[2]) {
  appConfig.ad.on = process.argv[2] === 'true';
}

if (process.argv[3]) {
  appConfig.ad.login = process.argv[3];
}

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  session({
    genid: req => {
      return uuid();
    },
    secret: 'there_is_need_secret_word',
    key: 'express.sid',
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: 60000
    }
  })
);

app.use(async function(req, res, next) {
  let login = '';
  let checked = false;

  if (!req.session.message) {
    try {
      let result = await adAuth.getLogin(req, res);
      if (result) {
        login = result.sAMAccountName;
      }
    } catch (err) {
      console.log('Rejected: ' + err);
    }
  }

  if (login) {
    try {
      checked = await dbAuth.checkLogin(login);
      if (checked) req.session.message = login;
    } catch (err) {
      console.log('Rejected: ' + error);
    }
  } else {
    checked = true;
  }

  if (checked) {
    next();
  } else {
    res.sendFile('index.html', {
      root: path.join(__dirname, './')
    });
  }
});

app.use(CONTEXT, express.static(path.resolve(__dirname, '../../dist/gpn-ui')));

app.use('/', express.static(path.resolve(__dirname, '../../dist/gpn-ui')));

app.use('/api', routes);

app.listen(port, err => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(`App listening on port ${port}`);
});
