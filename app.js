var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var passport = require('passport');
var session = require('express-session');
var env = require('dotenv').load();

console.log(process.env.API_DOMAIN, process.env.API_PROTOCOL);

const routes = require('./routes');


global.models = require('./models');
global.npp = 25;
global.utils = require('./misc/utils');

global.PLAYER = 1;
global.COACH = 2;
global.CLUB = 3;
global.ADMIN = 4;

global.mailjet = require ('node-mailjet').connect("adef35aeae6fe5193c5abc00b0764b7e", "d5ca452c3fbad4dc0407ffefa7f88dfe")

var app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, cache-control");
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT, DELETE');
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(passport.initialize());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({
  verify: function(req,res,buf) {
      var url = req.originalUrl;
      if (url.includes('stripe-webhooks')) {
        req.rawBody = buf.toString()
      }
    }  
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());

app.use(session({ secret: 'keyboard cat',resave: true, saveUninitialized:true})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use('/', routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
