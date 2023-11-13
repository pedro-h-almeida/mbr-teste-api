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

router.get('/:livro/:serie', async (req, res) => {
  try {
    const {
      livro,
      serie,
    } = req.params;

    const getAtividadeLivroSerieSql = `
    select
      ativ.id as 'idAtividade',
      ativ.descricao as 'descAtividade',
      alte.id as 'idAlternativa',
      alte.descricao as 'descAlternativa',
      (
      select
        idAlternativa
      from
        atividades_repostas ar
      where
        ar.idAtividade = ativ.id) as 'idAlternativaCorreta'
    from
      (
      select
        *
      from
        atividades a
      limit 5 ) ativ
    inner join alternativas alte on
      ativ.id = alte.idAtividade
    where
      ativ.idLivro = ?
      and ativ.idSerie = ?
        ;
    `;
    const sqlValues = [livro, serie];
    const getAtividadeLivroSerieSqlFormat = mysql.format(getAtividadeLivroSerieSql, sqlValues);

    poolConnection.query(getAtividadeLivroSerieSqlFormat, (err, results) => {
      const formatedData = [];
      const atividadeMap = new Map();
      const respostasCorretas = [];

      for (const element of results) {
        const {
          idAtividade, descAtividade, idAlternativa, descAlternativa, idAlternativaCorreta,
        } = element;

        if (atividadeMap.has(idAtividade)) {
          atividadeMap.get(idAtividade).alternativas.push({
            idAlternativa,
            descAlternativa,
          });
        } else {
          respostasCorretas.push(
            {
              idAtividade,
              idAlternativa: idAlternativaCorreta,
            },
          );
          atividadeMap.set(idAtividade, {
            idAtividade,
            descAtividade,
            alternativas: [
              {
                idAlternativa,
                descAlternativa,
              },
            ],
          });
        }
      }

      formatedData.push(...atividadeMap.values());

      res.status(200).send({
        status: 'ok', message: 'Sucesso GET Atividades', data: formatedData, respostasCorretas,
      });
    });
  } catch (error) {
    res.status(500).send({ status: 'error', message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const {
      id,
    } = req.params;

    const getAtividadeIdSql = `
      select
        ativ.id as 'idAtividade',
        ativ.descricao as 'descAtividade',
        ativ.idLivro as 'idLivro',
        (select lev.descricao from livros lev where lev.id = ativ.idLivro) as 'descLivro',
        ativ.idSerie  as 'idSerie',
        (select ser.descricao from series ser where ser.id = ativ.idSerie) as 'descSerie',
        (select idAlternativa from atividades_repostas ar where ar.idAtividade = ativ.id) as 'idAlternativaCorreta',
        alte.id as 'idAlternativa',
        alte.descricao as 'descAlternativa'
      from
        atividades ativ
      inner join alternativas alte on
        ativ.id = alte.idAtividade
      where
        ativ.id = ?;
    `;
    const sqlValues = [id];
    const getAtividadeIdSqlFormat = mysql.format(getAtividadeIdSql, sqlValues);

    poolConnection.query(getAtividadeIdSqlFormat, (err, results) => {
      const formatedData = [];
      const atividadeMap = new Map();

      for (const element of results) {
        const {
          idAtividade,
          descAtividade,
          idLivro,
          descLivro,
          idSerie,
          descSerie,
          idAlternativaCorreta,
          idAlternativa,
          descAlternativa,
        } = element;

        if (atividadeMap.has(idAtividade)) {
          atividadeMap.get(idAtividade).alternativas.push({
            idAlternativa,
            descAlternativa,
          });
        } else {
          atividadeMap.set(idAtividade, {
            idAtividade,
            descAtividade,
            idLivro,
            descLivro,
            idSerie,
            descSerie,
            idAlternativaCorreta,
            alternativas: [
              {
                idAlternativa,
                descAlternativa,
              },
            ],
          });
        }
      }

      formatedData.push(...atividadeMap.values());

      res.status(200).send({ status: 'ok', message: 'Sucesso GET Atividade By ID', data: formatedData });
    });
  } catch (error) {
    res.status(500).send({ status: 'error', message: error.message });
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

    if (alternativasCount > 4) {
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

    const atividadeSql = 'INSERT INTO atividades (??, ??, ??) VALUES(?, ?, ?);';
    const alternativasSql = 'INSERT INTO alternativas (??, ??) VALUES(?, ?);';
    const atividadeRespostaSql = 'INSERT INTO atividades_repostas (??, ??) VALUES(?, ?);';

    let alternativaCorretaResultId;

    // Pegando uma connection da pool para utilizar na transaction
    poolConnection.getConnection((getConnectionErr, connection) => {
      if (getConnectionErr) throw getConnectionErr; // not connected!

      // Iniciando a transaction
      connection.beginTransaction((beginTransactionErr) => {
        if (beginTransactionErr) { throw beginTransactionErr; } // transacion error

        const insertAtividade = ['descricao', 'idLivro', 'idSerie', descAtividade, idLivro, idSerie];
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
            const insertAlternativa = ['descricao', 'idAtividade', data.descAlternativa, atividadeResult.insertId];
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

router.put('/', (req, res) => {
  try {
    const {
      idAtividade,
      descAtividade,
      idLivro,
      idSerie,
      alternativas,
    } = req.body;

    const updateAtividadeSql = 'UPDATE atividades SET ?  WHERE id = ?';
    const updateAlternativasSql = 'UPDATE alternativas SET ?  WHERE id = ?';
    const updateAtividadeRespostaSql = 'UPDATE atividades_repostas SET ? WHERE idAtividade = ?';

    let shoudUpdateAtividade = false;
    let shoudUpdateAlternativas = false;
    let shoudUpdateAtividadeResposta = false;

    let updateAtividadeData = {};
    let updateAtividadeRespostaData = {};

    // -------------------------------------
    // Checando se os dados enviados são os esperados
    if (typeof idAtividade !== 'number') {
      throw new Error("É necessário enviar o idAtividade");
    }

    // -------------------------------------
    // Checando quais tabelas devem ser atualizadas baseado nos dados do json enviado
    if (descAtividade || idLivro || idSerie) {
      shoudUpdateAtividade = true;
    }

    if (alternativas && alternativas.length > 0) {
      shoudUpdateAlternativas = true;
      if (alternativas.findIndex((element) => element.isCorreta) !== -1) {
        shoudUpdateAtividadeResposta = true;
      }
    }

    // -------------------------------------
    // Se não houver dados o suficiente para atualizar as tabelas disparo um erro
    if (!shoudUpdateAtividade && !shoudUpdateAlternativas && !shoudUpdateAtividadeResposta) {
      throw new Error("Não a dados o suficiente para atualizar a atividade");
    }

    // -------------------------------------
    // Pegando uma connection da pool para utilizar na transaction
    poolConnection.getConnection((getConnectionErr, connection) => {
      if (getConnectionErr) throw getConnectionErr; // not connected!

      // -------------------------------------
      // Iniciando a transaction
      connection.beginTransaction((beginTransactionErr) => {
        if (beginTransactionErr) { throw beginTransactionErr; } // transacion error

        const queriesPromise = [];

        // -------------------------------------
        // Criador das querys que adicionam as atividades no banco
        const queryPromise = (sqlQuery, data, id) => new Promise((resolve, reject) => {
          connection.query(sqlQuery, [data, id], (errorQuery, queryResult) => {
            if (errorQuery) {
              return connection.rollback(() => {
                connection.release();
                reject(errorQuery);
              });
            }
            console.log('Query Promise Result Info: ', queryResult.info);
            resolve(queryResult);
          });
        });

        // -------------------------------------
        // Montagem query Atividade
        if (shoudUpdateAtividade) {
          if (descAtividade) {
            updateAtividadeData = { ...updateAtividadeData, descricao: descAtividade };
          }
          if (idLivro) {
            updateAtividadeData = { ...updateAtividadeData, idLivro };
          }
          if (idSerie) {
            updateAtividadeData = { ...updateAtividadeData, idSerie };
          }
          queriesPromise.push(queryPromise(updateAtividadeSql, updateAtividadeData, idAtividade));
        }

        // -------------------------------------
        // Montagem query Alternativas
        if (shoudUpdateAlternativas) {
          for (const element of alternativas) {
            if (typeof element.descAlternativa === 'string') {
              queriesPromise.push(queryPromise(updateAlternativasSql, { descricao: element.descAlternativa }, element.idAlternativa));
            }
          }
        }

        // -------------------------------------
        // Montagem query Resposta
        if (shoudUpdateAtividadeResposta) {
          const alternativaObj = alternativas.find((element) => element.isCorreta);
          if (alternativaObj.idAlternativa) {
            updateAtividadeRespostaData = { idAlternativa: alternativaObj.idAlternativa };
            queriesPromise.push(queryPromise(updateAtividadeRespostaSql, updateAtividadeRespostaData, idAtividade));
          }
        }

        Promise.all(queriesPromise).then(() => {
          // Commit da transaction se as querys passarem
          connection.commit((err) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                throw err;
              });
            }
            connection.release();
            res.status(200).send({ status: 'ok', message: 'Sucesso, atividade atualizada com sucesso' });
          });
        }).catch((erroPromiseAll) => connection.rollback(() => {
          connection.release();
          throw erroPromiseAll;
        }));
      });
    });
  } catch (error) {
    res.status(500).send({ status: 'error', message: error.message });
  }
});

router.delete('/:idAtividadeDelete', (req, res) => {
  try {
    const {
      idAtividadeDelete,
    } = req.params;

    const deleteAtividadeSql = 'DELETE FROM atividades WHERE id = ?;';
    const sqlValues = [idAtividadeDelete];
    const deleteAtividadeSqlFormat = mysql.format(deleteAtividadeSql, sqlValues);

    poolConnection.query(deleteAtividadeSqlFormat, (err, results) => {
      res.status(200).send({ status: 'ok', message: 'Sucesso DELETE', idAtividadeDeletada: idAtividadeDelete });
    });
  } catch (error) {
    res.status(500).send({ status: 'error', message: error.message });
  }
});

module.exports = router;
