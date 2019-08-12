const path = require('path');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const routes = require('./app/route/contract.route');
const addRequestId = require('express-request-id')();
const moment = require('moment-timezone');
const db = require('./app/config/db.config.js');
const fs = require('fs');
const morgan = require('morgan');
const auth = require('./app/authorization/authorization');

const CONTEXT = `/${process.env.CONTEXT || 'gpn-ui'}`;
const PORT = process.env.PORT || 4000;
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
app.use(addRequestId);


app.use(function(req, res, next) {
  const authorized = auth.authorization(req);
  if(!authorized)
  res.sendFile('index.html', {
    root: path.join(__dirname, './')
  });
  else next();
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
