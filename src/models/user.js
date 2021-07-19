const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt =require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    category:{
        type: String,
        required : true,
        lowercase: true,
        validate(value){
            if(value!= "buyer" && value!= "seller")
            throw new Error("Invalid category. Choose either buyer or seller options")
        }
    },
    name:{
        type: String,
        required : true,
        trim: true,
    },
    email:{
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true,
        validate(value){
            if(!(validator.isEmail(value))){
                throw new Error("Enter valid email address")
            }
        }
    },
    phone_no:{
        type: String,
        required: true,
        validate(value){
            if(!validator.isMobilePhone(value)){
                throw new Error("Enter valid phone number")
            }
        }
    },
    password:{
        type : String,
        required: true,
        trim: true,
        validate(val){
            if(!validator.isStrongPassword(val)){
                throw new Error("the password must contain Atleast 1 lowercase & 1 uppercase letter, must be of size >=8 , must have atleast 1 digit and special symbol")
            }
        }
    },
    ventilator_cnt:{
        type: Number,
        default:0
    },
    tokensList:[{
        token:{
            type: String,
            required: true
        }
    }]
},{
    timestamps: true
})

userSchema.methods.JSON = function(){
    const user = this
    const objectUser = user.toObject()
    delete objectUser.password
    delete objectUser.tokensList
    return objectUser
}

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id : user._id.toString()}, process.env.JSON_WEB_TOKEN)
    user.tokensList = user.tokensList.concat({token})
    await user.save()
    return token
}

userSchema.statics.findUserCredentials = async (email, password) =>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error("Un able to login")
    }
    const passMatch = await bcrypt.compare(password, user.password)
    if(!passMatch){
        throw new Error("Unable to login")
    }
    return user
}

userSchema.pre('save', async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User