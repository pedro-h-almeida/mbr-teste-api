const express = require('express');

const atividades = require('./controllers/atividades');
const livros = require('./controllers/livros');
const series = require('./controllers/series');

const router = express();

router.use('/atividades', atividades);
router.use('/livros', livros);
router.use('/series', series);

module.exports = router;
