/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */
/* eslint-disable quotes */
// /* eslint-disable implicit-arrow-linebreak */
const express = require('express');
const mysql = require('mysql2');
const poolConnection = require('../connection');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.status(200).send({ status: 'ok', message: 'Sucesso GET' });
  } catch (error) {
    res.status(500).send({ status: 'error', message: error });
  }
});

router.get('/:index', async (req, res) => {
  try {
    res.status(200).send({ status: 'ok', message: 'Sucesso GET' });
  } catch (error) {
    res.status(500).send({ status: 'error', message: error });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      descAtividade,
      idLivro,
      idSerie,
      alternativaA,
      alternativaB,
      alternativaC,
      alternativaD,
      alternativaCorreta,
    } = req.body;
    const atividadeSql = 'INSERT INTO atividades (??, ??, ??, ??) VALUES(?, ?, ?, ?);';
    const insertAtividade = ['descricao', 'idLivro', 'idSerie', 'status', descAtividade, idLivro, idSerie, 0];
    const atividadeSqlFormat = mysql.format(atividadeSql, insertAtividade);
    let atividadeResultId;
    let alternativaCorretaResultId;

    const alternativasSql = 'INSERT INTO alternativas (??, ??, ??) VALUES(?, ?, ?);';

    const atividadeRespostaSql = 'INSERT INTO atividades_repostas (??, ??) VALUES(?, ?);';

    poolConnection.getConnection(async (err, conn) => {
      if (err) throw err;

      // Start transaction
      conn.beginTransaction();

      // SQL 1 - Atividade
      conn.promise().execute(atividadeSqlFormat).then((results) => {
        atividadeResultId = results[0].insertId;
        console.log('Atividade ID: ', results[0].insertId);
      }).catch((error) => {
        throw error;
      });

      const insertAlternativaA = ['descricao', 'idAtividade', 'status', alternativaA, atividadeResultId, 0];
      const insertAlternativaB = ['descricao', 'idAtividade', 'status', alternativaB, atividadeResultId, 0];
      const insertAlternativaC = ['descricao', 'idAtividade', 'status', alternativaC, atividadeResultId, 0];
      const insertAlternativaD = ['descricao', 'idAtividade', 'status', alternativaD, atividadeResultId, 0];

      const alternativaASqlFormat = mysql.format(alternativasSql, insertAlternativaA);
      const alternativaBSqlFormat = mysql.format(alternativasSql, insertAlternativaB);
      const alternativaCSqlFormat = mysql.format(alternativasSql, insertAlternativaC);
      const alternativaDSqlFormat = mysql.format(alternativasSql, insertAlternativaD);

      // SQL 2 - Alternativa A
      conn.promise().execute(alternativaASqlFormat).then((results) => {
        if (alternativaCorreta === 0) {
          alternativaCorretaResultId = results[0].insertId;
        }
        console.log('Alternativa A ID: ', results[0].insertId);
      }).catch((error) => {
        throw error;
      });

      // SQL 3 - Alternativa B
      conn.promise().execute(alternativaBSqlFormat).then((results) => {
        if (alternativaCorreta === 1) {
          alternativaCorretaResultId = results[0].insertId;
        }
        console.log('Alternativa B ID: ', results[0].insertId);
      }).catch((error) => {
        throw error;
      });

      // SQL 4 - Alternativa C
      conn.promise().execute(alternativaCSqlFormat).then((results) => {
        if (alternativaCorreta === 2) {
          alternativaCorretaResultId = results[0].insertId;
        }
        console.log('Alternativa C ID: ', results[0].insertId);
      }).catch((error) => {
        throw error;
      });

      // SQL 5 - Alternativa D
      conn.promise().execute(alternativaDSqlFormat).then((results) => {
        if (alternativaCorreta === 3) {
          alternativaCorretaResultId = results[0].insertId;
        }
        console.log('Alternativa D ID: ', results[0].insertId);
      }).catch((error) => {
        throw error;
      });

      const insertAtividadeResposta = ['idAtividade', 'idAlternativa', atividadeResultId, alternativaCorretaResultId];
      const atividadeRespostaSqlFormat = mysql.format(atividadeRespostaSql, insertAtividadeResposta);

      // SQL 6 - Atividade Resposta
      conn.promise().execute(atividadeRespostaSqlFormat).then((results) => {
        console.log('Atividade Resposta ID: ', results[0].insertId);
      }).catch((error) => {
        throw error;
      });

      // Commit and release
      conn.commit();
      poolConnection.releaseConnection(conn);
    });
  } catch (error) {
    res.status(500).send({ status: 'error', message: error });
  }
});

router.put('/:index', (req, res) => {
  try {
    console.log('PARAMS: ', req.params);
    console.log('BODY: ', req.body);
    res.status(200).send({ status: 'ok', message: 'Sucesso PUT' });
  } catch (error) {
    res.status(500).send({ status: 'error', message: error });
  }
});

router.delete('/:index', (req, res) => {
  try {
    console.log('PARAMS: ', req.params);
    console.log('BODY: ', req.body);
    res.status(200).send({ status: 'ok', message: 'Sucesso DELETE' });
  } catch (error) {
    res.status(500).send({ status: 'error', message: error });
  }
});

module.exports = router;
