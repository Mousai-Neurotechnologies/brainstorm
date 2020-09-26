var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var bci = require('bcijs');



app.use(express.static('public/p5'))

io.on('connection', (socket) => {
    console.log('new connection: ' + socket.id);

    socket.on('bci',bciSignal)
    socket.on('real_bci',bciSignal)

    function bciSignal(data){
        socket.broadcast.emit('bci', data)
    }

  //   socket.on('chat message', (msg) => {
  //     io.emit('chat message', msg);
  //   });
  });

http.listen(3000, () => {
  console.log('listening on *:3000');
});

console.log('My socket server is running')
