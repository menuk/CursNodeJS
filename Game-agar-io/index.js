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
app.use(express.static(path.join(__dirname, 'Public')));
//sirve arxivos estaticos, si me mandan una request GET quecoincide con el PATH s me dara el arxivo en la carpeta public
            
const state = {
    players: [],
    enemies: [],
    foods: [],
    speed_buff: [],
    reboting_buff: []
}            

const speed = 3.5

//Para circulos: raiz x^2 + y^2 o (x1+y2)^2 --> (x2-x1)^2 + (y1-y2)^2 <= (r1+r2)^2
function collision (obj1, obj2) {
    const sizeSum = (obj1.size + (obj2.size/4))
    return ((obj1.x - obj2.x)*(obj1.x - obj2.x)+(obj1.y - obj2.y)*(obj1.y - obj2.y) <= (sizeSum*sizeSum))
}

const WORLD_WIDTH = 7000
const WORLD_HEIGHT = 7000

function reset () {
    //const { players, enemies, foods } = state
    // const players = state.players 
    "use strict";

    var _state = state,
      players = _state.players,
      enemies = _state.enemies,
      foods = _state.foods,
      speed_buff = _state.speed_buff,
      reboting_buff = _state.reboting_buff;

    players.forEach(player => {
        player.x = Math.random() * WORLD_WIDTH
        player.y = Math.random() * WORLD_HEIGHT
        player.score = 0
        player.size = 20
        player.speed_buff_count = 0
        player.reboting_buff_count = 0
        })

    while (enemies.length > 0) enemies.pop()
    while (enemies.length < 25) {
        enemies.push({
            x: Math.random() * WORLD_WIDTH,
            y: Math.random() * WORLD_HEIGHT,
            vx: Math.random() > 0.5 ? 1 : -1,
            vy: Math.random() > 0.5 ? 1 : -1,
            size: Math.random() * 20 + 10
        })
    }

    while (foods.length > 0) foods.pop()
    while (foods.length < 1000) {
        foods.push({
            x: Math.random() * WORLD_WIDTH,
            y: Math.random() * WORLD_HEIGHT,
            size: 10 //Math.random() * 10 + 5
        })
    }

    while (speed_buff.length > 0) speed_buff.pop()
    while (speed_buff.length < 20) {
        speed_buff.push({
            x: Math.random() * WORLD_WIDTH,
            y: Math.random() * WORLD_HEIGHT,
            size: 10 //Math.random() * 10 + 5
        })
    }

    while (reboting_buff.length > 0) reboting_buff.pop()
    while (reboting_buff.length < 15) {
        reboting_buff.push({
            x: Math.random() * WORLD_WIDTH,
            y: Math.random() * WORLD_HEIGHT,
            size: 10 //Math.random() * 10 + 5
        })
    }
}
reset()   

function anyAlive() {
    var _state = state,
      players = _state.players,
      enemies = _state.enemies,
      foods = _state.foods,
      speed_buff = _state.speed_buff,
      reboting_buff = _state.reboting_buff;
    
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

function died(player) {
    player.x = Math.random() * WORLD_WIDTH
    player.y = Math.random() * WORLD_HEIGHT
    player.score = 0
    player.size = 20
    player.speed_buff_count = 0
    player.reboting_buff_count = 0
}

function logic () {
    setTimeout(logic, 10)
 
    //const { players, enemies, foods } = state
    "use strict";

    var _state = state,
      players = _state.players,
      enemies = _state.enemies,
      foods = _state.foods,
      speed_buff = _state.speed_buff,
      reboting_buff = _state.reboting_buff;

    anyAlive()

    //player logic
    players.forEach(player => {
        if (player.dead) return
        "use strict";
        var _player = player,
        keyboard = _player.keyboard;
        var buff = 0
        if (player.speed_buff_count > 0) {
            buff = 3
            --player.speed_buff_count
        }
        if (player.reboting_buff_count > 0) --player.reboting_buff_count
        if (player.clone_buff_count > 160) buff += 1
        player.vx = 0
        player.vy = 0
        if (keyboard.left) player.vx = -(speed - player.size/250 + buff)
        if (keyboard.right) player.vx = +(speed - player.size/250 + buff)
        if (keyboard.up) player.vy = -(speed - player.size/250 + buff)
        if (keyboard.down) player.vy = +(speed - player.size/250 + buff)
        var temp1 = player.x
        var temp2 = player.y
        player.x += player.vx
        player.y += player.vy
        if (player.x < 0 || WORLD_WIDTH < player.x) {
            player.x = temp1
            //player.y += player.vy
        }
        if (player.y < 0 || WORLD_HEIGHT < player.y) {
            //player.x += player.vx
            player.y = temp2
        }
        /*if (keyboard.upleft) {
            player.y -= speed
            player.x -= speed
        }
        if (keyboard.upright) {
            player.y -= speed
            player.x += speed
        }*/
        if (player.clone_buff_count > 0) --player.clone_buff_count
        if (player.clone_buff_count < 0) ++player.clone_buff_count
        if (keyboard.space) {
            if (player.clone_buff_count === 0) {
                player.size = player.size/2
                player.clone_buff_count = -200,
                players.push({
                    x: player.x,
                    y: player.y,
                    vx: player.vx,
                    vy: player.vy,
                    size: player.size,
                    score: player.score,
                    id: player.id,
                    speed_buff_count: 0,
                    reboting_buff_count: 0,
                    clone_buff_count: 200,
                    keyboard: player.keyboard
                })
            }
        }
        players.forEach(player2 => {
            if (player != player2 && !player.dead && !player2.dead && collision(player, player2)) {
                if (player.size > player2. size) {
                    //if (player2.id === player.id) 
                    player.score += Math.ceil(player2.size/50)
                    player.size += Math.ceil(player2.size/50)
                    died(player2)
                }
            }
        })
    })
    
    //food logic
    foods.forEach((food, i) => {
        players.forEach(player => {
            if (!player.dead && collision(player, food)) {
                player.score += Math.ceil(food.size/50)
                player.size += Math.ceil(food.size/50)
                foods.splice(i, 1)
                foods.push({
                    x: Math.random() * WORLD_WIDTH,
                    y: Math.random() * WORLD_HEIGHT,
                    size: 10 //Math.random() * 10 + 5
                })
            }
        })
    })

    //speed_buff logic
    speed_buff.forEach((speed, i) => {
        players.forEach(player => {
            if (!player.dead && collision(player, speed)) {
                player.speed_buff_count = 100
                speed_buff.splice(i, 1)
                speed_buff.push({
                    x: Math.random() * WORLD_WIDTH,
                    y: Math.random() * WORLD_HEIGHT,
                    size: 10 //Math.random() * 10 + 5
                })
            }
        })
    })

    //reboting_buff logic
    reboting_buff.forEach((reboting, i) => {
        players.forEach(player => {
            if (!player.dead && collision(player, reboting)) {
                player.reboting_buff_count = 300
                reboting_buff.splice(i, 1)
                reboting_buff.push({
                    x: Math.random() * WORLD_WIDTH,
                    y: Math.random() * WORLD_HEIGHT,
                    size: 10 //Math.random() * 10 + 5
                })
            }
        })
    })

    //enemy logic
    enemies.forEach(enemy => {
        enemy.x += enemy.vx
        enemy.y += enemy.vy
        if (enemy.x < 0 || WORLD_WIDTH < enemy.x) enemy.vx *= -1
        if (enemy.y < 0 || WORLD_HEIGHT < enemy.y) enemy.vy *= -1
        if (enemy.vx < -1) {
            enemy.vx += enemy.vx/500
            if (enemy.vx > -1) enemy.vx = -1
        }
        if (enemy.vx > 1) {
            enemy.vx -= enemy.vx/500
            if (enemy.vx < -1) enemy.vx = 1
        }
        if (enemy.vy < -1) {
            enemy.vy += enemy.vy/500
            if (enemy.vy > -1) enemy.vy = -1
        }
        if (enemy.vy > 1) {
            enemy.vy -= enemy.vy/500
            if (enemy.vy < -1) enemy.vy = 1
        }
        
        players.forEach(player => {
            if (!player.dead && player.reboting_buff_count === 0 && collision(enemy, player)) {
                died(player)
            }
            else if (!player.dead && player.reboting_buff_count > 0 && collision(enemy, player)){
                enemy.vx = (enemy.vx * (enemy.size - player.size) + (2 * player.size * player.vx))/(enemy.size + player.size)
                enemy.vy = (enemy.vy * (enemy.size - player.size) + (2 * player.size * player.vy))/(enemy.size + player.size)
                //if (enemy.x < player.x + player.size) enemy.vx *= -1
                //if (enemy.y < player.y + player.size) enemy.vy *= -1
            }
        })      
        enemies.forEach(enemy2 => {
            //newVelX = (firstBall.speed.x * (firstBall.mass – secondBall.mass) + (2 * secondBall.mass * secondBall.speed.x)) 
            //    / (firstBall.mass + secondBall.mass);

            //newVelX1 = (firstBall.speed.x * (firstBall.mass – secondBall.mass) + (2 * secondBall.mass * secondBall.speed.x)) / (firstBall.mass + secondBall.mass);
            //newVelY1 = (firstBall.speed.y * (firstBall.mass – secondBall.mass) + (2 * secondBall.mass * secondBall.speed.y)) / (firstBall.mass + secondBall.mass);
            //newVelX2 = (secondBall.speed.x * (secondBall.mass – firstBall.mass) + (2 * firstBall.mass * firstBall.speed.x)) / (firstBall.mass + secondBall.mass);
            //newVelY2 = (secondBall.speed.y * (secondBall.mass – firstBall.mass) + (2 * firstBall.mass * firstBall.speed.y)) / (firstBall.mass + secondBall.mass);

            if (collision(enemy, enemy2) && enemy != enemy2) {
                enemy.vx = (3.5 * (enemy.size - enemy2.size) + (2 * enemy2.size * 3.5))/(enemy.size + enemy2.size)
                enemy.vy = (3.5 * (enemy.size - enemy2.size) + (2 * enemy2.size * 3.5))/(enemy.size + enemy2.size)
                //if (enemy.x < enemy2.x + enemy2.size) enemy.vx *= -1
                //if (enemy.y < enemy2.y + enemy2.size) enemy.vy *= -1
            }
        })          
    })
    //para falsificar ping
    /*let frozenState = JSON.stringify(state)
    setTimeout(function () {
        io.sockets.emit('state', state)
        //algo? JSON noseque
    }, 50)*/
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
        speed_buff_count: 0,
        reboting_buff_count: 0,
        clone_buff_count: 0,
        keyboard: {}
    }

    socket.on('set-username', function (username) {
        player.username = username
    })

    state.players.push(player)

    socket.on('input', function (keyboard) {
        //console.log('got player input', keyboard)
        player.keyboard = keyboard
        state.players.forEach(player2 => {
            if (!keyboard.space && player2.id === player.id) player2.keyboard = keyboard
        })
        
    })

    socket.on('disconnect', function () {
        state.players.splice(state.players.indexOf(player), 1)
    })
})
