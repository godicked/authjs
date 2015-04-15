
            socket.on('flr', function(){
                 $('#zone_chat').prepend('<p><span class="flr">Tu fous la rage</span>');
                 playSound('flr')
            });

            $('#flr').click(function(){
                message = '/flr';
                var data = parse(message,active);
                send(data,socket);
                var toPrint = htmlMakeS(data,pseudo);
                htmlPrint(toPrint,data.room);
                store(toPrint,localStorage);
                }
            });
         