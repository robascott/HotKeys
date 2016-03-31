var express        = require('express');
var cors           = require('cors');
var path           = require('path');
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var mongoose       = require('mongoose');
var passport       = require('passport');
var cookieParser   = require("cookie-parser");
var methodOverride = require("method-override");
var jwt            = require('jsonwebtoken');
var expressJWT     = require('express-jwt');
var favicon        = require('serve-favicon');
var app            = express();
var http           = require('http').Server(app);
var io             = require('socket.io').listen(http);

var config         = require('./config/config');
var User           = require('./models/user');
var Race           = require('./models/race');
var secret         = require('./config/config').secret;

mongoose.connect(config.database);

require('./config/passport')(passport);

app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method
    delete req.body._method
    return method
  }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors());
app.use(passport.initialize());
app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', expressJWT({ secret: secret })
  .unless({
    path: [
      { url: '/api/login', methods: ['POST'] },
      { url: '/api/register', methods: ['POST'] }
    ]
  }));

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({message: 'Unauthorized request.'});
  }
  next();
});


// Listen on connection event
io.on('connection', function(socket){

  console.log('user connected');
  
  // Join (pre-game) default room
  socket.room = 'initRoom';
  socket.join(socket.room);

  socket.on('switchRoom', function(data){
    socket.leave(socket.room);
    socket.join(data.room);
    socket.room = data.room;
    console.log('switched room');

    // Ask players in room whether a game is currently in progress
    socket.broadcast.to(socket.room).emit('sendGameState');
  });

  // Ask players for their info
  socket.on('getPlayerInfo', function() {
    io.sockets.in(socket.room).emit('sendInfoToServer');
  })

  // Pass player information to other players
  socket.on('passingInfoToServer', function(data) {
    socket.broadcast.to(socket.room).emit('refreshPlayerInfo', data);
  })

  // Inform players of other players' game state
  socket.on('sendingGameStateToServer', function(data) {
    io.sockets.in(socket.room).emit('sendingGameStateToClient', data);
  });
  
  socket.on('disconnect', function() {
    console.log('user disconnected');
    socket.broadcast.to(socket.room).emit('playerLeft', {id:socket.id.substring(2)});
    socket.broadcast.to(socket.room).emit('removeUser');
  });

  // When player leaves room
  socket.on('leaveRoom', function(data) {
    socket.emit('stopClock');

    // Inform other players
    socket.broadcast.to(socket.room).emit('playerLeft', {id:socket.id.substring(2)});
    socket.broadcast.to(socket.room).emit('removeUser');

    // Get list of currently open rooms
    var roomsObj = io.sockets.adapter.rooms;
    var roomsArray = [];

    // Remove player from all rooms
    Object.keys(roomsObj).forEach(function(room) {
      socket.leave(room);
    });

    // Rejoin default room
    socket.room = 'initRoom';
    socket.join(socket.room);
  });

  
  // Inform players that game has been started
  socket.on('startingGame', function(data) {
    // io.sockets.in(socket.room).emit('startGame', data);
    socket.broadcast.to(socket.room).emit('startGame', data);
  });

  // Send updated players stats to other players
  socket.on('sendingStatsToServer', function(data) {
    socket.broadcast.to(socket.room).emit('updatePlayerStats', data);
  });

  // Inform other players that a player has finished the race
  socket.on('completedRace', function(data) {
    socket.broadcast.to(socket.room).emit('showPlayerPosition', data);
  });

  // Inform other players that the game is over
  socket.on('endingGame', function(data) {
    socket.broadcast.to(socket.room).emit('showPlayerPosition', data);
    io.sockets.in(socket.room).emit('endGame');
  });

  socket.on('sendingNewNameToServer', function(data) {
    socket.broadcast.to(socket.room).emit('updatePlayerName', data);
  });

  socket.on('getRooms', function() {
    var roomsObj = io.sockets.adapter.rooms;
    var roomsArray = [];

    Object.keys(roomsObj).forEach(function(key) {
      if (key[0]!=='/' || key[0]!=='i') {
        roomsArray.push(key);
      }
    });
  })

});

var routes = require('./config/routes');
app.use("/api", routes);

app.use(function(req, res) {
  res.sendfile(__dirname + '/public/index.html');
});


http.listen(process.env.PORT || 3000 )