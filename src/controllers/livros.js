// /* eslint-disable implicit-arrow-linebreak */
const express = require('express');
const poolConnection = require('../connection');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    poolConnection.query(
      'SELECT id AS "value", descricao AS "label", img FROM livros WHERE status = 0',
      (err, results) => {
        res.status(200).send({ status: 'ok', message: 'Sucesso GET', results });
      },
    );
  } catch (error) {
    res.status(500).send({ status: 'error', message: error });
  }
});

module.exports = router;
