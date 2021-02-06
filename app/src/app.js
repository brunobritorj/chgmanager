let appInsights = require('applicationinsights');
global.db = require("./db");

//appInsights
appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY || '00000000-0000-0000-0000-000000000000').start();

//swagger
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger.json')

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: "teste",
  resave: false,
  saveUninitialized: true
}));

app.use('/', require('./routes/index'));
app.use('/new', require('./routes/new'));
app.use('/changes', require('./routes/changes'));
app.use('/edit', require('./routes/edit'));
app.use('/vote', require('./routes/vote'));
app.use('/delete', require('./routes/delete'));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));
//app.use('/api/changes', require('./routes/api/changes'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;