const express = require('express');

const compression = require('compression');
const bodyParser = require('body-parser');
const routes = require('./route/routes');
const path = require('path');
const logger = require('./logger/logger');

const CONTEXT = `/${process.env.CONTEXT || 'gpn-ui'}`;

const port = process.env.PORT || 3000;
const app = express();

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  logger.log(req, res);
  next();
});

app.use(CONTEXT, express.static(path.resolve(__dirname, '../../dist/gpn-ui')));

app.use('/', express.static(path.resolve(__dirname, '../../dist/gpn-ui')));

app.use('/api', routes);

app.listen(port, function() {
  console.log(`App running on http://localhost:${port}`);
});
