const mongoose = require('mongoose')
const Schema = mongoose.Schema

const favoriteSchema = new Schema({
    campsites: [{
        type: Schema.Types.ObjectId,
        ref: 'Campsite'
    }],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

const Favorite = mongoose.model('Favorite', favoriteSchema)

module.exports = Favorite