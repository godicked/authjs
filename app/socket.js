var User = require('./models/user.js');
var parser = require('../public/javascript/commandParser.js');
var ent = require('ent');
var encode = require('ent/encode');
var sessions = {}

module.exports = function(io){
	io.of('/chat').on('connection',function(socket){
		console.log('new user');
		socket.on('give_id',function(id){
			User.findById(id,function(err,user){
				if(err)
					console.log(err);
				if(!user){
					console.log('socket.io : id not found in db');
					socket.disconnect();
				}
				else{
					console.log("user connected: " + user.local.name);
					if(!sessions[user.local.name])
						socket.broadcast.emit('nouveau_client',user.local.name);
					socket.pseudo = user.local.name;
					socket.oid = id;
					sessions[user.local.name] = {};
					sessions[user.local.name].id = socket.id;
					sessions[user.local.name].connected = true;
				}
			});
		});
		socket.on('message',function(message){
			if(socket.pseudo){
				console.log('message send from: ' + socket.pseudo);
				var m = encode(message);
				m = parser.commandHTML(m,socket.pseudo);
				if(m.charAt(0) == '/'){
					var sendTo = m.substring(1,m.indexOf('<'))
					console.log("private message send to: " + sendTo);
					if(sessions[sendTo]){
						socket.broadcast.to(sessions[sendTo].id).emit('message',m.substring(m.indexOf('<')));
					}
					else{
						socket.emit('message','<p style="color: red;">User not found</p>');
					}
				}
				else{
					socket.broadcast.emit('message', m);
				}
			}
			else{
				socket.emit('message','<p style="color: red;">Sorry session expired, pls reload</p>');
			}
		});
		socket.on('disconnect',function(){
			try{
				sessions[socket.pseudo].connected = false;
				setTimeout(function () {
					if (sessions[socket.pseudo].connected == false){
						delete sessions[socket.pseudo];
						console.log('session closed');
						socket.broadcast.emit('message','<p><em>'+socket.pseudo+' est deconnecté</em></p>');
						};
					}, 5000);
				}
			catch(err){}
		});
	});
	
	io.of('/info').on('connection',function(socket){
		console.log('name name');
		socket.on('name_free',function(name){
			console.log('name_free ask');
			User.findOne({'local.name':name},function(err,user){
				console.log(user);
				if(err || !user)
					socket.emit('name_free',data = {'free':true,'name':name});
				if(user)
					socket.emit('name_free',data = {'free':false,'name':name});
			});
		});
	});
};