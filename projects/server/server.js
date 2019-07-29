const path = require('path');
const express = require('express');
const compression = require('compression');

const CONTEXT = `/${process.env.CONTEXT || 'gpn-ui'}`;
const PORT = process.env.PORT || 4000;

const app = express();

app.use(compression());

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

app.listen(PORT, () =>
  console.log(`App running on http://localhost:${PORT}${CONTEXT}`)
);
