const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const path = require('path');
const parser = require('./services/parser-service');
const ad = require('./services/ad-service');

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

app.use(async (req, res, next) => {
  let login;
  try {
    login = await ad.getLogin(req, res);
    if (!login) return;
  } catch (err) {
    res.status(401).sendFile('error.html', {
      root: path.join(__dirname, './file/')
    });
  }

  try {
    const user = await ad.getUser(login);
    const groups = user.memberOf;
    res.locals.user = user;
    next();
  } catch (err) {
    res.status(403).sendFile('error.html', {
      root: path.join(__dirname, './file/')
    });
  }
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

  await Promise.all([parser.test(), ad.test()]);
});
