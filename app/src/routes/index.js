var express = require('express');
var router = express.Router();
const convertDate = require('../models/s_convertDate');

const msal = require('@azure/msal-node');
const config = {
  auth: {
      clientId: process.env.AADCLIENTID || "6828aa07-984b-4951-b261-5600a09bd273",
      authority: process.env.AADAUTHORITY || "https://login.microsoftonline.com/common",
      clientSecret: process.env.AADCLIENTSECRET || "enUX~-Vvo3oPSw0-05AedQu5MiS5X_Btvc"
  },
  system: {
      loggerOptions: {
          loggerCallback(loglevel, message, containsPii) {
              console.log(message);
          },
          piiLoggingEnabled: false,
          logLevel: msal.LogLevel.Verbose,
      }
  }
};
const cca = new msal.ConfidentialClientApplication(config);

if (process.env.WEBSITE_HOSTNAME) { redirectUri = `https://${process.env.WEBSITE_HOSTNAME}/login` }
else { redirectUri = "http://localhost/login" }

/* GET initial page. */
router.get('/', (req, res) => {
  if(req.session.auth === true){
    res.redirect("/home");
  }
  else {
    const authCodeUrlParameters = {
        scopes: ["user.read"],
        redirectUri: redirectUri,
    };

    // get url to sign user in and consent to scopes needed for application
    cca.getAuthCodeUrl(authCodeUrlParameters).then((response) => {
        res.redirect(response);
    }).catch((error) => console.log(JSON.stringify(error)));
  }
});

// GET /login
router.get('/login', (req, res) => {
  if (req.session.auth === true){
    res.redirect("/home");
  }
  else {
    const tokenRequest = {
        code: req.query.code,
        scopes: ["user.read"],
        redirectUri: redirectUri,
    };
    cca.acquireTokenByCode(tokenRequest).then((response) => {
        //console.log("\nResponse: \n:", response);
        req.session.name = response.account.name;
        req.session.username = response.account.username.toLowerCase();
        req.session.auth = true;
        res.redirect("/home");
    }).catch((error) => {
        console.log(error);
        res.status(500).send(error);
    });
  }
});

// GET /home
router.get('/home', function(req, res, next) {
  if(req.session.auth === true){
    res.render('pages/home', {
      username: req.session.username,
      name: req.session.name
    });
  }
  else {
    res.redirect("/");
  }
});

// GET /home/preview
router.get('/home/preview', function(req, res, next) {
  if(req.session.auth === true){
    res.render('pages/home_preview', {
      username: req.session.username,
      name: req.session.name
    });
  }
  else {
    res.redirect("/");
  }
});

module.exports = router;