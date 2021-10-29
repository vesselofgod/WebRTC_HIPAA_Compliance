'use strict';

//Loading dependencies & initializing express
var os = require('os');
var express = require('express');
var app = express();
var http = require('http');
//For signalling in WebRTC
var socketIO = require('socket.io');

const mysql=require('mysql')
const bodyParser = require('body-parser')
var session = require('express-session')
var MySQLStore = require('express-mysql-session')(session)
const router = require('./router/index')

var ios = require("express-socket.io-session");

var options = {
    host:'localhost',
    user:'root',
    password:'2207',
    database:'user'
}
var sessionStore = new MySQLStore(options)
var session = session({                                            
	secret:"asdfasffdas",
	resave:false,
	saveUninitialized:true
  });

app.set('views','./views')
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended:false}));
app.use(session)
app.use(router)

app.use(express.static('public'))

var server = http.createServer(app);

server.listen(process.env.PORT || 8000);

/*
app.get("/", function(req, res){
	res.render("index.ejs");
});
*/

var io = socketIO(server);
//세션과 소켓 연결
io.use(ios(session,{ autoSave:true }));

io.sockets.on('connection', function(socket) {

	// Convenience function to log server messages on the client.
	// Arguments is an array like object which contains all the arguments of log(). 
	// To push all the arguments of log() in array, we have to use apply().
	function log() {
	  var array = ['Message from server:'];
	  array.push.apply(array, arguments);
	  socket.emit('log', array);
	}
  
  	// 새로운 유저가 접속했을 경우 다른 소켓에게도 알려줌 
	socket.on('newUser', function(name) {
		socket.otherName = socket.handshake.session.ID; ;
		io.sockets.emit('update', {type: 'connect', name: 'SERVER', message: socket.otherName+'님이 접속하였습니다.'})
	})

	// 전송한 메시지 받기 
	socket.on('chat message', function(data) {
		// 받은 데이터에 누가 보냈는지 이름을 추가
		data.otherName = socket.otherName;
		
		console.log(data.otherName+":"+data.message);

		// 보낸 사람을 제외한 나머지 유저에게 메시지 전송
		socket.broadcast.emit('update', data);
	})




    //Defining Socket Connections
    socket.on('message', function(message, room) {
	  log('Client said: ', message);
	  // for a real app, would be room-only (not broadcast)
	  socket.in(room).emit('message', message, room);
	});
  
	socket.on('create or join', function(room) {
	  log('Received request to create or join room ' + room);
  
	  var clientsInRoom = io.sockets.adapter.rooms[room];
	  var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
	  log('Room ' + room + ' now has ' + numClients + ' client(s)');
  
	  if (numClients === 0) {
		socket.join(room);
		log('Client ID ' + socket.id + ' created room ' + room);
		socket.emit('created', room, socket.id);
  
	  } else if (numClients === 1) {
		log('Client ID ' + socket.id + ' joined room ' + room);
		io.sockets.in(room).emit('join', room);
		socket.join(room);
		socket.emit('joined', room, socket.id);
		io.sockets.in(room).emit('ready');
	  } else { 
		// max two clients
		//추후 1:N 채팅구현시 변경
		socket.emit('full', room);
	  }
	});
  
	socket.on('ipaddr', function() {
	  var ifaces = os.networkInterfaces();
	  for (var dev in ifaces) {
		ifaces[dev].forEach(function(details) {
		  if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
			socket.emit('ipaddr', details.address);
		  }
		});
	  }
	});
  
	socket.on('bye', function(){
	  console.log('received bye');
	});
  
  });