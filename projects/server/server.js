const path = require('path');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const routes = require('./app/route/contract.route');
const db = require('./app/config/db.config.js');

const CONTEXT = `/${process.env.CONTEXT || 'gpn-ui'}`;
const PORT = process.env.PORT || 4000;
const app = express();

db.sequelize.sync({force: false}).then(() => {
  console.log('DB synchronized');
});

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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
