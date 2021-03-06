function make_list(data){
		var res="";
		data.list.forEach(function(user){
			res+="<span class='user'>"+user+"<span class='petit_statut'></span></span>";
		});
		return res;
	}

	
function make_room(array){
	var res = "<ul style='list-style-type:none'>";
	var tab = [];
	var data={};
	array.forEach(function(room){
		if(room.password != null)
		{
			res+="<li class='liste_recherche'>"+room.name+"<img src='/public/images/icones/lock.png' style='width:1em;float:right'></li>";
			tab.push(room.name);
		}
		else
		{
			res+="<li class='liste_recherche'>"+room.name+"</li>";
		}
	});
	res +='</ul>';
	data.tab = tab;
	data.res = res;
	return data;
}

function make_myroom(array){
	var res = "";
	var i = 0;
	array.forEach(function(room){
		res+="<span class='room' id='room"+i+"'>"+room+"<span class='container_notif'></span><img src='/public/images/icones/croix.png' class='close'></span>";
		var str = 'room' + i;
		nomsRooms[str] = room;
		i ++;
	});
	return res;
}

function oldInList(old,actual){
	res = [];
	old.forEach(function(room){
		if(actual.indexOf(room) < 0)
			res.push(room);
	});
	return res;
}

function newInList(old,actual){
	res = [];
	actual.forEach(function(room){
		if(old.indexOf(room) < 0)
			res.push(room);
	});
	return res;
}

function addRooms(array){
	array.forEach(function(data){
		$('#hermess_chat').append('<article id="room_'+ stringToId(data)+'" class="zone_chat" style="overflow:auto"><div id="room_h_'+ stringToId(data)+'"></div></article>');
		$('#liste-users').append('<div id="list_'+stringToId(data)+'"class="container-users"></div>');
		socket.emit('ask_history',data);
	});
}

function remRooms(array){
	array.forEach(function(data){
		$('#room_'+stringToId(data)).remove();
	});
}

function stringToId(text){
	return text.split('').map(function(c){return c.charCodeAt(0)}).join('_');
}
	
function idToString(text){
	return text.split('_').map(function(c){return String.fromCharCode(c);}).join('');
}