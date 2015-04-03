// app/routes.js
var User = require('./models/user.js');
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    // app.post('/login', do all our passport stuff here);
	// process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);
	 app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
		if(req.user.local.name){
			res.render('profile.ejs', {
				user : req.user // get the user out of session and pass to template
			});
		}
		else{
			res.redirect('/welcome');
		}
    });
	
	// =====================================
    // WELCOME =============================
    // =====================================
	app.get('/welcome', function(req,res){
		var userMap = [];
		User.find({},{'_id':0,'local.name':1},function(err, user){
				if(err)
					console.log(err);
				else{
					user.forEach(function(user){
						if(user.local.name)
							userMap.push(user.local.name);
					});
				}
				res.render('welcome.ejs',{data : {user : req.user, names : userMap}});
			});
	});
	
	app.post('/welcome', function(req,res){
		var pseudo = req.body.name;
		console.log(pseudo);
		User.findByIdAndUpdate(req.user._id, { $set: { 'local.name': pseudo }}, function (err, user) {
			req.user = user;
			res.redirect('/profile');
		});
	});

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
