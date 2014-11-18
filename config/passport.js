/* config/passport.js */

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

// user model
var User = require('../app/models/user');


// load the auth module
var configAuth = require('./auth');

// expose as a function for the app
module.exports = function(passport) {
	/* passport session setup */

	/* required for persistent logins, passport needs serialze and deserial */
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {

			if( user ) {
				console.log('loaded user id ' + user.id );
			}

			done(err, user);
		});
	});


	/* local signup */
	/* using named strategies */

	passport.use('local-signup', new LocalStrategy({
		// by default local strategy uses username and pw
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true // allows us to pass entire req to callback
	},
	function(req, email, password, done) {

		console.log('local-signup for email ' + email );

		// asynchronous
		process.nextTick(function() {
			// find a user by email
			User.findOne({ 'local.email' : email }, function(err, user){

				if(err) {
					return done(err);
				}

				if( user ) {
					return done(null, false, 
						req.flash('signupMessage', 
							'That email is taken (alas!).'));
				} else {
					// well now then create
					var newUser = new User();
					newUser.local.email = email;
					newUser.local.password = newUser.generateHash(password);

					// save
					newUser.save(function(err) {
						if(err) {
							throw err;
						}
						return done(null, newUser);
					});
				}
			}); // end of user findone...

		}); // end of process.next tick
	})); // end of new local strategy and passport.use

	passport.use( 'local-login', new LocalStrategy({
		// override default fields
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, email, password, done) {

		console.log('local-login for email ' + email );

		// find user
		User.findOne({'local.email': email }, function(err, user) {
			// any errors pass back
			if(err) {
				console.log('local-login err=|' + err + '|' );
				return done(err);
			}

			if( !user ) {
				console.log('local-login user not found for email=|' + email + '|' );
				return done(null, false, req.flash( { 
						'loginMessage':
						'no user found for email ' + email
				} ));
			}

			if( ! user.validatePassword(password) ) {
				console.log('local-login pw mismatch for email=|' + email + '|' );
				return done(null, false, req.flash(  {
						'loginMessage':
						'oops.  bad pw'
				} ));
			}
		    console.log('local-login returning user=|' + JSON.stringify(user) + '|' );

			return done(null, user);
		});  // end of user findone fn
	})); // end of new local strategy & passport use


	// let's facebook (let's not...)
	passport.use(new FacebookStrategy({
		// ref config
		clientID: configAuth.facebookAuth.clientID,
		clientSecret: configAuth.facebookAuth.clientSecret,
		callbackURL: configAuth.facebookAuth.callbackURL
	},

	// facebook will send back token and profile
	function( token, refreshToken, profile, done) {

		console.log('fb callback profile ' + JSON.stringify(profile));

		// async
		process.nextTick( function() {
			// find the user in the db based on fb id
			User.findOne( { 'facebook.id' : profile.id }, function(err, user ) {
				if( err ) { 
					console.log('error from db (fb): ' + err);
					return done(err); }

				if( user ) {
					console.log( 'found user, returning');
					return done(null, user);

				} else {
					// create user
					var newUser = new User();

					// add fb info to model
					newUser.facebook.id = profile.id;
					newUser.facebook.token = token;
					newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
					newUser.facebook.email = profile.emails[0].value;
					newUser.save(function(err) {
						if(err) { throw err; } 

						return done(null, newUser);
					});
				}
					
			});// end of user.findone
				
		});  // end of nexttick

		}
		)); // end of passport.use for fb


	console.log('init passport');

}; // end of module def

