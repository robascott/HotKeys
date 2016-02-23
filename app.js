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
  
  io.sockets.in('default').emit('show marker');

  socket.on('show marker (remote)', function(data) {
    socket.broadcast.to('default').emit('show marker (remote)', data)
  })
  
  socket.on('disconnect', function() {
      console.log('user disconnected');
    });

  socket.on('start game', function() {
    io.sockets.in('default').emit('start game')
  })

  socket.on('update progress', function(data) {
    console.log(data);
    socket.broadcast.to('default').emit('update progress (remote)', data);
  });

});

var routes = require('./config/routes');
app.use("/api", routes);

http.listen(3000);