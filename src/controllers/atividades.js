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
      await conn.promise().execute(atividadeSqlFormat, (error, results) => {
        if (error) throw error;
        atividadeResultId = results.insertId;
        console.log(results.insertId);
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
      await conn.promise().execute(alternativaASqlFormat, (error, results) => {
        if (error) throw error;
        if (alternativaCorreta === 0) {
          alternativaCorretaResultId = results.insertId;
        }
        console.log(results.insertId);
      });

      // SQL 3 - Alternativa B
      await conn.promise().execute(alternativaBSqlFormat, (error, results) => {
        if (error) throw error;
        if (alternativaCorreta === 1) {
          alternativaCorretaResultId = results.insertId;
        }
        console.log(results.insertId);
      });

      // SQL 4 - Alternativa C
      await conn.promise().execute(alternativaCSqlFormat, (error, results) => {
        if (error) throw error;
        if (alternativaCorreta === 2) {
          alternativaCorretaResultId = results.insertId;
        }
        console.log(results.insertId);
      });

      // SQL 5 - Alternativa D
      await conn.promise().execute(alternativaDSqlFormat, (error, results) => {
        if (error) throw error;
        if (alternativaCorreta === 3) {
          alternativaCorretaResultId = results.insertId;
        }
        console.log(results.insertId);
      });

      const insertAtividadeResposta = ['idAtividade', 'idAlternativa', atividadeResultId, alternativaCorretaResultId];

      const atividadeRespostaSqlFormat = mysql.format(atividadeRespostaSql, insertAtividadeResposta);

      // SQL 6 - Atividade Resposta
      await conn.promise().execute(atividadeRespostaSqlFormat, (error, results) => {
        if (error) throw error;
        console.log(results.insertId);
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
