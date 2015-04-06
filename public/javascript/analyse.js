// function parse
function parse(message){
	var data = {};
	if(message.charAt(0) == '/'){
		var split = message.split(' ');
		var command = split[0];
		switch(command){
			case '/me':
				data.type = 'command';
				data.command = '/me';
				data.message = message.substring(4);
				break;
			case '/img':
				data.type = 'command';
				data.command = '/img';
				data.message = message.substring(5);
				break;
			case '/dance':
				data.type = 'command';
				data.command = '/dance';
				break;
			case '/w':
				data.type = 'whisper';
				data.to = split[1];
				data.message = message.substring(4 + data.to.length);
				break;
			case '/link':
				data.type = 'command';
				data.command = '/link';
				data.message = message.substring(6);
				break;
			case '/nick':
				data.type = 'command';
				data.command = '/nick';
				data.message = message.substring(6);
				break;
			case '/nonick':
				data.type= 'command';
				data.command = '/nonick';
				break;
			default:
				data.type = 'wrong';
				data.message = 'La commande: ' + command + ' n\'existe pas';
				break;
		}
	}
	else{
		data.type = 'message';
		data.message = message;
	}
	return data;
}

function send(data,socket){
	switch(data.type){
		case 'message':
			socket.emit('message',data);
			break;
		case 'command':
			socket.emit('command',data);
			break;
		case 'whisper':
			socket.emit('whisper',data);
			break;
	}
}

function htmlPrint(message){
	if(message)
		$('#Accueil').prepend(message);
	return message;
}

function htmlMakeS(data,pseudo){
	if(data.type == 'message')
		return '<p><span class="pseudo">' + pseudo + ' dit: </span><em>' + data.message + '</em></p>';

	if(data.type == 'command'){
		switch(data.command){
			case '/me':
				return '<p><em>' + pseudo +' '+data.message +'</em></p>';
				break;
			case '/img':
				return '<p><span class="pseudo">' + pseudo + ' dit: </span><img class="imagechat" src="'+ data.message +'"></img></p>';
				break;
			case '/dance':
				return '<p><span class="pseudo">' + pseudo + ' dit: </span><img class="imagechat" src="/public/images/dance.gif"></img></p>';
				break;
			case '/link':
				if((data.message.indexOf('http://') == 0) || (data.message.indexOf('https://') == 0))
					return '<p><span class="pseudo">' + pseudo + ' dit: </span><a href="'+data.message+'" class="chat_link">'+data.message+'</a>';
				else
					return '<p><span class="pseudo">' + pseudo + ' dit: </span><a href="http://'+data.message+'" class="chat_link">'+data.message+'</a>';
				break;
			
			
		}
	}
	if(data.type == 'whisper')
		return '<p><em class="whisp">[to: ' +data.to+'] : ' + data.message + '</em></p>';
	if(data.type == 'wrong')
		return '<p><span style="color: red;">'+data.message+'</span></p>';
	
}

function htmlMakeR(data){
	if(data.type == 'message')
		return '<p><span class="pseudo">' + data.from + ' dit: </span><em>' + data.message + '</em></p>';

	if(data.type == 'command'){
		switch(data.command){
			case '/me':
				return '<p><em>' + data.from +' '+data.message +'</em></p>';
				break;
			case '/img':
				return '<p><span class="pseudo">' + data.from + ' dit: </span><img class="imagechat" src="'+ data.message +'"></img></p>';
				break;
			case '/dance':
				return '<p><span class="pseudo">' + data.from + ' dit: </span><img class="imagechat" src="/public/images/dance.gif"></img></p>';
				break;
			case '/link':
				if((data.message.indexOf('http://') == 0) || (data.message.indexOf('https://') == 0))
					return '<p><span class="pseudo">' + data.from + ' dit: </span><a href="'+data.message+'" class="chat_link">'+data.message+'</a>';
				else
					return '<p><span class="pseudo">' + data.from + ' dit: </span><a href="http://'+data.message+'" class="chat_link">'+data.message+'</a>';
				break;
			case '/nick':
				return '<p>' + data.from + ' devient ' + data.message + '</p>';
				break;
			case '/nonick':
				return '<p>' + data.from + ' devient ' + data.message + '</p>';
				break;
			
			
		}
	}
	if(data.type == 'whisper'){
		return '<p><em class="whisp">[from: ' +data.from+'] : ' + data.message + '</em></p>';
	}
}










