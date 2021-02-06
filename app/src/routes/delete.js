var express = require('express');
var router = express.Router();

// GET /delete/{id}
router.get('/:id', function(req, res, next) {
  if(req.session.auth != true) { return res.redirect("/") }

  if( (!req.session.openEdit) || ( req.session.openEdit =! req.params.id) ) {
    return res.render('pages/errorPage', {
        username: req.session.username,
        name: req.session.name,
        mainTitle: "Mudança",
        message: "Você não possui permissão para editar essa mudança.",
        status: null
    });
  }

  const stringId = req.params.id;
  global.db.change.del(stringId).then(result => { 
    if (result.status === 200) {
      req.session.alertmsg = { type: "success", text: `Mudança ${req.params.id} deletada com sucesso!` };
      res.redirect('/changes');
    }
    else {
        res.render('pages/errorPage', {
        mainTitle: "Mudanças",
            username: req.session.username,
            name: req.session.name,
            message: result.message,
            status: result.status
        });
    }
  });
});

module.exports = router;