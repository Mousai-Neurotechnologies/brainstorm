var express = require('express')
var app = express();
var debug = require('debug')('myexpressapp:server');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var bci = require('bcijs');

var port = normalizePort(process.env.PORT || '80');


app.use(express.static('public/p5'))

io.on('connection', (socket) => {
    console.log('new connection: ' + socket.id);

    socket.on('bci',bciSignal)
    socket.on('real_bci',bciSignal)

    function bciSignal(data){
        socket.broadcast.emit('bci', data)
    }

    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
  });

app.set('port', port);

http.listen(parseInt(port), () => {
  console.log('listening on *:' + port);
});

http.on('error', onError);
http.on('listening', onListening);

console.log('My socket server is running')


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = http.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

