// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
/*define app.get('socket.io/socket.io.js', function () {
    //devuelve libreria socket io cliente
  })
  
  */

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));
//sirve arxivos estaticos, si me mandan una request GET quecoincide con el PATH s me dara el arxivo en la carpeta public

var sockets = []

io.on('connection', (socket) => {
  console.log('got a connection!', socket.id)

  var username
  
  socket.on('msg', function(message) {
    console.log(socket.id, message)
    socket.emit('welcome')
  })

  sockets.push(socket)

  socket.on('set-username', function (_username) {
    username = _username
  })

  socket.on('msg', function (msg) {
    sockets.forEach(socket => {
      socket.emit(
        'msg',
        //user
        //username + user
        `${username}: ${msg}`
      )
    })
  })

});
//cuando hay un evento de tipo conection ejecuta esto. Puedo mandar mensajes al cliente o añadir funciones.