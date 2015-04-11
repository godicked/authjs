
var timer;
var rage = 0; 
var blur;
var nouveau=false;
var nomsRooms={};
document.onblur = window.onblur;
document.focus = window.focus;



<<<<<<< HEAD
function actualise_titre(content){
nouveau = true;
	timer = setInterval(function(){
		$('title').html('Nouveau '+content);
		 setTimeout(function(){
			  $('title').html('Hermessage');
		  },1000);
		},2000);
}
function actualise_liste(){
	$('.user').click(function(){
		var pseudo = this.textContent;
		var val = $('#message').val();
		if(val == ''){
			$('#message').val('/w "' + pseudo+'"').focus();
		}else {
			$('#message').val(val + ' '+pseudo).focus();
		}
	});
}

window.onblur = function (){
	blur = true;
}
window.onfocus = function (){
	console.log("on clear l'interval");
	clearInterval(timer);
	nouveau = false;
	document.title='Hermessage';
	blur = false;
	console.log("blur:"+ blur);
	console.log("nouveau" + nouveau);
}

function insere_flr(){
	if(rage < 3){
		$('#zone_chat').prepend('<p><span class="flr">Tu fous la rage</span>');
		playSound('flr');
		rage++;
	}else{
		$('#zone_chat').prepend('<p><em>Relativisez votre rage svp</em></p>');
		playSound('relativisez');
		setTimeout(function(){
			rage = 0;
		},30000);
	}
}

 function playSound(filename)
{
	document.getElementById("sound").innerHTML='<audio autoplay="autoplay"><source src="/public/son/' + filename + '.mp3" type="audio/mpeg" /> /><embed hidden="true" autostart="true" loop="false" src="/public/' + filename + '.mp3" /></audio>';
}
function actualise_liste_room()
{
	$('.room').click(function()
	{
		var rooms = $('.room');
		if($('.room-active').length != 0){
			var room_active = $('.room-active')[0];
			var room_active_hide = stringToId(nomsRooms[$(room_active).attr('id')]);
		}
		var div = stringToId(nomsRooms[$(this).attr('id')]);
		for(i= 0;i<rooms.length;i++)
		{
			var hide = stringToId(nomsRooms[$(rooms[i]).attr('id')]);
			if(hide != div)
			{
				$("#room_"+hide).hide(0);
			}
		}
		$('#room_'+div).show(0);
		if($('.room-active').length != 0)
		{
			$('#room_'+room_active_hide).hide(0);
		}
		$(this).attr('class','room-active');
		$(room_active).attr('class','room');
		active = idToString(div);
		notifs[active] = 0;
		$($(this).children()[0]).empty();
	});
}

function actualise_own_list(func){
	$('.own_room').click(function(){
		var index = $(this).index();
		func(index);
	});
}

function printInfo(index){
	$('#name').empty().append(room_information[index].name);
	$('#volume').empty().append(room_information[index].volume);
	$('#moderator').empty();
	room_information[index].moderator.forEach(function(p){
		$('#moderator').append(p);
	});
	$('#whitelist').empty();
	room_information[index].whitelist.forEach(function(p){
		$('#whitelist').append(p);
	});
	$('#blacklist').empty();
	room_information[index].blacklist.forEach(function(p){
		$('#blacklist').append(p);
	});
	
}

function actualise_liste_recherche(tab)
{
	$('.liste_recherche').click(function()
	{
		var content = this.innerText;
		if((tab.indexOf(content)) < 0)
		{
			console.log('test')
			data = {
				command : '/join',
				message : content
			};
			socket.emit('room',data);
			$('#container_recherche').hide(0);
		}
		else
		{
			$('#div_fond_popup').show(0);
			$('#div_form_pass').show(0);
			$('#entrer_room_pass').focus();
			entrer_room(content);
		}
	});
}
function entrer_room(room)
{
	$('#form_pass').submit(function()
	{
		var pass= $('#entrer_room_pass').val();
		var data = {
				command : '/join',
				message : room,
				password : pass
			};
		socket.emit('room',data);
		$('#div_form_pass').hide(0);
		$('#div_fond_popup').hide(0);
		return false;
	});
}
function ajoute_notif(room, tab)
{
	var res = "<span class='notif'>"+tab[room]+"</span>";
	return res;
}

