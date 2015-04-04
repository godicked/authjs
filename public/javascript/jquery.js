
            // Connexion à socket.io
            var timer;
            var rage = 0; 
            var blur;
            var nouveau=false;
            document.onblur = window.onblur;
            document.focus = window.focus;
            
            // Ajoute un message dans la page
          
            function actualise_titre(){
            nouveau = true;
                timer = setInterval(function(){
                    $('title').html('Nouveau message');
                     setTimeout(function(){
                          $('title').html('Hermessage');
                      },1000);
                    },2000);
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

            function actualise_liste(){
                $('.user').click(function(){
                    var pseudo = this.textContent;
                    var val = $('#message').val();
                    if(val == ''){
                        $('#message').val('/w ' + pseudo+' ').focus();
                    }else {
                        $('#message').val(val + ' '+pseudo).focus();
                    }
                });
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

             function playSound(filename){   
                document.getElementById("sound").innerHTML='<audio autoplay="autoplay"><source src="/public/' + filename + '.mp3" type="audio/mpeg" /> /><embed hidden="true" autostart="true" loop="false" src="/public/' + filename + '.mp3" /></audio>';
            }
            
