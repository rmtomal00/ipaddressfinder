var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const ip = req.socket.remoteAddress;
  
  const setIp = req.headers['x-forwarded-for'];
  console.log(req.headers['x-forwarded-for']);
  res.render('index', { ip: setIp });
});

router.get("/api-docs", async (req,res)=>{
  res.render('apidocs');
})

router.get('/privacy-policy', async (req, res)=>{
  res.render('privacy');
})

router.get('/contact-us', async (req, res)=>{
  res.render("contact")
})

module.exports = router;
