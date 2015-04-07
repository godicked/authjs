module.exports = {
	make: function(array){
		var res ="<div id='container-users'>";
		for(i in array){
			res+="<span class='user'>"+array[i]+'</span>';
		}
		res += '</div>';
		return res;
	}

};
function make_room(array){
	var res = "<ul style:'list-style-type:none'>";
	for(i in array){
		res += "<li class='liste_recherche'>"+array[i].name+"</li>";
	}
	res +='</ul>';
	return res;
}