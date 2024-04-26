const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    is_admin: { type: Boolean, required: true },
    image: { type: String }
});

module.exports = mongoose.model('users', UserSchema)