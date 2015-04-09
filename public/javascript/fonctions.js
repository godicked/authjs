
            socket.on('flr', function(){
                 $('#zone_chat').prepend('<p><span class="flr">Tu fous la rage</span>');
                 playSound('flr')
            });

            $('span').click(function(){
                if(this.id == 'flr'){
                    if(rage<3){
                        socket.emit('flr',{});
                    }
                    insere_flr();
                  
                }
            });
         