const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const path = require('path');
const parser = require('./services/parser-service');
const ad = require('./services/ad-service');
const authenticationService = require('./services/authentication-service');
const rightService = require('./services/right-service');

const accountRouter = require('./routers/account-router');
const adminRouter = require('./routers/admin-router');
const auditRouter = require('./routers/audit-router');
const documentRouter = require('./routers/document-router');
const eventRouter = require('./routers/event-router');

const appConfig = require('./config/app');
const argv = require('yargs').argv;
appConfig.ad.kerberos = argv.kerberos !== 'false';
appConfig.ad.login = argv.login || 'admin';

const CONTEXT = `/${process.env.CONTEXT || 'gpn-ui'}`;

const port = process.env.PORT || 3000;
const app = express();

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(authenticationService);
app.use(rightService);

app.use(CONTEXT, express.static(path.resolve(__dirname, '../../dist/gpn-ui')));
app.use('/', express.static(path.resolve(__dirname, '../../dist/gpn-ui')));

app.use('/api/account', accountRouter);
app.use('/api/admin', adminRouter);
app.use('/api/audit', auditRouter);
app.use('/api/document', documentRouter);
app.use('/api/event', eventRouter);

app.listen(port, async err => {
  if (err) return console.log(err);

  console.log(`App is listening on port ${port}`);
  console.log();

  await Promise.all([parser.test(), ad.test()]);
});
