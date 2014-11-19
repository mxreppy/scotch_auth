/* app/routes.js */

module.exports = function(app, passport) {

	console.log( "creating routes");
	
	var requestCounter = 0;


	/* generic middleware */
	app.use( function(req, res, next ) {
		console.log('in splat for url ' + req.url + ' - ' + req.method + " count " + requestCounter );
		requestCounter ++;

		next();
	} );

	/* generic middleware */
	app.use( function(req, res, next ) {
		console.log('in splat 2 for url ' + req.url + 
		' - ' + req.method +  
		' - ' + req.isAuthenticated() );

        if( req.isAuthenticated() || 
            req.url === '/login' || 
            req.url === '/signup' ) { 
            return next();
        }
        
        console.log("not authenticated!");
        res.redirect('/login');
	} );

	/* home page */
	app.get( '/', function( req, res ) {
		console.log('in /');

		res.render('index.ejs'); // load index.js

	});

	/* login */
	app.get('/login', function( req, res ) {
		// render login page, passing in any flash data
		res.render('login.ejs', {message: req.flash('loginMessage')});
	});

	// process login form
	app.post('/login', passport.authenticate('local-login', { 
		successRedirect: '/profile', // secure profile redirect
		failureRedirect: '/signup', // back to signup
		failureFlash: true // allow flash message
	}));
	

	/* signup */
	app.get('/signup', function(req, res) {
		// render page with data
		res.render('signup.ejs', {message: req.flash('signupMessage')});
	});

	// process signup
	app.post('/signup', passport.authenticate('local-signup', { 
		successRedirect: '/profile', // secure profile redirect
		failureRedirect: '/signup', // back to signup
		failureFlash: true // allow flash message
	}));
	
	/* profile */
	// want this protected, so use middleware
	app.get('/profile', function(req, res) {
		res.render('profile.ejs', {
			user: req.user // user from session to template
		});
	});

	/* logout */
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

// route middleware
// function isLoggedIn( req, res, next ) {
// 	// if user is auth in session, carry on
// 	if( req.isAuthenticated() ){
// 		return next();
// 	}
// 
// 	// otherwise redirect
// 	console.log('yo! not auth... (requested url = ' + req.url + ')');
// 	
// 	res.redirect('/login');
// }
	
