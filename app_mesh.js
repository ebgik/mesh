var express = require('express');
var path = require('path');
var config = require('config');
var page = require('libs/module_page');
var log = require('libs/log')(module);
var app = express();
var favicon = require('serve-favicon');
var moment = require('moment');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/favicon.ico'));

if (config.get('env') == 'development'){
    app.use(express.logger('dev'));
  } else {
    app.use(express.logger('default'));
  }

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(app.router);

require('./routes')(app);

app.use(express.static(path.join(__dirname,'public')));

app.use(function(req, res, next) {
  res.status(404).render('error',{
    error:'404: Page Not Found',
    id: 1
  });
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).render('error',{
    error:'500: Server Error',
    id: 1
  });
});



io.on('connection', function(socket){
  socket.on('message', function(msg){
    io.emit('message', msg);
  });
});



http.listen(config.get('port'),function(){
  log.info('Express server listening on port '+config.get('port'));
})

