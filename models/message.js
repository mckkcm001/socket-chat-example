import mongoose from 'mongoose'

const schema = new mongoose.Schema({ 
    to: String,
    from: String,
    text: {
        type: String,
        maxLength: 200
    },
})

export const Message = mongoose.model('Message', schema)