const express = require('express')
const UserModel = require('../models/user.js')
const auth = require('../middleware/auth')
const sendMail = require('../send_Mail.js')
const router = new express.Router()

router.post('/user', async(req, res) =>{
    
    try{
        const user = new UserModel(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        sendMail.sendWelcomeMail(req.body.email)
        res.send({user, token})      
    }
    catch(e){
        res.status(404).send(e)
    }
})

router.post('/user/login', async(req, res)=>{
    try{
        const userDetails = await UserModel.findUserCredentials(req.body.email , req.body.password) 
        const token = await userDetails.generateAuthToken()
        if(!userDetails){
           return res.status(404).send("Please Authenticate")
        }
        res.send({msg:"logged In successfully",namedetails: userDetails.name, token})
    }
    catch(e){
        res.status(404).send("Please authenticate")
    }
})

router.get('/buyers/requirement', auth, async(req,res)=>{
    try{
        const unit= req.query.unit
        const sellersList1 =[]
        const sellersList= await UserModel.find({category:"seller"})
        for(var i in sellersList){
            var objectUser = sellersList[i].toObject()
            delete objectUser.password
            delete objectUser.tokensList
            if(sellersList[i].ventilator_cnt>0){
                sellersList1.push(objectUser)
            }
        }
        req.user.ventilator_cnt= unit
        await req.user.save()
        if(!sellersList1)
        return res.send("Currently No seller is available. We will get back to you as soon as we get your requirement.Please keep checking mails for updates")
        res.send(sellersList1)
    }
    catch(e){
        res.status(404).send(e)
    }
    
})

router.patch('/user/update', auth , async(req, res)=>{
    const update = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','ventilator_cnt','phone_no']
    const isvalidUpdate = update.every((updat) => allowedUpdates.includes(updat))
    if(!isvalidUpdate){
        return res.status(404).send("Invalid Updates")
    }
    try{
        
        update.forEach(async (updat) => 
        {
            req.user[updat] = req.body[updat]
            if(updat == allowedUpdates[3] && req.user.category == 'buyer'){
                const sellersList1=[]
                const sellersList= await UserModel.find({category:"seller"})
                for(var i in sellersList){
                    sellersList1.push(sellersList[i].email)
                }
                sendMail.Notification_of_buyers(sellersList1, req.user.email, req.body[updat])
            }
            else if(updat == allowedUpdates[3] && req.user.category == 'seller'){
                const buyersList1=[]
                const buyersList= await UserModel.find({category:"buyer"})
                for(var i in buyersList){
                    buyersList1.push(buyersList[i].email)
                }
                sendMail.Notification_of_sellers(buyersList1, req.user.email, req.body[updat])
            }
            
        })
        await req.user.save()
        res.send(req.user)
    }
    catch(e){
        res.status(404).send(e)
    }
})

module.exports = router