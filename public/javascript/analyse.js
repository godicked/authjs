// function parse
function parse(message,room){
	var data = {};
	data.room = room;
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
				if(split[1].charAt(0) == '"'){
					data.to = message.split('"')[1];
					data.message = message.substring(6 + data.to.length);
				}
				else{
					data.to = split[1];
					data.message = message.substring(4 + data.to.length);
				}
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
			case '/create':
				data.type = 'room';
				data.command = '/create';
				data.message = message.substring(8);
				break;
			case '/delete':
				data.type = 'room';
				data.command = '/delete';
				data.message = message.substring(8);
				break;
			case '/join':
				data.type = 'room';
				data.command = '/join';
				data.message = message.substring(6);
				break;
			case '/leave':
				data.type = 'room';
				data.command = '/leave';
				data.message = message.substring(7);
				break;
			case '/saussage':
				data.type = 'command';
				data.command = '/saussage';
				break;
			case '/fu':
				data.type = 'command';
				data.command = '/fu';
				break;
			case '/glou':
				data.type = 'command';
				data.command = '/glou';
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
		case 'room':
			socket.emit('room',data);
			break;
		case 'room_list':
			socket.emit('room_list',data.message);
			break;
			
	}
}

function htmlPrint(message,room){
	if(message)
		$('#room_'+room).prepend(message);
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
			case '/saussage':
				return '<p><span class="pseudo">' + pseudo + ' dit: </span><img class="imagechat" src="/public/images/saussage.gif"></img></p>';
				break;
			case '/fu':
				return '<p><span class="pseudo">' + pseudo + ' dit: </span><img class="imagechat" src="/public/images/fu.gif"></img></p>';
				break;
			case '/glou':
				return '<p><span class="pseudo">' + pseudo + ' dit: </span><img class="imagechat" src="/public/images/glou.gif"></img></p>';
				break;
		}
	}
	if(data.type == 'whisper')
		return '<p><em class="whisp">[to: ' +data.to+'] : ' + data.message + '</em></p>';
	if(data.type == 'wrong')
		return '<p><span style="color: red;">'+data.message+'</span></p>';
	else
		return '';
	
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
			case '/saussage':
				return '<p><span class="pseudo">' + data.from + ' dit: </span><img class="imagechat" src="/public/images/saussage.gif"></img></p>';
				break;
			case '/fu':
				return '<p><span class="pseudo">' + data.from + ' dit: </span><img class="imagechat" src="/public/images/fu.gif"></img></p>';
				break;
			case '/glou':
				return '<p><span class="pseudo">' + data.from + ' dit: </span><img class="imagechat" src="/public/images/glou.gif"></img></p>';
				break;
		}
	}
	if(data.type == 'whisper'){
		return '<p><em class="whisp">[from: ' +data.from+'] : ' + data.message + '</em></p>';
	}
}










