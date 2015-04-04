module.exports = {
	make: function(array){
		var res ="<div id='container-users'>";
		for(i in array){
			res+="<em class='user'>"+array[i]+'</em>';
		}
		res += '</div>';
		return res;
	}
};