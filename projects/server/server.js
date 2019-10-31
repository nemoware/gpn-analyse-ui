const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const path = require('path');
const uuid = require('uuid');
const session = require('express-session');
const parser = require('./parser/auditParser');

const appConfig = require('./config/app.config');

if (process.argv[2]) {
  appConfig.ad.on = process.argv[2] === 'true';
}
if (process.argv[3]) {
  appConfig.ad.login = process.argv[3];
}

const adAuthorization = require('./authorization/adAuthorization');
const fakeAuthorization = require('./authorization/fakeAuthorization');

if (appConfig.ad.on) {
  appConfig.ad.auth = adAuthorization;
} else {
  appConfig.ad.auth = fakeAuthorization;
}

const adAuth = appConfig.ad.auth;

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
  let login;
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
  } else {
    checked = true;
  }

  if (login) {
    try {
      let user = await dbAuth.getUser(login);
      checked = !!user;
      req.session.message = user;
    } catch (err) {
      console.log('Rejected: ' + err);
    }
  }

  if (checked) {
    next();
  } else {
    res.status(401).sendFile('error.html', {
      root: path.join(__dirname, './file/')
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
  console.log();

  parser.test();
  adAuthorization.test();
});
