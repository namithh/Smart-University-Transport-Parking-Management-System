const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name : String,
    
    email : {
        type : String,
        unique : true,
        required : true
    },
    password : String, 
    role : String,
    status : {
        type : String,
        enum : ['Active', 'Inactive', 'Suspended'],
        default : 'Active'
    }
},{

    timestamps : true
})

const userModel = mongoose.model('customer',userSchema)

module.exports = userModel