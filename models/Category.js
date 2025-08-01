const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Assuming there's a User model
        required: true,
    },
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;

