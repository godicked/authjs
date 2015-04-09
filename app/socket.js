var User = require('./models/user.js');
var Room = require('./models/room.js');
var ent = require('ent');
var encode = require('ent/encode');
var sessions = {};
var active = {};
module.exports = function(io){
// Namespace /chat ======================================================================
	io.of('/chat').on('connection',function(socket)
	{
		console.log('new user');
		socket.on('give_id',function(id)
		{
			User.findById(id,function(err,user)
			{
				if(err)
					console.log(err);
				if(!user)
				{
					console.log('socket.io : id not found in db');
					socket.disconnect();
				}
				else
				{
					console.log("user connected: " + user.local.name);
					if(!sessions[user.local.name])
					{
						socket.broadcast.emit('nouveau_client',user.local.name);
					}
					if(!user.local.email)
						socket.visit = true;
					socket.name = user.local.name;
					socket.oid = id;
					if(active[id])
						active[id].push(socket.id);
					else
						active[id] = [socket.id];
					console.log(active[id]);
					sessions[user.local.name] = {};
					sessions[user.local.name].id = socket.id;
					sessions[user.local.name].connected = true;
					var list = Object.keys(sessions);
					console.log(list);
					socket.broadcast.emit('list',list);
					socket.emit('list',list);
					user.local.rooms.forEach(function(room){
						joinRoom({'message':room},socket);
					});
					socket.emit('my_room',user.local.rooms);
				}
			});
		});
		socket.on('message',function(data)
		{
			if(socket.name)
			{
				console.log('message envoyé de: ' + socket.name);
				if(socket.pseudo)
					data.from = socket.pseudo;
				else
					data.from = socket.name;
				data.message = encode(data.message);
				console.log('send to room: '+data.room);
				socket.to(data.room).emit('message',data);
				Room.findOne({'name':data.room},function(err,room)
				{
					if(room)
					{
						room.storage.push(data);
						if(room.storage.length > room.volume)
							room.storage.shift();
						room.save(function(err){});
					}
				});
			}
			else
				socket.emit('wrong','votre session a expiré, veuillez recharger la page');
		});
		socket.on('whisper',function(data)
		{
			if(socket.name)
			{
				data.from = socket.name;
				data.message = encode(data.message);
				console.log('message privé envoyer de: '+ socket.name + ' pour: ' + data.to);
				if(sessions[data.to])
				{
					socket.broadcast.to(sessions[data.to].id).emit('whisper', data);
				}
				else
				{
					socket.emit('wrong','Cet utilisateur n\'est pas connecté');
					console.log(data.to + ' n\'est pas connecté');
				}
			}
			else
				socket.emit('wrong','votre session a expiré, veuillez recharger la page');
		});
		socket.on('command',function(data){
			if(socket.name)
			{
				if(socket.pseudo)
					data.from = socket.pseudo;
				else
					data.from = socket.name;
				if(data.command == '/nonick')
				{
					data.message = socket.name;
					socket.emit('get_name',socket.name);
					delete socket.pseudo;
				}
				if(data.command == '/nick')
				{
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
		socket.on('room',function(data)
		{
			if(data.command == '/join')
			{
				joinRoom(data,socket);
			}
			if(data.command == '/leave')
			{
				User.findOne({'_id': socket.oid}, function (err, user)
				{
					var index = user.local.rooms.indexOf(data.message)
					if(index < 0)
						socket.emit('wrong','vous n\'etes pas dans cette room');
					else{
						user.local.rooms.splice(index,1);
						console.log(user.local.rooms);

						user.save(function (err)
						{
							if(err)
							{
								console.error('ERROR!');
							}
							else
							{
								console.log(socket.name+' a quitté la room: '+data.message);
								socket.emit('info','vous avez quitté la room: '+data.message);
								socket.emit('my_room',user.local.rooms);
							}
						});
					}
				});
			}
			if(data.command == '/create')
			{
				Room.findOne({'name':data.message},function(err,room)
				{
					if(err)
						console.log(err);
					if(!room)
					{
						var newRoom    = new Room();
						newRoom.name   = data.message;
						newRoom.owner  = socket.oid;
						newRoom.volume = 30;
						if(data.password)
							newRoom.password = newRoom.generateHash(data.password);
						newRoom.save(function(err)
						{
							if(err)
								console.log(err)
							else
							{
								console.log('new room: '+data.message);
								socket.emit('info','La room '+ data.message + ' a été crée');
								socket.join(data.message);
							}
						});
					}
					else
					{
						socket.emit('wrong','La room existe deja');
					}
				});
			}
			if(data.command == '/delete')
			{
				Room.remove({ 'name': data.message, 'owner':socket.oid }, function (err)
				 {
					  if (err)
						  console.log(err);
					  else
						socket.emit('info','supprimé');
				});
			}
		});
		socket.on('room_list',function(text)
		{
			if(text.indexOf('*') < 0)
			{
				Room.find({'name':(new RegExp(text, "i"))},{'name':1,'_id':0},function(err,room)
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
			}
		});
		socket.on('disconnect',function()
		{
			if(socket.name)
			{
				var index = active[socket.oid].indexOf(socket.id);
				active[socket.oid].splice(index,1);
				if(active[socket.oid].length == 0){
					try
					{
						sessions[socket.name].connected = false;
						setTimeout(function () 
						{
							if (sessions[socket.name].connected == false)
							{
								delete sessions[socket.name];
								console.log('session closed');
								socket.broadcast.emit('deco','<p><em>'+socket.name+' est deconnecté</em></p>');
								var list = Object.keys(sessions);
								console.log(list);
								socket.broadcast.emit('list',list);
								if(socket.visit){
									User.remove({'_id':socket.oid}, function(err)
									{
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
				}
			}

		});
	});

	function joinRoom(data,socket)
	{
		var ok = false;
		Room.findOne({'name':data.message},function(err,room)
		{
			if(err)
				console.log(err);
			if(!room)
				socket.emit('wrong','la room '+ data.message +' n\'existe pas');
			if(room.blacklist.indexOf(socket.oid) >= 0)
				socket.emit('wrong','vous etes banni de cette room');
			else{
				User.findOne({'_id': socket.oid}, function (err, user)
				 {
					if(room.password)
					{
						if(data.password)
						{
							if(room.validPassword(data.password))
								ok = true;
						}
						if(room.whitelist.indexOf(socket.name) >= 0)
							ok = true;
						else
							ok = false;
					}
					else
						ok = true;
					if(ok)
					{
						if(user.local.rooms.indexOf(data.message) >= 0)
						{
							console.log(socket.name+' a rejoint la room: '+data.message);
							socket.emit('info','vous avez rejoint la room: '+data.message);
							socket.join(data.message);
						}
						else
						{
							user.local.rooms.push(data.message);

							if(room.password)
							{
								room.whitelist.push(socket.name);
								room.save(function(err){});
							}
							user.save(function (err) 
							{
								if(err) 
								{
									console.error('ERROR!');
								}
								else
								{
									console.log(socket.name+' a rejoint la room: '+data.message);
									socket.emit('info','vous avez rejoint la room: '+data.message);
									socket.join(data.message);
									socket.emit('my_room',user.local.rooms);
								}
							});
						}
					}
					else
						socket.emit('wrong','mauvais mot de passe');

				});
			}
		});
	}


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