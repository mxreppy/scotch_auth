// app/models/user.js
// load the things we need

var mongoose = require('mongoose');
var bcrypt    = require('bcrypt-nodejs');

// schema
var userSchema = mongoose.Schema( {

	local		: {
		email	: String,
    		password : String,
    	},
    	facebook	: {
		id	: String,
    		token	: String, 
    		email	: String,
    		name	: String
	},
    	twitter		: {
		id	: String, 
		token	: String, 
    		displayName	: String,
    		username	: String
    	}, 
    	google		: {
		id	: String,
    		token	: String,
		email	: String,
		name	: String
	}
});

/* methods */

userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validatePassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);

