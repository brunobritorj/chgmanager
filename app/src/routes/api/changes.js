var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  global.db.change.get(req.query).then(result => { return res.status(result.status).json(result.message) });
});

router.get('/:id', function(req, res) {
  global.db.change.getOne(req.params.id).then(result => { return res.status(result.status).json(result.message) });
});

router.post('/', function(req, res) {
  global.db.change.post(req.body).then(result => { return res.status(result.status).json(result.message) });
});

router.put('/:id', function(req, res) {
  global.db.change.put(req.params.id, req.body).then(result => { return res.status(result.status).json(result.message) });
});

router.delete('/:id', function(req, res) {
  global.db.change.del(req.params.id).then(result => { return res.status(result.status).json(result.message) });
});

module.exports = router;