function make_list(array){
		var res ="<div id='container-users'>";
		array.forEach(function(user){
			res+="<span class='user'>"+user+'</span>';
		});
		res += '</div>';
		return res;
	}

function make_room(array){
	var res = "<ul style:'list-style:none'>";
	array.forEach(function(room){
		res+="<li class='liste_recherche'>"+room.name+"</li>";
	});
	res +='</ul>';
	return res;
}