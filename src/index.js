// importing the dependencies
const express = require('express');
const cors = require('cors');
// const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');

require('dotenv-safe').config({
  example: `${__dirname}/./../.env.example`,
});

const app = express();

const port = process.env.PORT || 3001;

// app.use(helmet());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());
app.options('*', cors());
app.use(morgan('combined'));

app.get('/', (_, res) => {
  res.send({ APP_NAME: 'Teste MBR API', API_VERSION: '1.0.0' });
});

app.use('/', routes);

app.listen(port, () => {
  console.log(`Porta: ${port} ||  Banco: ${process.env.DB_NAME}`);
});
