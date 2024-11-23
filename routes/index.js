var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const ip = req.socket.remoteAddress;
  
  const setIp = !ip ?  "IP Not found" : ip.split(':').pop()
  res.render('index', { ip: setIp });
});

module.exports = router;
