// load the things we need
var mongoose = require('mongoose');

// define the schema for our room model
var roomSchema = mongoose.Schema({

	password     : String,
	name         : String,
	owner        : String,
	moderator    : [String],
	blacklist    : [String]
    
});

// create the model for room and expose it to our app
module.exports = mongoose.model('Room', roomSchema);
