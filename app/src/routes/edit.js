var express = require('express');
var router = express.Router();
const convertDate = require('../models/s_convertDate');

// GET /edit/{id}
router.get('/:id', function(req, res, next) {
    if(req.session.auth != true) { return res.redirect("/") }

    global.db.change.getOne(req.params.id).then(result => {
        if (result.status === 200) {
            if (req.session.username === result.message.responsavel) {
                req.session.openEdit = result.message._id;
            }
            else {
                return res.render('pages/errorPage', {
                    username: req.session.username,
                    name: req.session.name,
                    mainTitle: "Mudança",
                    message: "Você não possui permissão para editar essa mudança.",
                    status: null
                });
            }

            if (result.message.comite === true) { var comite = "checked" }
            if (result.message.rotineira === true) { var rotineira = "checked" }
            if (result.message.aprovadores) {
                var aprovadores = new Array();
                result.message.aprovadores.forEach((aprovador) => {
                    if (aprovador.status == "emAnalise") { aprIcon = "⚠️" }
                    else if (aprovador.status == "aprovada") { aprIcon = "✅" }
                    else if (aprovador.status == "rejeitada") { aprIcon = "❌" }
                    aprovadores.push(`${aprIcon}${aprovador.usuario}`)
                });
                var aprovadores = aprovadores.join("; ");
            }
            var notificacaoTi = {};
            if (result.message.notificacaoTi) {
                if (result.message.notificacaoTi.includes('GGT')) { notificacaoTi.GGT = "checked" };
                if (result.message.notificacaoTi.includes('GOT')) { notificacaoTi.GOT = "checked" };
                if (result.message.notificacaoTi.includes('GSI')) { notificacaoTi.GSI = "checked" };
            }
            res.render('pages/edit', {
                username: req.session.username,
                name: req.session.name,
                changeId: result.message._id,
                titulo: result.message.titulo,
                dtExecucao: convertDate.toReadHtmlForm(result.message.dtExecucao),
                responsavel: result.message.responsavel,
                impactoRisco: result.message.impactoRisco,
                aprovadores: aprovadores,
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
                mainTitle: "Mudanças",
                message: result.message,
                status: result.status
            });
        }
    });
});

// POST /edit/{id}
router.post('/:id', function(req, res, next) {
    if(req.session.auth != true) { return res.redirect("/") }
    if( (!req.session.openEdit) || ( req.session.openEdit =! req.params.id) ) {
        return res.render('pages/errorPage', {
            username: "req.session.username",
            name: "req.session.name",
            mainTitle: "Mudança",
            message: "Você não possui permissão para editar essa mudança.",
            status: null
        });
    }

    const stringId = req.params.id;
    var body = {};
    body.titulo = req.body.titulo;
    body.dtExecucao = new Date(req.body.dtExecucao);
    body.impactoRisco = req.body.impactoRisco;
    if (req.body.comite == "on") { body.comite = true } else { body.comite = false }
    if (req.body.rotineira == "on") { body.rotineira = true } else { body.rotineira = false }
    body.descricao = req.body.descricao;
    body.associacao = req.body.associacao;
    body.notificacaoTi = new Array();
    if (req.body.notificacaoTiGgt == "on") { body.notificacaoTi.push('GGT') }
    if (req.body.notificacaoTiGot == "on") { body.notificacaoTi.push('GOT') }
    if (req.body.notificacaoTiGsi == "on") { body.notificacaoTi.push('GSI') }
    if (req.body.notificacao) {
        notificacao = [];
        req.body.notificacao.replace(/\s/g, '').split(";").forEach((notificado) => { notificacao.push(notificado)});
        body.notificacao = notificacao;
    };
    
    global.db.change.put(stringId, body).then(result => { 
        if (result.status === 200) {
            res.redirect(`/changes/${stringId}`);
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