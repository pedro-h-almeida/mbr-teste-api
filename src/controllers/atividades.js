/* eslint-disable no-unused-vars */
/* eslint-disable no-throw-literal */
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

router.post('/', async (req, res, next) => {
  try {
    const {
      descAtividade,
      idLivro,
      idSerie,
      alternativas,
    } = req.body;

    // -----------------------------------------------------
    // -----------------------------------------------------
    // Checando se o array alternativas respeita as regras de tamanho

    let alternativasCount = 0;
    let alternativasCorretasCount = 0;

    for (const element of alternativas) {
      alternativasCount += 1;
      if (element.isCorreta) {
        alternativasCorretasCount += 1;
      }
    }

    if (alternativasCount > Number(process.env.ATIVIDADES_MAX_ALTERNATIVAS)) {
      throw new Error("Numero Máximo de Alternativas alcançado!");
    }

    if (alternativasCorretasCount === 0) {
      throw new Error("Atividade deve possuir ao menos 1 alternativa marcada como resposta");
    }

    if (alternativasCorretasCount > 1) {
      throw new Error("Atividade só pode ter 1 alternativa marcada como correta!");
    }

    // -----------------------------------------------------
    // -----------------------------------------------------
    // -----------------------------------------------------

    const alternativasProcedure = [];

    const atividadeSql = 'INSERT INTO atividades (??, ??, ??, ??) VALUES(?, ?, ?, ?);';
    const alternativasSql = 'INSERT INTO alternativas (??, ??, ??) VALUES(?, ?, ?);';
    const atividadeRespostaSql = 'INSERT INTO atividades_repostas (??, ??) VALUES(?, ?);';

    let alternativaCorretaResultId;

    // Pegando uma connection da pool para utilizar na transaction
    poolConnection.getConnection((getConnectionErr, connection) => {
      if (getConnectionErr) throw getConnectionErr; // not connected!

      // Iniciando a transaction
      connection.beginTransaction((beginTransactionErr) => {
        if (beginTransactionErr) { throw beginTransactionErr; } // transacion error

        const insertAtividade = ['descricao', 'idLivro', 'idSerie', 'status', descAtividade, idLivro, idSerie, 0];
        const atividadeSqlFormat = mysql.format(atividadeSql, insertAtividade);

        // Query que executa a inclusão da atividade no banco
        connection.query(atividadeSqlFormat, (errorAtividade, atividadeResult) => {
          if (errorAtividade) {
            return connection.rollback(() => {
              connection.release();
              throw errorAtividade;
            });
          }
          console.log('Atividade ID: ', atividadeResult.insertId);

          // Criador das querys que adicionam as atividades no banco
          const alternativaProcedure = (data) => new Promise((resolve, reject) => {
            const insertAlternativa = ['descricao', 'idAtividade', 'status', data.descAlternativa, atividadeResult.insertId, 0];
            const alternativaSqlFormat = mysql.format(alternativasSql, insertAlternativa);
            connection.query(alternativaSqlFormat, (errorAlternativa, alternativaResult) => {
              if (errorAlternativa) {
                return connection.rollback(() => {
                  connection.release();
                  reject(errorAlternativa);
                });
              }
              if (data.isCorreta) {
                alternativaCorretaResultId = alternativaResult.insertId;
              }
              console.log('Alternativa ID: ', alternativaResult.insertId);
              resolve(alternativaResult);
            });
          });

          for (const element of alternativas) {
            alternativasProcedure.push(alternativaProcedure(element));
          }

          Promise.all(alternativasProcedure).then(() => {
            const insertAtividadeResposta = ['idAtividade', 'idAlternativa', atividadeResult.insertId, alternativaCorretaResultId];
            const atividadeRespostaSqlFormat = mysql.format(atividadeRespostaSql, insertAtividadeResposta);

            // Query que da tabela atividades_repostas
            connection.query(atividadeRespostaSqlFormat, (errorAtividadeResposta, atividadeRespostaResult) => {
              if (errorAtividadeResposta) {
                return connection.rollback(() => {
                  connection.release();
                  throw errorAtividadeResposta;
                });
              }

              console.log('Atividade Resposta ID: ', atividadeRespostaResult.insertId);

              // Commit da transaction se as querys passarem
              connection.commit((err) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    throw err;
                  });
                }
                connection.release();
                res.status(200).send({ status: 'ok', message: 'Sucesso, atividade cadastrada com sucesso', idAtividade: atividadeResult.insertId });
              });
            });
          }).catch((erroPromiseAll) => connection.rollback(() => {
            connection.release();
            throw erroPromiseAll;
          }));
        });
      });
    });
  } catch (error) {
    res.status(500).send({ status: 'error', message: error.message });
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
