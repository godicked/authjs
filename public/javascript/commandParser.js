module.exports = {

	commandHTML: function(message,User){
		        var chaine = message.split(" ")[0];
                switch(chaine){
                    
                    case "/me":
                        return '<p><em>' + User +' '+ message.substring(4) +'</em></p>';
                        break;
                     case "/img":
                        return '<p><span class="pseudo">' + User + ' dit: </span><img class="imagechat" src="'+ message.substring(5)+'"></img></p>';
                        break;
                    case "/dance":
						return '<p><span class="pseudo">' + User + ' dit: </span><img class="imagechat" src="/public/images/dance.gif"></img></p>';
                        break;
					case "/w":
						var whisped = message.split(" ")[1]
						return '/'+whisped+'<p><em class="whisp">[from: ' +User+'] : ' + message.substring(4 + whisped.length) + '</em></p>';
						break;
                    default:
                        return '<p><span class="pseudo">' + User + ' dit: </span><em>' + message + '</em></p>';
                        break;     
                  }  
	}

};

function commandHTML(message,User){
	var chaine = message.split(" ")[0];
	switch(chaine){
		case "/me":
			return '<p><em>' + User +' '+ message.substring(4) +'</em></p>';
			break;
		case "/img":
			return '<p><span class="pseudo">' + User + ' dit: </span><img class="imagechat" src="'+ message.substring(5)+'"></img></p>';
			break;
		case "/dance":
			return '<p><span class="pseudo">' + User + ' dit: </span><img class="imagechat" src="/public/images/dance.gif"></img></p>';
			break;
		case "/w":
			var whisped = message.split(" ")[1]
			return'<p><em class="whisp">[to: ' +whisped+'] : ' + message.substring(3 + whisped.length) + '</em></p>';
			break;
		default:
			return '<p><span class="pseudo">' + User + ' dit: </span><em>' + message + '</em></p>';
	}
}
