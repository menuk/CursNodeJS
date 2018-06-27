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
            
const state = {
    players: [],
    enemies: [],
    coins: []
}            

const speed = 5

function collision (obj1, obj2) {
    const sizeSum = (obj1.size/2 + obj2.size/2)
    return (Math.abs(obj1.x - obj2.x) < sizeSum) &&
            (Math.abs(obj1.y - obj2.y) < sizeSum)
}

const WORLD_WIDTH = 500
const WORLD_HEIGHT = 500

function reset () {
    //const { players, enemies, coins } = state
    // const players = state.players
    "use strict";

    var _state = state,
      players = _state.players,
      enemies = _state.enemies,
      coins = _state.coins;

    players.forEach(player => {
        player.x = Math.random() * WORLD_WIDTH
        player.y = Math.random() * WORLD_HEIGHT
        player.score = 0
        })

    while (enemies.length > 0) enemies.pop()
    while (enemies.length < 10) {
        enemies.push({
            x: Math.random() * WORLD_WIDTH,
            y: Math.random() * WORLD_HEIGHT,
            vx: Math.random() > 0.5 ? 1 : -1,
            vy: Math.random() > 0.5 ? 1 : -1,
            size: Math.random() * 20 + 10
        })
    }

    while (coins.length > 0) coins.pop()
    while (coins.length < 10) {
        coins.push({
            x: Math.random() * WORLD_WIDTH,
            y: Math.random() * WORLD_HEIGHT,
            size: Math.random() * 10 + 5
        })
    }
}
reset()   

function anyAlive() {
    var _state = state,
      players = _state.players,
      enemies = _state.enemies,
      coins = _state.coins;
    
    var all_dead = true
    players.forEach(player => {
        if (!player.dead) all_dead = false
    })
    if (all_dead) {
        players.forEach(player => {
            player.dead = false
        })
        reset()
    }
}

function logic () {
    setTimeout(logic, 10)

    //const { players, enemies, coins } = state
    "use strict";

    var _state = state,
      players = _state.players,
      enemies = _state.enemies,
      coins = _state.coins;

    anyAlive()

    //player logic
    players.forEach(player => {
        if (player.dead) return
        "use strict";
        var _player = player,
        keyboard = _player.keyboard;
        if (keyboard.left) player.x -= speed
        if (keyboard.right) player.x += speed
        if (keyboard.up) player.y -= speed
        if (keyboard.down) player.y += speed
        if (keyboard.upleft) {
            player.y -= speed
            player.x -= speed
        }
        if (keyboard.upright) {
            player.y -= speed
            player.x += speed
        }
    })
    
    //coin logic
    coins.forEach((coin, i) => {
        players.forEach(player => {
            if (!player.dead && collision(player, coin)) {
                player.score += Math.ceil(coin.size)
                coins.splice(i, 1)
                if (coins.length === 0) reset()
            }
        })
    })

    //enemy logic
    enemies.forEach(enemy => {
        enemy.x += enemy.vx
        enemy.y += enemy.vy
        if (enemy.x < 0 || WORLD_WIDTH < enemy.x) enemy.vx *= -1
        if (enemy.y < 0 || WORLD_HEIGHT < enemy.y) enemy.vy *= -1
        
        players.forEach(player => {
            if (!player.dead && collision(enemy, player)) {
                player.dead = true
            }
        })      
        enemies.forEach(enemy2 => {
            if (collision(enemy, enemy2) && enemy != enemy2) {
                if (enemy.x < enemy2.x + enemy2.size/2) enemy.vx *= -1
                if (enemy.y < enemy2.y + enemy2.size/2) enemy.vy *= -1
            }
        })          
    })

    io.sockets.emit('state', state)
}
logic()

io.on('connection', (socket) => {
    console.log('player connected')

    const player = {
        x: 0, //Math.random() * WORLD_WIDTH,
        y: 0, //Math.random() * WORLD_HEIGHT,
        size: 20,
        score: 0,
        id: socket.id,
        keyboard: {}
    }

    socket.on('set-username', function (username) {
        player.username = username
    })

    state.players.push(player)

    socket.on('input', function (keyboard) {
        //console.log('got player input', keyboard)
        player.keyboard = keyboard
    })

    socket.on('disconnect', function () {
        state.players.splice(state.players.indexOf(player), 1)
    })
})