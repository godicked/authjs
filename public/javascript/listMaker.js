function make_list(array){
		var res ="<div id='container-users'>";
		array.forEach(function(user){
			res+="<span class='user'>"+user+'</span>';
		});
		res += '</div>';
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
	array.forEach(function(room){
		res+="<span class='room'>"+room+"</span>";
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
		var temp = data.replace(/'/g,'_');
		$('#hermess_chat').append('<article id="room_'+temp.replace(/ /g,"_")+'" class="zone_chat"></article>');
		socket.emit('ask_history',data);
	});
}

function remRooms(array){
	array.forEach(function(data){
		$('#room_'+data).remove();
	});
}
