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
	else if(message.indexOf('https://www.youtube.com/watch?v=') == 0)
	{
		data.type='video';
		var split = message.split(' ')[0];
		data.message = split.substring('https://www.youtube.com/watch?v='.length,'https://www.youtube.com/watch?v='.length+11);
	}
	else
	{
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
		case 'video':
			socket.emit('video',data);
			break;
			
	}
}

function htmlPrint(message,room){
	if(message){
		$('#room_'+stringToId(room)).prepend(message);
	}
}

function htmlMakeS(data,pseudo){
	
	var res = "";
	if(data.type == 'message')
		res = '<span class="pseudo">' + pseudo + ' dit: </span><span>' + data.message + '</span></p>';

	else if(data.type == 'command'){
		switch(data.command){
			case '/me':
				res = '<em>' + pseudo +' '+data.message +'</em></p>';
				break;
			case '/img':
				res = '<span class="pseudo">' + pseudo + ' dit: </span><img class="imagechat" src="'+ data.message +'"></img></p>';
				break;
			case '/dance':
				res = '<span class="pseudo">' + pseudo + ' dit: </span><img class="imagechat" src="/public/images/dance.gif"></img></p>';
				break;
			case '/link':
				if((data.message.indexOf('http://') == 0) || (data.message.indexOf('https://') == 0))
					res = '<span class="pseudo">' + pseudo + ' dit: </span><a href="'+data.message+'" class="chat_link" target="_blank" >'+data.message+'</a>';
				else
					res = '<span class="pseudo">' + pseudo + ' dit: </span><a href="http://'+data.message+'" class="chat_link" target="_blank" >'+data.message+'</a>';
				break;
			case '/saussage':
				res = '<span class="pseudo">' + pseudo + ' dit: </span><img class="imagechat" src="/public/images/saussage.gif"></img></p>';
				break;
			case '/fu':
				res = '<span class="pseudo">' + pseudo + ' dit: </span><img class="imagechat" src="/public/images/fu.gif"></img></p>';
				break;
			case '/glou':
				res = '<span class="pseudo">' + pseudo + ' dit: </span><img class="imagechat" src="/public/images/glou.gif"></img></p>';
				break;
		}
	}
	else if(data.type == 'video')
		res = '<span class="pseudo">' + pseudo +" envoie:<iframe class='grande_video' width='560' height='315' src='https://www.youtube.com/embed/"+data.message+"'frameborder='0' allowfullscreen></iframe>";
	else if(data.type == 'whisper')
		res = '<em class="whisp">[to: ' +data.to+'] : ' + data.message + '</em></p>';
	else if(data.type == 'wrong')
		res = '<span style="color: red;">'+data.message+'</span></p>';
	else
		return ' ';
	return '<p><span class="time">['+time()+']</span> '+res;
	
}

function htmlMakeR(data){
	var res = "";
	if(data.type == 'message'){
		if(data.message.indexOf(name) == -1)
			res = '<span class="pseudo" title="'+data.who+'">' + data.from + ' dit: </span><span>' + data.message + '</span></p>';
		else
		{
			var index = data.message.indexOf(name);
			var ante = data.message.substring(0,index);
			var center = data.message.substring(ante.length,ante.length+name.length);
			var post = data.message.substring(ante.length+name.length);
			res = '<span class="pseudo" title="'+data.who+'">' + data.from + ' dit: </span><span>' + ante + '<span style="color:red">'+center+'</span>' +post+ '</span></p>';
		}
	}
	else if(data.type == 'command'){
		switch(data.command){
			case '/me':
				res = '<em>' + data.from +' '+data.message +'</em></p>';
				break;
			case '/img':
				res = '<span class="pseudo" title="'+data.who+'" >' + data.from + ' dit: </span><img class="imagechat" src="'+ data.message +'"></img></p>';
				break;
			case '/dance':
				res = '<span class="pseudo"title="'+data.who+'" >' + data.from + ' dit: </span><img class="imagechat" src="/public/images/dance.gif"></img></p>';
				break;
			case '/link':
				if((data.message.indexOf('http://') == 0) || (data.message.indexOf('https://') == 0))
					res = '<span class="pseudo" title="'+data.who+'">' + data.from + ' dit: </span><a href="'+data.message+'" target="_blank" class="chat_link">'+data.message+'</a>';
				else
					res = '<span class="pseudo" title="'+data.who+'">' + data.from + ' dit: </span><a href="http://'+data.message+'" class="chat_link" target="_blank" >'+data.message+'</a>';
				break;
			case '/nick':
				res = '' + data.from + ' devient ' + data.message + '</p>';
				break;
			case '/nonick':
				res = '' + data.from + ' devient ' + data.message + '</p>';
				break;
			case '/saussage':
				res = '<span class="pseudo" title="'+data.who+'">' + data.from + ' dit: </span><img class="imagechat" src="/public/images/saussage.gif"></img></p>';
				break;
			case '/fu':
				res = '<span class="pseudo"title="'+data.who+'">' + data.from + ' dit: </span><img class="imagechat" src="/public/images/fu.gif"></img></p>';
				break;
			case '/glou':
				res = '<span class="pseudo"title="'+data.who+'">' + data.from + ' dit: </span><img class="imagechat" src="/public/images/glou.gif"></img></p>';
				break;
		}
	}
	else if(data.type == 'video')
		res = '<span class="pseudo"title="'+data.who+'">' + data.from +" envoie:<iframe class='grande_video' width='560' height='315' src='https://www.youtube.com/embed/"+data.message+"'frameborder='0' allowfullscreen></iframe>";
	else if(data.type == 'whisper'){
		res = '<em class="whisp" title="'+data.who+'">[from: ' +data.from+'] : ' + data.message + '</em></p>';
	}
	
	if(data.time)
		return '<p><span class="time">['+data.time+']</span> '+res;
	else
		return '<p>'+res;
	
}

function time()
{
	var d = new Date();
	var h = d.getHours();
	var m = d.getMinutes();
	return h+':'+m;
}








