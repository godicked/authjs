var socket = io.connect();
socket.emit('get_id','<%=user._id%>');