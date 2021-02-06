var express = require('express');
var router = express.Router();
const convertDate = require('../models/s_convertDate');

// GET /new
router.get('/', function(req, res, next) {
    if(req.session.auth != true) { return res.redirect("/") }
    res.render('pages/post', {
        username: req.session.username,
        name: req.session.name
    });
});
  
// POST /new
router.post('/', function(req, res, next) {
    if(req.session.auth != true) { return res.redirect("/") }

    var body = {};
    body.titulo = req.body.titulo;
    body.dtExecucao = new Date(req.body.dtExecucao);
    body.responsavel = req.session.username;
    body.impactoRisco = req.body.impactoRisco;
    if (req.body.aprovadores) {
        aprovadores = [];
        req.body.aprovadores.replace(/\s/g, '').split(";").forEach((aprovador) => { aprovadores.push(aprovador)});
        body.aprovadores = aprovadores;
    };
    if (req.body.comite == "on") { body.comite = true } else { body.comite = false }
    if (req.body.rotineira == "on") { body.rotineira = true } else { body.rotineira = false }
    
    global.db.change.post(body).then(result => {
        if (result.status === 201) {
            req.session.alertmsg = { type: "success", text: "Mudança cadastrada com sucesso!" };
            res.redirect(`/changes/${result.message}`);
        }
        else {
            res.render('pages/errorPage', {
                username: req.session.username,
                name: req.session.name,
                mainTitle: "Mudanças",
                message: result.message,
                status: result.status
            });
        }
    });
});

module.exports = router;