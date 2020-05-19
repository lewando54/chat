const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}


app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
const db = mongoose.connection
db.on('error', error => console.log(error))
db.once('open', () => console.log("Connected to MongoDB"))


const rooms = {}

app.get('/', (req, res) => {
    res.render('index', { rooms: rooms })
})

app.get('/login', (req, res) => {
    res.render('login.ejs')
})

app.get('/register', (req, res) => {
    res.render('register.ejs')
})

app.post('/room', (req, res) => {
    if (rooms[req.body.room] != null) {
        return res.redirect('/')
    }
    rooms[req.body.room] = { users: {} }
    res.redirect(req.body.room)
    io.emit('room-created', req.body.room)
})

app.get('/:room', (req, res) => {
    if (rooms[req.params.room] == null) {
        return res.redirect('/')
    }
    res.render('room', { roomName: req.params.room })
})

server.listen(80)

io.on('connection', socket => {
    socket.on('join-msg', (room, autor) => {
        socket.join(room)
        rooms[room].users[socket.id] = autor
        socket.to(room).broadcast.emit('send-join-msg', autor)
    })
    socket.on('send-chat-msg', (room, msg) => {
        socket.to(room).broadcast.emit('chat-msg', {
            msg: msg,
            autor: rooms[room].users[socket.id]
        })
    })

    socket.on('disconnect', () => {
        getUserRooms(socket).forEach(room => {
            socket.to(room).broadcast.emit("send-out-msg", rooms[room].users[socket.id])
            delete rooms[room].users[socket.id]
        })
    })
})

function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, room]) => {
        if (room.users[socket.id] != null) names.push(name)
        return names
    }, [])
}