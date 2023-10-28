import mongoose from 'mongoose'

const schema = new mongoose.Schema({ 
    name: String,
    phase: String,
    options: Object,
    players: [ Object ],
    watchers: [ String ],
    initialState: Object,
    moves: [ Object ],
    finalState: Object,
    chat:[{
        name: String,
        text: {
            type: String,
            maxLength: 200
        }
    }] 
})

export const currentGame = mongoose.model('CurrentGame', schema)