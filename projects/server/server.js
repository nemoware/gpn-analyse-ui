const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const path = require('path');
const uuid = require('uuid');
const session = require('express-session');

let adOn, login;
if (process.argv[2]) {
  adOn = process.argv[2] === 'true';
}
if (process.argv[3]) {
  login = process.argv[3];
}

const appConfig = require('./config/app.config');
appConfig.useAd(adOn, login);
let adAuth = appConfig.ad.auth;

const dbAuth = require('./authorization/dbAuthorization');
const routes = require('./route/routes');

const CONTEXT = `/${process.env.CONTEXT || 'gpn-ui'}`;

const port = process.env.PORT || 3000;
const app = express();

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
      let user = await adAuth.getUser(req, res);
      if (user) {
        login = user.sAMAccountName;
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
