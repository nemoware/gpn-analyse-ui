const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const path = require('path');
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

const CONTEXT = `/${process.env.CONTEXT || 'gpn-ui'}`;

const port = process.env.PORT || 3000;
const app = express();

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(async function(req, res, next) {
  let ADUser = await adAuth.getUser(req, res);

  if (!ADUser) {
    res.status(401).sendFile('error.html', {
      root: path.join(__dirname, './file/')
    });
  }

  let user = await dbAuth.getUser(ADUser.sAMAccountName);

  if (!user) {
    res.status(401).sendFile('error.html', {
      root: path.join(__dirname, './file/')
    });
  }

  res.locals.user = user;
  next();
});

app.use(CONTEXT, express.static(path.resolve(__dirname, '../../dist/gpn-ui')));

app.use('/', express.static(path.resolve(__dirname, '../../dist/gpn-ui')));

const adminRouter = require('./routers/adminRouter');
app.use('/api', adminRouter);

const auditRouter = require('./routers/auditRouter');
app.use('/api', auditRouter);

const developerRouter = require('./routers/developerRouter');
app.use('/api', developerRouter);

const documentRouter = require('./routers/documentRouter');
app.use('/api', documentRouter);

const eventRouter = require('./routers/eventRouter');
app.use('/api', eventRouter);

app.listen(port, err => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(`App is listening on port ${port}`);
  console.log();

  parser.test();
  adAuthorization.test();
});
