const express = require('express')
const routerUser = require('./routers/users.js')

require('../mongoose.js')

const app = express()
const port = process.env.PORT 

app.use(express.json())

app.use(routerUser)


app.listen(port , () =>{
    console.log("kudos! App is up and running at port" , port)
})