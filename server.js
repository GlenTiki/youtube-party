var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var events = require('events');

var room = require('./room');

var ip = require('my-local-ip')();

var eventEmitter = new events.EventEmitter();

var lastState;
var playerHere = false;

app.use(express.static(path.join(__dirname, 'public')));

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', function(req, res){
  res.sendfile(__dirname+'/views/index.html');
});

app.get('/client', function(req, res){
  res.sendfile(__dirname+'/views/index.html');
});

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.sendfile(__dirname+'/views/error.html')
});

io.on('connection', function(socket){
  console.log('a user connected');

  socket.emit('server address', ip+':3000/');

  var playerStillHereTimeout = setTimeout(function(){}, 0);

  setInterval(function(){
    emitQueue();
  }, 1000);

  socket.on('player added', function(){
    verifyPlayerStillHereCountdown();
    emitQueue();
    socket.broadcast.emit('new player added');
  });

  socket.on('player still here', verifyPlayerStillHereCountdown);

  function verifyPlayerStillHereCountdown(){
    playerHere = true;
    socket.broadcast.emit('player here', playerHere);

    clearTimeout(playerStillHereTimeout);

    playerStillHereTimeout = setTimeout(function(){
      console.log('just set playerHere to false...');
      playerHere = false;
      socket.broadcast.emit('player here', playerHere);
    }, 30000);
  }

  socket.on('player state change', function(evt){
    console.log('player state changed');
    verifyPlayerStillHereCountdown();
    socket.broadcast.emit('player state change', evt);
    lastState = evt;
  });

  socket.on('controller joined', function(evt){
    if(lastState) socket.emit('player state change', lastState)

    socket.emit('player here', playerHere);
  });

  socket.on('pop top of queue', function(songId){
    if(songId === room.getQueue()[0]){
      room.pushTopSongToEnd();
    }
    emitQueue();
  });

  socket.on('delete song by id', function(id){
  	var pl = room.getQueue();
  	var i = pl.indexOf(id);
  	room.deleteSong(i);
    emitQueue();
  });

  socket.on('add song', function(newId){
  	room.addSongToQueue(newId);
    var i = room.getQueue().length-1;

    room.moveSong(i, 1);
    emitQueue();
  });

  socket.on('bring to front', function(id){
  	var pl = room.getQueue();
  	var i = pl.indexOf(id);

  	room.moveSong(i, 1);
    emitQueue();
  });

  socket.on('push to back', function(id){
  	var pl = room.getQueue();
  	var i = pl.indexOf(id);
  	room.deleteSong(i);
  	room.addSongToQueue(id);
    emitQueue();
  });

  socket.on('pause song', function(){
    socket.broadcast.emit('pause song');
  })

  socket.on('play song', function(){
    socket.broadcast.emit('play song');
  })

  socket.on('play now', function(id){
    var pl = room.getQueue();
    var i = pl.indexOf(id);
    room.moveSong(i, 0);
    emitQueue();
  })

  function emitQueue(){
    socket.emit('current queue', room.getQueue());
  }
});

http.listen(3000, function(){
  console.log('listening on *:3000');
  eventEmitter.emit('ready');
});

module.exports = eventEmitter;

