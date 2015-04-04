function getStorage(localStorage){
	if(localStorage.chat1){
		$('#zone_chat').append(localStorage.chat1);
		if(localStorage.chat2)
			$('#zone_chat').append(localStorage.chat2);
	}
}
function store(text,localStorage){
	localStorage.chat1 = text+localStorage.chat1;
	localStorage.nb1 = Number(localStorage.nb1) + 1;
	if(localStorage.nb1 > 300){
		localStorage.chat2 = localStorage.chat1;
		localStorage.chat1 = " ";
		localStorage.nb1 = 0;
	}
}
function initStore(localStorage){
	if(!localStorage.chat1){
		localStorage.chat1 = " ";
		localStorage.nb1 = 0;
	}
	if(!localStorage.chat2)
		localStorage.chat2 = " ";
}
function clearStorage(localStorage){
	localStorage.chat1 = " ";
	localStorage.chat2 = " ";
	localStorage.nb1 = 0;
}