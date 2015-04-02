module.exports = {
	make: function(array){
		var res='<ul id="list">';
		for(i in array){
			res+='<li>'+array[i]+'</li>';
		}
		res+='</ul>';
		return res;
	}
};