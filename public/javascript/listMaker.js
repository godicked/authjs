function make_list(array){
		var res ="<div id='container-users'>";
		array.forEach(function(user){
			res+="<span class='user'>"+user+'</span>';
		});
		res += '</div>';
		return res;
	}

function make_room(array){
<<<<<<< HEAD
	var res = "<ul style:'list-style-type:none'>";
	for(i in array){
		res += "<li class='liste_recherche'>"+array[i].name+"</li>";
	}
=======
	var res = "<ul style:'list-style:none'>";
	array.forEach(function(room){
		res+="<li class='liste_recherche'>"+room.name+"</li>";
	});
>>>>>>> origin/master
	res +='</ul>';
	return res;
}