var User = require('./models/user.js');

module.exports = function(io){
	io.sockets.on('connection', function (socket) {
	console.log('new user');
	socket.on('get_id',function(id){
		User.find({'_id':id},function(err,user){
			if(err)
				console.log(err);
			if(!user){
				console.log('socket.io : id not found in db');
				socket.disconnect();
			}
			else{
				console.log('user connected');
			}
		});
	});
	
	});
};