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

io.on('connection', function(socket){
  socket.join('default');

  console.log('user connected');
  
  this.emit('show marker');

  socket.on('show marker (remote)', function(data) {
    socket.broadcast.to('default').emit('show marker (remote)', data);
  })
  
  socket.on('disconnect', function() {
      console.log('user disconnected');
      socket.broadcast.to('default').emit('remove user', {id:socket.id});
    });

  socket.on('start game', function() {
    io.sockets.in('default').emit('start game')
  })

  socket.on('update progress', function(data) {
    socket.broadcast.to('default').emit('update progress (remote)', data);
  });

  socket.on('race over', function(data) {
    socket.broadcast.to('default').emit('player finished', data);
  })


  socket.on('update name', function(data) {
    socket.broadcast.to('default').emit('update name', data);
  });

});

var routes = require('./config/routes');
app.use("/api", routes);

http.listen(3000);