// server.js
//
// // set up ======================================================================
// // get all the tools we need

var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

// configuration
//
mongoose.connect(configDB.url); // connect to db

require('./config/passport')(passport);  // pass in passport for configuration

// set up our express app
app.use(morgan('dev'));  // log requests
app.use(cookieParser()); // cookies are needed for auth
app.use(bodyParser());  // get info from html forms

app.set('view engine', 'ejs'); // set up ejs templating

// required for passport
app.use(session({ secret:'ilovescotchscotchyscotcmalt' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

/* routes */
require('./app/routes.js')(app, passport); // load our routes into app/passport objects

/* launch */
app.listen(port);
console.log('the magique happens on port ' + port);

