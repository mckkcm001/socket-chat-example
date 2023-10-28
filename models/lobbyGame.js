import mongoose from 'mongoose'

const schema = new mongoose.Schema({ 
    name: String,
    options: Object,
    players: [ Object ],
    watchers: [ String ],
    chat:[{
        name: String,
        text: {
            type: String,
            maxLength: 200
        }
    }] 
})

export const lobbyGame = mongoose.model('LobbyGame', schema)