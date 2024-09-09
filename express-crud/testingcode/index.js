const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const app = express()
const path = require('path')
const router = require('./routes/index.router')
const PORT = process.env.PORT || 3000

app.set("view engine","ejs")
app.set("views",path.resolve("./views"))

app.use('/api',router)

app.listen(PORT,()=>console.log(`Server run on http://localhost:${PORT}/`))