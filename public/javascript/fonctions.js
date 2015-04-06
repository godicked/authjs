$(document).ready(function() {
            // Connexion à socket.io
            

         
            //==========================GESTION DES CONNEXIONS CLIENTS===============
               // On demande le pseudo, on l'envoie au serveur et on l'affiche dans le titre

           
            /*io.socket.on('disconnect',function(){
                socket.emit('deconnexion', pseudo);
            });*/
           
            // Quand un nouveau client se connecte, on affiche l'information
            
           /* socket.on('deconnexion',function(pseudo){
                $('#zone_chat').prepend('<p><em>' + pseudo + ' a quitté le Chat !</em></p>');
            });*/
            // Lorsqu'on envoie le formulaire, on transmet le message et on l'affiche sur la page
            //========================GESTION DES MESSAGES===================================
             // Quand on reçoit un message, on l'insère dans la page
            socket.on('message', function(data) {
                if(data.message != null){

                    insereMessage(data.pseudo, data.message);
                     if($('#zone_chat').children().length <= 200){
                         $('#zone_chat').children().splice(-0,1);
                     }
                    if(blur == true && nouveau==false){
                       actualise_titre();
                    }
                }
            });
            socket.on('flr', function(){
                 $('#zone_chat').prepend('<p><span class="flr">Tu fous la rage</span>');
                 playSound('flr')
            });

            $('#formulaire_chat').submit(function () {
                var message = $('#message').val();
                if(message != ''){
                    socket.emit('message', {message:message,pseudo:pseudo}); // Transmet le message aux autres
                    insereMessage(pseudo, message); // Affiche le message aussi sur notre page
                    $('#message').val('').focus(); // Vide la zone de Chat et remet le focus dessus
                    return false; // Permet de bloquer l'envoi "classique" du formulaire
                } else { //gestion des messages vides
                    $('#message').val('').focus(); // Vide la zone de Chat et remet le focus dessus
                    return false; // Permet de bloquer l'envoi "classique" du formulaire
                }
            });
            $('span').click(function(){
                if(this.id == 'flr'){
                    if(rage<3){
                        socket.emit('flr',{});
                    }
                    insere_flr();
                  
                }
            });
            socket.on('test',console.log('test'));
            /*socket.on('disconnected', function() {

                 socket.emit('deconnexion', pseudo);

            });
            socket.on('deconnexion', function(pseudo) {
                   $('#zone_chat').prepend('<p><em>' + pseudo + ' a quitté le Chat !</em></p>'); 
            });*/});