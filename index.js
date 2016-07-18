var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + 'public/index.html');
});

var clients = new Map();

io.use(function(socket, next){
	let username = socket.handshake.query.username;
	console.log(socket.id);
	console.log(username);
	if(!username){
		console.log("error: no username given")
		next(new Error('no username given'));
	}else{
		console.log("handshake successful")
		clients.set(socket.id, username);
		next();
	}
})

io.on('connection', function(socket){
  let username = clients.get(socket.id);
  console.log('a user connected: '+socket.id+' as '+username);
  let user = {};
  user.name = username;
  console.log(clients.values());
  let arr = Array.from(clients.values());

  io.emit('user update', arr);
  
  socket.on('disconnect', function(){
    console.log('user disconnected:'+username);
    clients.delete(socket.id);
    let arr = Array.from(clients.values());
    io.emit('user update', arr);
  });

  socket.on('chat message', function(msg){
  	console.log('message: ' + msg);
  	let out = {};
  	out.msg = msg;
  	out.username = username;
    io.emit('chat message', out);
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});