const jwt = require('jsonwebtoken')
const UserModel = require('../models/user.js')

const auth = async (req, res , next) =>{
    try{
        const token = req.header('Authorization').replace('Bearer ', '')
        const decodeToken = jwt.verify(token, process.env.JSON_WEB_TOKEN)
        const user1 = await UserModel.findOne({_id: decodeToken._id , 'tokensList.token': token})
        if(!user1){
            throw new Error()
        }
        req.token = token
        req.user = user1 //in order to provide user1 to work with other routes we add new property eith req as user 
        next()
    }catch(e){
        res.status(401).send("Please Authenticate")
    }
}
module.exports=auth
    
