import mongoose from 'mongoose'

const schema = new mongoose.Schema({ 
    username: { 
        type : String , 
        unique : true, 
        required : true, 
        dropDups: true,
        minLength: 3,
        maxLength: 20 
    },
    password: {
        type: String,
        minLength: 3,
        maxLength: 20,
        select: false 
    },
    completeGames: [ { type: ObjectId, ref: 'CompleteGame' } ],
    messages: [ { type: ObjectId, ref: 'Message' }]
})

export const User = mongoose.model('User', schema)



