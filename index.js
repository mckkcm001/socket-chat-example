import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import mongoose from 'mongoose'
import { User } from './models/user.js'
import { currentGame } from './models/currentGame.js'
import { completeGame } from './models/completeGame.js'
import { lobbyGame } from './models/lobbyGame.js'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
      origin: "*"
    }
})

const db = await mongoose.connect('mongodb://127.0.0.1:27017/socketserver')
console.log('db connected: ', db.connections[0].host)

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))

io.on("connection", (socket) => {
    console.log('a user connected')
    socket.on('disconnect', () => {
        console.log('user disconnected')
      })
    socket.on('tokenReq', async data => {
        console.log('tokenReq: ', data)
        if (data.id === undefined || data.id === null) {
            console.log(data)
            socket.emit('tokenRes', {})
        } 
        else {
            try {
                const user = await User.findById(data.id)
                console.log('tokenReq user: ', user.username)
                socket.user = user
                    console.log('tokenReq socket.user: ', socket.user)
                if (user) {
                    socket.emit('tokenRes', user)
                }
                else {
                    socket.emit('tokenRes', {})
                }
            }
            catch(err) {
                console.log('tokenReq error: ', err)
                socket.emit('tokenRes', {})
            }
        }
    })
    socket.on('loginReq', async data => {
        console.log('loginReq: ', data)
        try {
            const user = await User.findOne(data)
            if (user) {
                console.log('user: ', user.username)
                socket.emit('loginRes', user)
                socket.user = user
            }
            else {
                console.log('login error: ', 'Error logging in.')
                socket.emit('loginRes', {})
            }
        }
        catch(err) {
            console.log('loginReq error: ', err)
        }
    })
    socket.on('registerReq', async data => {
        console.log('registerReq: ', data)
        try {
            const user = await User.create({
                username: data.username,
                password: data.password
            })
            user.password = null
            socket.emit('registerRes', user)
            socket.user = user
        }
        catch(err) {
            console.log('registerReq error: ', err)
            socket.emit('registerRes', {})
        }
    })
    socket.on('getCompleteGameReq', async data => {
        console.log('getCompleteGameReq: ', data)
        try {
            const completeGame = await completeGame.findById( data.id )
            socket.emit('getCompleteGameRes', game)
        }
        catch(err) {
            console.log('getCompleteGameReq error: ', err)
            socket.emit('getCompleteGameRes', {})
        }
    })
    socket.on('getCurrentGamesReq', async data => {
        console.log('getCurrentGamesReq: ', data)
        try {
            const currentGames = await currentGame.find({ name: data.name })
            socket.emit('getCurrentGamesRes', currentGames )
            console.log('getCurrentGamesReq socket.user: ', socket.user)
            //await socket.join(data.name)
            //console.log(socket.rooms)
            //const socks = await io.in(data.name).fetchSockets()
            //socks.forEach(s => 
            //    console.log(s.user.username)
            //)
        }
        catch(err) {
            console.log('getCurrentGamesReq error: ', err)
            socket.emit('getCurrentGamesRes', [])
        }
    })
    socket.on('getLobbyGamesReq', async data => {
        console.log('getLobbyGamesReq: ', data)
        try {
            const lobbyGames = await lobbyGame.find({ name: data.name })
            socket.emit('getLobbyGamesRes', lobbyGames )
            console.log('getLobbyGamesReq socket.user: ', socket.user)
            //await socket.join(data.name)
            //console.log(socket.rooms)
            //const socks = await io.in(data.name).fetchSockets()
            //socks.forEach(s => 
            //    console.log(s.user.username)
            //)
        }
        catch(err) {
            console.log('getCurrentGamesReq error: ', err)
            socket.emit('getCurrentGamesRes', [])
        }
    })
    socket.on('newGameReq', async data => {
        console.log('newGameReq: ', data)
        try {
            const game = new Game({
                name: data.name, 
                players: [{
                    name: socket.user.username,
                    men: 0,
                    cards: [],
                    start: false
            }   ],
                options: data.options,
                phase: 'lobby'
            })
            await game.save()
            await socket.user.playGames.push(game._id.toString())
            await socket.join(game._id.toString())
            console.log('socket rooms: ', socket.rooms)
            const socks = await io.in(game._id.toString()).fetchSockets()
            socks.forEach(s => 
                console.log(s.user.username)
            )
            await socket.user.save()
            const games = await Game.find({ name: data.name })
            
            io.to(data.name).emit('getGamesRes', {games: games})
        }
        catch(err) {
            console.log('newGameReq error: ', err)
        }
    })
    socket.on('quitGameReq', async data => {
        console.log('quitGameReq: ', data)
        try {
            const game = await Game.findById(data.id)
            console.log('quitGameReq game: ', game)
            console.log('quitGameReq socket.user: ', socket.User)
            socket.user.playGames = await socket.user.playGames.filter(g => g._id.toString() !== data.id)
            socket.user.watchGamesGames = await socket.user.watchGames.filter(g => g._id.toString() !== data.id)
            console.log('quitGameReq socket.user: ', socket.User)
            await socket.user.save()
            game.players = game.players.filter(p => p.name !== socket.user.username)
            console.log('quitGameReq game: ', game)
            if (game.players.length === 0) await Game.deleteOne({_id: data.id})
            const games = await Game.find({ name: data.name })
            io.in(data.name).emit('getGamesRes', {games: games})
        }
        catch(err) {
            console.log('quitGameReq error: ', err)
        }
    })
})  

httpServer.listen(8000)