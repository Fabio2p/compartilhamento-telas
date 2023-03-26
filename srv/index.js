const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
    cors: {
      origin: '*',
    }
  })
const cors = require('cors')

app.use(cors())
app.get('/view', (req, res) => {
    res.sendFile(__dirname + '/display.html')
})

io.on('connection', (socket) => {
    socket.on('join-message', (roomId) => {
        socket.join(roomId)
    })

    socket.on('screen-data', (data) => {
        data = JSON.parse(data)
        let room = data.room
        let img = data.image
        socket.broadcast.to(room).emit('screen-data', img)
    })

    socket.on('mouse-move', (data) => {
        let room = data.room
        socket.broadcast.to(room).emit('mouse-move', data)
    })

    socket.on('mouse-click', (data) => {
        let room = data.room
        socket.broadcast.to(room).emit('mouse-click', data)
    })

    socket.on('type', (data) => {
        let room = data.room
        socket.broadcast.to(room).emit('type', data)
    })

})

const server_port = process.env.PORT || 3000
http.listen(server_port, () =>{ console.log('Aplicação rodando na porta: ', server_port) })