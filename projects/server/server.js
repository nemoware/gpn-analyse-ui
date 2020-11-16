const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const https = require('https');
const fs = require('fs');
const parser = require('./services/parser-service');
const rightService = require('./services/right-service');

const argv = require('yargs').argv;
global.kerberos = argv.kerberos !== 'false';
global.ad = argv.ad !== 'false';
global.login = !global.kerberos && (argv.login || 'admin@company.loc');
const ssl = argv.ssl !== 'false';

const ad = require('./services/ad-service');
const kerberos = require('./services/kerberos-service');
const jwt = require('./services/jwt-service');

const accountRouter = require('./routers/account-router');
const adminRouter = require('./routers/admin-router');
const auditRouter = require('./routers/audit-router');
const documentRouter = require('./routers/document-router');
const eventRouter = require('./routers/event-router');
const handBookRouter = require('./routers/handBook-router');

const CONTEXT = `/${process.env.CONTEXT || 'gpn-ui'}`;

const port = process.env.PORT || 3000;
const app = express();

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(jwt.authenticate);
app.use(kerberos.authenticate);
app.use(rightService);

app.use(CONTEXT, express.static(path.resolve(__dirname, '../../dist/gpn-ui')));
app.use('/', express.static(path.resolve(__dirname, '../../dist/gpn-ui')));

app.use('/api/account', accountRouter);
app.use('/api/admin', adminRouter);
app.use('/api/audit', auditRouter);
app.use('/api/document', documentRouter);
app.use('/api/event', eventRouter);
app.use('/api/handbook', handBookRouter);

const listen = async err => {
  if (err) return console.log(err);

  console.log(`App is listening on port ${port}`);
  console.log();

  await Promise.all([parser.test(), ad.test(), kerberos.test()]);
};

if (ssl) {
  const privateKey = fs.readFileSync('./ssl/server.key', 'utf8');
  const certificate = fs.readFileSync('./ssl/server.crt', 'utf8');

  const server = https.createServer(
    { key: privateKey, cert: certificate },
    app
  );
  server.listen(port, listen);
} else {
  app.listen(port, listen);
}
