// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 1234;
var mongoose = require('mongoose');
var passport = require('passport');
var server   = require('http').createServer(app);
var flash    = require('connect-flash');
var io       = require('socket.io').listen(server)
var ent      = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
var fs       = require('fs');
var ejs      = require('ejs');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');
var favicon  = require('serve-favicon');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.use("/public", express.static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/images/favicon.ico'));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// socket=======================================================================
require('./app/socket.js')(io);
// launch ======================================================================
server.listen(port);
console.log('The magic happens on port ' + port);
