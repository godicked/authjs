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
		console.log('new user: '+ socket.request.user.local.name);
		identification(socket);
		
		socket.on('message',function(data)
		{
			data.time = time();
			if(socket.name)
			{
				data.who = socket.name;
				console.log('message envoyé de: ' + socket.name);
				if(socket.pseudo)
				{
					data.from = socket.pseudo;
				}
				else
					data.from = socket.name;
				data.message = encode(data.message);
				console.log('send to room: '+data.room);
				socket.to(data.room).emit('message',data);
				if(data.room == 'Accueil')
					io.of('Accueil').emit('message',data);
				
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
			data.time = time();
			if(socket.name)
			{
				data.from = socket.name;
				data.message = encode(data.message);
				console.log('message privé envoyer de: '+ socket.name + ' pour: ' + data.to);
				User.findOne({'local.name':data.to}, function(err,user){
					if(!user){
						socket.emit('wrong','Cet utilisateur n\'est pas connecté');
						console.log(data.to + ' n\'est pas connecté');
					}
					if(user)
					{
						socket.to(user._id).emit('whisper', data);
					}
				});
			}
			else
				socket.emit('wrong','votre session a expiré, veuillez recharger la page');
		});
		socket.on('command',function(data){
			data.time = time();
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
				if(data.room == 'Accueil')
					io.of('Accueil').emit('command',data);
			}
			else
				socket.emit('wrong','votre session a expiré, veuillez recharger la page');
		});
		socket.on('video',function(data)
		{
			console.log('on reçoit une vidéo');
			data.time = time();
			if(socket.name)
			{
				if(socket.pseudo)
				{
					data.from = socket.pseudo;
				}
				else
				{
					data.from = socket.name;				
				}
				socket.to(data.room).emit('video',data);
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
			if(data.command == '/create' && data.message)
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
						newRoom.description = "";
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
								console.log(data);
								joinRoom(data,socket);
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
			if(socket.name){
				setTimeout(function(){
					if(!io.nsps['/chat'].adapter.rooms[socket.oid]){
						console.log(socket.name+' disconnected');
						if(socket.visiteur){
							User.findById(socket.oid).remove().exec();
							console.log(socket.name + ' removed from database (visiteur)');
						}
						if(socket.roomList){
							socket.roomList.forEach(function(room){
								socket.to(room).emit('room_user_list',{'room':room,'list':getRoomUserList(room)});
								console.log('update user list');
							});
						}
					}
				},5000);
			}
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
	
	io.of('/room').on('connection', function(socket){
		
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
					socket.oid = id;
					socket.name = user.local.name;
					socket.emit('give_id',true);
					Room.find({'owner':id},{'name':1,'whitelist':1,'blacklist':1,'moderator':1,'volume':1},function(err,room){
						if(!err && room){
							console.log(room);
							socket.emit('get_list',room);
						}
					});
				}
			});
		});
		
		
			
	});
	
	// Namespace Accueil ==========================================================
	io.of('/Accueil').on('connection', function(socket){
		console.log('visiteur sur page d\'accueil');
	});
	
	function cleanString(text){
		return text.split('').map(function(c){
			if("*?|".indexOf(c) >= 0)
				return '\\'+c;
			else
				return c;
		}).join('');
	}
	
	
	function time()
	{
		    var d = new Date();
			var h = d.getHours();
			var m = d.getMinutes();
			return h+':'+m;
	}
		function joinRoom(data,socket)
	{
		var ok = false;
		Room.findOne({'name':data.message},function(err,room)
		{
			if(err)
				console.log(err);
			if(!room)
				socket.emit('wrong','la room '+ data.message +' n\'existe pas');
			else{
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
							else if(room.whitelist.indexOf(socket.name) >= 0){
								ok = true;
							}
							else{
								ok = false;
							}
						}
						else
							ok = true;
						if(ok)
						{
							if(user.local.rooms.indexOf(data.message) < 0)
								user.local.rooms.push(data.message);

							if(room.password)
							{
								if(room.whitelist.indexOf(socket.name) < 0){
									room.whitelist.push(socket.name);
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
										socket.roomList = user.local.rooms;
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
	
	function identification(socket){
		if(!io.nsps['/chat'].adapter.rooms[socket.request.user._id]){
			console.log('emit new client');
			socket.broadcast.emit('nouveau_client',socket.request.user.local.name);
		}
		socket.join(socket.request.user._id);
		socket.oid = socket.request.user._id;
		socket.name = socket.request.user.local.name;
		if(!socket.request.user.local.email)
			socket.visiteur = true;
		socket.request.user.local.rooms.forEach(function(room){
			joinRoom({'message':room}, socket);
		});
		socket.emit('initialise', socket.request.user.local.rooms);
	}
	
	function getRoomUserList(room){
		if(!io.nsps['/chat'].adapter.rooms[room])
			return [];
		var list = Object.keys(io.nsps['/chat'].adapter.rooms[room]).map(function(id){
			return io.nsps['/chat'].connected[id].name;
		});
		return uniq_fast(list);
	}
	
	function uniq_fast(a) {
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


};