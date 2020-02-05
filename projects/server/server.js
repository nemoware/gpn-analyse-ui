const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const path = require('path');
const parser = require('./parser/audit-parser');

const appConfig = require('./config/app');

if (process.argv[2]) {
  appConfig.ad.on = process.argv[2] === 'true';
}
if (process.argv[3]) {
  appConfig.ad.login = process.argv[3];
}

const adAuthorization = require('./authorization/ad');
const fakeAuthorization = require('./authorization/fake');
appConfig.ad.auth = appConfig.ad.on ? adAuthorization : fakeAuthorization;

const dbAuth = require('./authorization/db');

const CONTEXT = `/${process.env.CONTEXT || 'gpn-ui'}`;

const port = process.env.PORT || 3000;
const app = express();

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(async function(req, res, next) {
  let ADUser = await appConfig.ad.auth.getUser(req, res);

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

const adminRouter = require('./routers/admin-router');
app.use('/api', adminRouter);

const auditRouter = require('./routers/audit-router');
app.use('/api', auditRouter);

const documentRouter = require('./routers/document-router');
app.use('/api', documentRouter);

const eventRouter = require('./routers/event-router');
app.use('/api', eventRouter);

app.listen(port, async err => {
  if (err) return console.log(err);

  console.log(`App is listening on port ${port}`);
  console.log();

  await Promise.all([parser.test(), adAuthorization.test()]);
});
