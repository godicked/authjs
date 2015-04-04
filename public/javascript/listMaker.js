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