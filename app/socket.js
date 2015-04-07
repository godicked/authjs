var User = require('./models/user.js');
var Room = require('./models/room.js');
var listMaker = require('../public/javascript/listMaker.js');
var ent = require('ent');
var encode = require('ent/encode');
var sessions = {}

module.exports = function(io){
	
// Namespace /chat ======================================================================
	
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
					if(!sessions[user.local.name]){
						socket.broadcast.emit('nouveau_client',user.local.name);
					}
					if(!user.local.email)
						socket.visit = true;
					socket.name = user.local.name;
					socket.oid = id;
					sessions[user.local.name] = {};
					sessions[user.local.name].id = socket.id;
					sessions[user.local.name].connected = true;
					var list = listMaker.make(Object.keys(sessions));
					console.log(Object.keys(sessions));
					socket.broadcast.emit('list',list);
					socket.emit('list',list);
					user.local.rooms.forEach(function(room){
						console.log(socket.name+' join: '+room);
						socket.join(room);
					});
				}
			});
		});
		
		socket.on('message',function(data){
			if(socket.name){
				console.log('message envoyé de: ' + socket.name);
				if(socket.pseudo)
					data.from = socket.pseudo;
				else
					data.from = socket.name;
				data.message = encode(data.message);
				console.log('send to room: '+data.room);
				socket.to(data.room).emit('message',data);
			}
			else
				socket.emit('wrong','votre session a expiré, veuillez recharger la page');
		});
		
		socket.on('whisper',function(data){
			if(socket.name){
				data.from = socket.name;
				data.message = encode(data.message);
				console.log('message privé envoyer de: '+ socket.name + ' pour: ' + data.to);
				if(sessions[data.to]){
					socket.broadcast.to(sessions[data.to].id).emit('whisper', data);
				}
				else{
					socket.emit('wrong','Cet utilisateur n\'est pas connecté');
					console.log(data.to + ' n\'est pas connecté');
				}
			}
			else
				socket.emit('wrong','votre session a expiré, veuillez recharger la page');
		});
		
		socket.on('command',function(data){
			if(socket.name){
				if(socket.pseudo)
					data.from = socket.pseudo;
				else
					data.from = socket.name;
				if(data.command == '/nonick'){
					data.message = socket.name;
					socket.emit('get_name',socket.name);
					delete socket.pseudo;
				}
				if(data.command == '/nick'){
					socket.pseudo = data.message;
					socket.emit('get_name',data.message);
				}
				if(data.message)
					data.message = encode(data.message);
				console.log('commande envoyé de: '+socket.name);
				socket.broadcast.emit('command',data);
			}
			else
				socket.emit('wrong','votre session a expiré, veuillez recharger la page');
		});
		
		socket.on('room',function(data){
			if(data.command == '/join'){
				socket.join(data.message);
			}
			if(data.command == '/leave'){
				socket.leave(data.message);
			}
			if(data.command == '/create'){
				
			}
		});
		
		socket.on('disconnect',function(){
			try{
				sessions[socket.name].connected = false;
				setTimeout(function () {
					if (sessions[socket.name].connected == false){
						delete sessions[socket.name];
						console.log('session closed');
						socket.broadcast.emit('deco','<p><em>'+socket.name+' est deconnecté</em></p>');
						var list = listMaker.make(Object.keys(sessions));
						console.log(Object.keys(sessions));
						socket.broadcast.emit('list',list);
						if(socket.visit){
							User.remove({'_id':socket.oid}, function(err){
								if(err)
									console.log(err)
								else
									console.log('visitor removed from DB');
							});
						}
						};
					}, 5000);
				}
			catch(err){}
		});
	});


// Namespace /info ======================================================================
	
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