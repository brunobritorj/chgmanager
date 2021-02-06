var express = require('express');
var router = express.Router();
const convertDate = require('../models/s_convertDate');

// GET /changes
router.get('/', function(req, res, next) {
    if(req.session.auth != true) { return res.redirect("/") }
    global.db.change.get(req.query).then(result => {
        if (result.status === 200) {
            var changes = new Array();
            result.message.forEach(msg => {
                changes.push({
                    _id: msg._id,
                    titulo: msg.titulo,
                    dtExecucao: convertDate.toReadHuman(msg.dtExecucao),
                    responsavel: msg.responsavel,
                    severidade: msg.severidade,
                    status: msg.status 
                });
            });
            if (req.session.alertmsg) {
                alertmsg = req.session.alertmsg;
                req.session.alertmsg = null;
            } else { alertmsg = null }
            res.render('pages/get', {
                username: req.session.username,
                name: req.session.name,
                alertmsg: alertmsg,
                mainTitle: "Mudanças",
                mainSubtitle: "Lista com todas as mudanças",
                changes: changes
            });
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
  
// GET /changes/my
router.get('/my', function(req, res, next) {
    if(req.session.auth != true) { return res.redirect("/") }

    var query = req.query;
    query.responsavel = req.session.username;

    global.db.change.get(query).then(result => {
        if (result.status === 200) {
            var changes = new Array();
            result.message.forEach(msg => {
                changes.push({
                    _id: msg._id,
                    titulo: msg.titulo,
                    dtExecucao: convertDate.toReadHuman(msg.dtExecucao),
                    responsavel: msg.responsavel,
                    severidade: msg.severidade,
                    status: msg.status 
                });
            });
            if (req.session.alertmsg) {
                alertmsg = req.session.alertmsg;
                req.session.alertmsg = null;
            } else { alertmsg = null }
            res.render('pages/get', {
                username: req.session.username,
                name: req.session.name,
                alertmsg: alertmsg,
                mainTitle: "Minhas Mudanças",
                mainSubtitle: `Lista de mudanças criadas por ${req.session.name}`,
                changes: changes
            });
        }
        else {
            res.render('pages/errorPage', {
                username: req.session.username,
                name: req.session.name,
                mainTitle: "Minhas Mudanças",
                message: result.message,
                status: result.status
            });
        }
    });
});

// GET /changes/past
router.get('/past', function(req, res, next) {
    if(req.session.auth != true) { return res.redirect("/") }

    var query = req.query;
    query.dtexecantes = new Date(new Date().setHours(new Date().getHours() + 3));
    query.dtexecdepois = new Date(new Date(new Date().setDate((new Date()).getDate() - 7)).setHours(3,0,0,0));

    global.db.change.get(query).then(result => {
        if (result.status === 200) {
            var changes = new Array();
            result.message.forEach(msg => {
                changes.push({
                    _id: msg._id,
                    titulo: msg.titulo,
                    dtExecucao: convertDate.toReadHuman(msg.dtExecucao),
                    responsavel: msg.responsavel,
                    severidade: msg.severidade,
                    status: msg.status 
                });
            });
            if (req.session.alertmsg) {
                alertmsg = req.session.alertmsg;
                req.session.alertmsg = null;
            } else { alertmsg = null }
            res.render('pages/get', {
                username: req.session.username,
                name: req.session.name,
                alertmsg: alertmsg,
                mainTitle: "Mudanças passadas",
                mainSubtitle: "Lista de mudanças com data de execução programadas para os últimos 7 dias",
                changes: changes
            });
        }
        else {
            res.render('pages/errorPage', {
                username: req.session.username,
                name: req.session.name,
                mainTitle: "Mudanças passadas",
                message: result.message,
                status: result.status
            });
        }
    });
});

// GET /changes/next
router.get('/next', function(req, res, next) {
    if(req.session.auth != true) { return res.redirect("/") }

    var query = req.query;
    query.dtexecdepois = new Date(new Date().setHours(new Date().getHours() + 3));
    query.dtexecantes = new Date(new Date(new Date().setDate((new Date()).getDate() + 7)).setHours(3,0,0,0));

    global.db.change.get(query).then(result => {
        if (result.status === 200) {
            var changes = new Array();
            result.message.forEach(msg => {
                changes.push({
                    _id: msg._id,
                    titulo: msg.titulo,
                    dtExecucao: convertDate.toReadHuman(msg.dtExecucao),
                    responsavel: msg.responsavel,
                    severidade: msg.severidade,
                    status: msg.status 
                });
            });
            if (req.session.alertmsg) {
                alertmsg = req.session.alertmsg;
                req.session.alertmsg = null;
            } else { alertmsg = null }
            res.render('pages/get', {
                username: req.session.username,
                name: req.session.name,
                alertmsg: alertmsg,
                mainTitle: "Próximas mudanças",
                mainSubtitle: "Lista de mudanças programadas para execução nos próximos 7 dias",
                changes: changes
            });
        }
        else {
            res.render('pages/errorPage', {
                username: req.session.username,
                name: req.session.name,
                mainTitle: "Próximas mudanças",
                message: result.message,
                status: result.status
            });
        }
    });
});

// GET /changes/{id}
router.get('/:id', function(req, res, next) {
    if(req.session.auth != true) { return res.redirect("/") }

    global.db.change.getOne(req.params.id).then(result => {
        if (result.status === 200) {
            if (result.message.comite === true) { var comite = "checked" }
            if (result.message.rotineira === true) { var rotineira = "checked" }
            var notificacaoTi = {};
            if (result.message.notificacaoTi) {
                if (result.message.notificacaoTi.includes('GGT')) { notificacaoTi.GGT = "checked" };
                if (result.message.notificacaoTi.includes('GOT')) { notificacaoTi.GOT = "checked" };
                if (result.message.notificacaoTi.includes('GSI')) { notificacaoTi.GSI = "checked" };
            }
            if (req.session.alertmsg) {
                alertmsg = req.session.alertmsg;
                req.session.alertmsg = null;
            } else { alertmsg = null }
            res.render('pages/getOne', {
                username: req.session.username,
                name: req.session.name,
                alertmsg: alertmsg,
                changeId: result.message._id,
                titulo: result.message.titulo,
                dtExecucao: convertDate.toReadHtmlForm(result.message.dtExecucao),
                responsavel: result.message.responsavel,
                impactoRisco: result.message.impactoRisco,
                aprovadores: result.message.aprovadores,
                descricao: result.message.descricao,
                comite: comite,
                rotineira: rotineira,
                associacao: result.message.associacao,
                notificacaoTi: notificacaoTi,
                notificacao: result.message.notificacao,
                severidade: result.message.severidade,
                status: result.message.status,
                dtCriacao: convertDate.toReadHuman(result.message.dtCriacao)
            });
        }
        else {
            res.render('pages/errorPage', {
                username: req.session.username,
                name: req.session.name,
                mainTitle: "Mudança",
                message: result.message,
                status: result.status
            });
        }
    });
});

module.exports = router;