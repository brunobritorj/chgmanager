var express = require('express');
var router = express.Router();
const convertDate = require('../models/s_convertDate');

// GET /vote
router.get('/', function(req, res, next) {
    if(req.session.auth != true) { return res.redirect("/") }
    global.db.change.getChangesWaitingForVote(req.session.username).then(result => {
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
                mainTitle: "Aprovações",
                mainSubtitle: "Lista com mudanças pendentes de aprovações",
                changes: changes
            });
        }
        else {
            res.render('pages/errorPage', {
                username: req.session.username,
                name: req.session.name,
                mainTitle: "Aprovações",
                message: result.message,
                status: result.status
            });
        }
    });
});

// GET /vote/{id}/{vote}
router.get('/:id/:vote', function(req, res, next) {
    if(req.session.auth != true) { return res.redirect("/") }

    global.db.change.sendVote(req.params.id, req.session.username, req.params.vote).then(result => {
        if (result.status === 200) {
            res.redirect(`/changes/${req.params.id}`);
        }
        else {
            res.render('pages/errorPage', {
                username: req.session.username,
                name: req.session.name,
                mainTitle: "Avaliação",
                message: result.message,
                status: result.status
            });
        }
    });

});

module.exports = router;