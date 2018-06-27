const express = require('express')
const app = express()

app.get('/', function (req, res) {
    res.send('home')
})

app.get('/contact', function (req, res) {
    res.send('my num: +34 677 756 111')
})

app.get('/profile/:username/achivements', function (req, res) {
    res.send(`hi ${req.params.username} has no achivements`)
})

//GET /profile/Roger --> concuerda, la parte de roger es una variable y la extrae y hace --> req.params['username'] = 'Roger'
app.get('/profile/:username', function (req, res) {
    res.send(`hi ${req.params.username}`)
})

app.listen(3000)
