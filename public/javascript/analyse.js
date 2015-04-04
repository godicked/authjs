// function parse
function parse(message){
	var data = {};
	if(message.charAt(0) == '/'){
		var split = message.split(' ');
		var command = split[0];
		switch(command){
			case '/clear':
				data.type = 'local command';
				data.command = '/clean';
				break;
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

function apply(data,socket,pseudo){
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
		case 'local command':
			switch(data.command){
				case '/clean':
					$('#zone_chat').empty();
					break;
			}
			break;
	}
	htmlPrint(htmlMake(data,pseudo));
}

function htmlPrint(message){
	if(message)
		$('#zone_chat').prepend(message);
}

function htmlMake(data,pseudo){
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
		}
	}
	
	if(data.type == 'whisper'){
		if(data.from)
			return '<p><em class="whisp">[from: ' +data.from+'] : ' + data.message + '</em></p>';
		else
			return '<p><em class="whisp">[to: ' +data.to+'] : ' + data.message + '</em></p>';
	}
	if(data.type == 'wrong')
		return '<p><span style="color: red;">'+data.message+'</span></p>';
	
}











