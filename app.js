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
  
  socket.room = 'initRoom';
  socket.join(socket.room);

  socket.on('switchRoom', function(data){
    socket.leave(socket.room);
    socket.join(data.room);
    socket.room = data.room;

    socket.broadcast.to(socket.room).emit('show marker');

    console.log('switched room');
  });

  socket.on('is game running', function() {
    io.sockets.in(socket.room).emit('get game state');
  });

  socket.on('reporting game state to server', function(data) {
    io.sockets.in(socket.room).emit('reporting game state to client', data);
  });

  socket.on('show marker (remote)', function(data) {
    socket.broadcast.to(socket.room).emit('show marker (remote)', data);
  });
  
  socket.on('disconnect', function() {
      console.log('user disconnected');
      socket.broadcast.to(socket.room).emit('player left', {id:socket.id.substring(2), position:'DNF'});
      socket.broadcast.to(socket.room).emit('remove user');
    });

  socket.on('start game', function(data) {
    io.sockets.in(socket.room).emit('start game', data);
  });

  socket.on('update markers', function(data) {
    socket.broadcast.to(socket.room).emit('update markers', data);
  });

  socket.on('reached finish', function(data) {
    socket.broadcast.to(socket.room).emit('player finished', data);
  });

  socket.on('race over', function(data) {
    socket.broadcast.to(socket.room).emit('player finished', data);
    io.sockets.in(socket.room).emit('end game');
  });

  socket.on('update name', function(data) {
    socket.broadcast.to(socket.room).emit('update name', data);
  });

  socket.on('get rooms', function() {
    var roomsObj = io.sockets.adapter.rooms;
    var roomsArray = [];

    Object.keys(roomsObj).forEach(function(key) {
      if (key[0]==='r') {
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