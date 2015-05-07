var User = require('./models/user.js');
var Room = require('./models/room.js');
var ent = require('ent');
var encode = require('ent/encode');
var active = {};
module.exports = function(io){
	io.of('/chat').on('connection',function(socket)
	{
		/*initialisation*/
		init(socket);
		
		/* Fonctions grand public */
		socket.on('message', function(oData)
		{
			sendMessage(oData,socket);
		});
		
		socket.on('image', function(oData)
		{
			sendImage(oData,socket);
		});
		
		socket.on('whisper', function(oData)
		{
			sendWhisper(oData,socket);
		});
		
		socket.on('joinRoom', function(oData)
		{
			joinRoom(oData,socket);
		});
		
		socket.on('leaveRoom', function(oData)
		{
			leaveRoom(oData,socket);
		});
		
		socket.on('changePseudo', function(oData)
		{
			changePseudo(oData, socket);
		});
		
		socket.on('removePseudo', function(oData)
		{
			removePseudo(oData, socket);
		}
		
		socket.on('createRoom', function(oData)
		{
			createRoom(oData,socket);
		});
		
		socket.on('deleteRoom', function(oData)
		{
			deleteRoom(oData,socket);
		});
		
		socket.on('room_list',function(text)
		{
			Room.find({'name':(new RegExp(cleanString(text), "i"))},{'name':1, 'password':1, '_id':0},function(err,room)
			{
				if(err)
					console.log(err);
				else
				{
					console.log(room);
					var data = {};
					data.list = room;
					data.text = text;
					socket.emit('room_list',data);
				}
			});
			
		});
		
		socket.on('ask_history',function(room_name)
		{
			var res=[];
			Room.findOne({'name':room_name},function(err,room)
			{
				if(room)
				{
					for(i = room.storage.length-1;(i>=0);i--)
					{
						res.push(room.storage[i]);
					}
					socket.emit('ask_history',{'storage':res,'room':room.name});
				}
			});
		});
		
		socket.on('disconnect',function()
		{
				
			setTimeout(function()
			{
				if(!io.nsps['/chat'].adapter.rooms[socket.oid])
				{
					console.log(socket.name+' disconnected');
					delete active[socket.name];
					if(socket.visiteur)
					{
						User.findById(socket.oid).remove().exec();
						console.log(socket.name + ' removed from database (visiteur)');
					}
					if(socket.roomList)
					{
						socket.roomList.forEach(function(room)
						{
							socket.to(room).emit('room_user_list',{'room':room,'list':getRoomUserList(room)});
							console.log('update user list');
						});
					}
				}
			},5000);
				
		});
		
	});

	function init(socket)
	{
		if(socket.request.user.local.email)
		{
			if(socket.request.user.local.pseudo)
			{
				socket.pseudo = socket.request.user.local.pseudo;
			}
			else
			{
				socket.pseudo = {};
			}
		}
		else
		{
			socket.visiteur = true;
			socket.pseudo = {};
		}
		socket.name = socket.request.user.local.name;
		socket.oid = socket.request.user._id;
		if(!active[socket.name])
		{
			var oData = {
				type:'newConnected',
				message:socket.name
			};
			console.log('new user connected : ' + socket.name);
			socket.broadcast.emit('info', oData);
			active[socket.name] = true;
		}
		else
		{
			socket.reload = true;
		}
		socket.join(socket.oid);
		socket.request.user.local.rooms.forEach(function(sRoom)
		{
			joinRoom({message:sRoom},socket);
		});
		socket.roomList = socket.request.user.local.rooms;
	}
	
	function sendMessage(oData,socket)
	{
		//test si le paquet est bien pour message
		if(oData.type == 'message')
		{
			//test si le socket apartient a la room
			if(socket.rooms.indexOf(oData.room) >= 0)
			{
				//Ajoute au packet oData les information maquante
				oData.time = time();
				oData.name = socket.name;
				if(socket.pseudo[oData.room])
				{
					oData.pseudo = socket.pseudo[oData.room];
				}
				else
				{
					delete oData.pseudo;
				}
				oData.message = encode(oData.message);
				
				//envoi du message
				console.log('message envoyé de: ' + oData.name + ' pour la room: ' + oData.room);
				socket.to(oData.room).emit('message',oData);
				
				//sauvegarde du message dans l'historique du la room
				Room.findOne({'name':oData.room},function(err,room)
				{
					if(room)
					{
						room.storage.push(oData);
						if(room.storage.length > room.volume)
							room.storage.shift();
						room.save(function(err){});
					}
				});
			}	
		}
	}
	
	function sendImage(oData,socket)
	{
		//test si le paquet est bien pour message
		if(oData.type == 'image')
		{
			//test si le socket apartient a la room
			if(socket.rooms.indexOf(oData.room) >= 0)
			{
				//Ajoute au packet oData les information maquante
				oData.time = time();
				oData.name = socket.name;
				if(socket.pseudo[oData.room])
				{
					oData.pseudo = socket.pseudo[oData.room];
				}
				oData.message = encode(oData.message);
				
				//envoi du message
				socket.to(oData.room).emit('image',oData);
				
				//sauvegarde du message dans l'historique du la room
				Room.findOne({'name':oData.room},function(err,room)
				{
					if(room)
					{
						room.storage.push(oData);
						if(room.storage.length > room.volume)
							room.storage.shift();
						room.save(function(err){});
					}
				});
			}	
		}
	}
	
	function sendWhisper(oData,socket)
	{
		if(oData.to)
		{
			oData.time = time();
			oData.name = socket.name;
			oData.message = encode(oData.message);
			console.log('message privé envoyer de: '+ socket.name + ' pour: ' + oData.to);
			User.findOne({'local.name':oData.to}, function(err,user){
				if(!user){
					socket.emit('wrong','Cet utilisateur n\'existe pas');
				}
				if(user)
				{
					socket.to(user._id).emit('whisper', oData);
				}
			});
		}
	}
	
	function joinRoom(oData,socket)
	{
		var bAcces = false;
		Room.findOne({'name':oData.message},function(err,room)
		{
			if(err)
				console.log(err);
			if(!room)
				socket.emit('wrong','la room '+ oData.message +' n\'existe pas');
			else{
				if(room.blacklist.indexOf(socket.oid) >= 0)
					socket.emit('wrong','vous etes banni de cette room');
				else{
					User.findOne({'_id': socket.oid}, function (err, user)
					 {
						if(room.password)
						{
							if(oData.password)
							{
								if(room.validPassword(oData.password))
									bAcces = true;
							}
							else if(room.whitelist.indexOf(socket.name) >= 0){
								bAcces = true;
							}
							else{
								bAcces = false;
							}
						}
						else
							bAcces = true;
						if(bAcces)
						{
							if(user.local.rooms.indexOf(oData.message) < 0)
								user.local.rooms.push(oData.message);

							if(room.password)
							{
								if(room.whitelist.indexOf(socket.name) < 0){
									room.whitelist.push(socket.name);
									room.save(function(err){ });
								}
							}
							user.save(function (err) 
							{
								if(err) 
								{
									console.error('ERROR!');
								}
								else
								{
									socket.join(room.name,function(){
										console.log('Room '+room.name+' : '+getRoomUserList(room.name));
										socket.emit('my_room',user.local.rooms);
										socket.emit('room_user_list',{'room':room.name, 'list':getRoomUserList(room.name)});
										socket.to(room.name).emit('room_user_list',{'room':room.name, 'list':getRoomUserList(room.name)});
										if(socket.roomList.indexOf(room.name) < 0)
										{
											var oSend = { type:'userJoin', message:socket.name }
											socket.to(room.name).emit('room_info', oSend);
										}
										else if(!socket.reload)
										{
											var oSend = { type:'userConnect', message:socket.name }
											socket.to(room.name).emit('room_info', oSend);
										}
										socket.roomList = user.local.rooms;
										console.log(socket.rooms);
										
									});
								}
							});
						}
						else
							socket.emit('wrong','mauvais mot de passe');

					});
				}
			}
		});
	}

	function leaveRoom(oData, socket)
	{
		User.findOne({'_id': socket.oid}, function (err, user)
		{
			var index = user.local.rooms.indexOf(oData.message)
			if(index < 0)
				socket.emit('wrong','vous n\'etes pas dans cette room');
			else{
				user.local.rooms.splice(index,1);
				user.save(function (err)
				{
					if(err)
					{
						console.error('ERROR!');
					}
					else
					{
						console.log(socket.name+' a quitté la room: '+oData.message);
						socket.emit('info','vous avez quitté la room: '+oData.message);
						socket.emit('my_room',user.local.rooms);
						socket.leave(oData.message);
					}
				});
			}
		});
	}
	
	function changePseudo(oData,socket)
	{
		if(oData.room && oData.message)
		{
			User.findById(socket.oid, function(err, user)
			{
				if(user)
				{
					if(!user.local.pseudo)
					{
						user.local.pseudo = {};
					}
					user.local.pseudo[oData.room] = oData.message;
					user.markModified('local.pseudo');
					user.save(function(err){ });
					console.log('change pseudo');
				}
			});
		}
	}
	
	function removePseudo(oData,socket)
	{
		if(oData.room)
		{
			User.findById(socket.oid, function(err, user)
			{
				if(user)
				{
					delete user.local.pseudo[oData.room];
					user.markModified('local.pseudo');
					user.save(function(err){ });
					console.log('remove pseudo');
				}
			});
		}
	}
	
	function createRoom(oData, socket)
	{
		Room.findOne({'name':oData.message},function(err,room)
		{
			if(err)
				console.log(err);
			if(!room)
			{
				var newRoom    = new Room();
				newRoom.name   = oData.message;
				newRoom.owner  = socket.oid;
				newRoom.volume = 30;
				newRoom.description = "";
				if(oData.password)
					newRoom.password = newRoom.generateHash(oData.password);
				newRoom.save(function(err)
				{
					if(err)
						console.log(err)
					else
					{
						console.log('new room: '+oData.message);
						joinRoom(oData,socket);
					}
				});
			}
			else
			{
				socket.emit('wrong','La room existe deja');
			}
		});
	}
	
	function deleteRoom(oData, socket)
	{
		Room.findOne({ 'name': oData.message}, function (err, room)
		{
			if(room)
			{
				if(room.owner == socket.oid)
				{
					console.log('remove');
					room.remove(function(){});
				}
			}
		});
	}
	
	function getRoomUserList(room)
	{
		if(!io.nsps['/chat'].adapter.rooms[room])
			return [];
		var list = Object.keys(io.nsps['/chat'].adapter.rooms[room]).map(function(id){
			return io.nsps['/chat'].connected[id].name;
		});
		return uniq_fast(list);
	}
	
	function uniq_fast(a) 
	{
		var seen = {};
		var out = [];
		var len = a.length;
		var j = 0;
		for(var i = 0; i < len; i++) {
			 var item = a[i];
			 if(seen[item] !== 1) {
				   seen[item] = 1;
				   out[j++] = item;
			 }
		}
		return out;
	}
	
	function time()
	{
		    var d = new Date();
			var h = d.getHours();
			var m = d.getMinutes();
			return h+':'+m;
	}
	function cleanString(text)
	{
		return text.split('').map(function(c){
			if("*?|".indexOf(c) >= 0)
				return '\\'+c;
			else
				return c;
		}).join('');
	}

};