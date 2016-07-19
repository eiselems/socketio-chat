"use strict";

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var hri = require('human-readable-ids').hri;
var messages = [{'msg':'This sadly gets flushed once Heroku restarts the dyno', 'username':'dummy'}];


app.use(express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + 'public/index.html');
});

var clients = new Map();

io.on('connection', function(socket){
  

  console.log('a user connected: '+socket.id+' as '+getName(socket));
  
  let arr = Array.from(clients.values());

  socket.emit('name change', getName(socket));
  socket.emit('messages', messages);
  io.emit('user update', arr);
  
  socket.on('disconnect', function(){
    console.log('user disconnected:'+getName(socket));
    clients.delete(socket.id);
    let arr = Array.from(clients.values());
    io.emit('user update', arr);
  });

  socket.on('chat message', function(msg){
  	console.log('message: ' + msg);
  	let out = {};
  	out.msg = msg;
  	out.username = getName(socket);
    io.emit('chat message', out);
    messages.push(out);
    if(messages.length>10){
      messages.shift();
    }
  });

  socket.on('trigger name change', function(username){
  	console.log('changing name to: ' + username);
  	clients.set(socket.id, username);
    socket.emit('name change', username);
    let arr = Array.from(clients.values());
    io.emit('user update', arr);

  });

});

var getName = function(socket){
	if(clients.has(socket.id)){
		return clients.get(socket.id);
	}else{
		let randomName = hri.random();
		clients.set(socket.id, randomName);
		return randomName;
	}
};
var port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log('listening on *:'+port);
});