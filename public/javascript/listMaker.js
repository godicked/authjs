module.exports = {
	make: function(array){
		var res;
		for(i in array){
			res+="<em class='user'>"+array[i]+'</em>';
		}
		return res;
	}
};