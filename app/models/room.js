// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
// define the schema for our room model
var roomSchema = mongoose.Schema({

	password     : String,
	name         : String,
	owner        : String,
	moderator    : [String],
	blacklist    : [String],
	whitelist    : [String],
	storage      : [],
	volume       : Number,
	description  : String
    
});

roomSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
roomSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for room and expose it to our app
module.exports = mongoose.model('Room', roomSchema);
