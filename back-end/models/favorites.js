const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        require: true
    },
    dishes: [{ type: mongoose.Schema.Types.ObjectId,ref:'Dish'}]
})
const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;