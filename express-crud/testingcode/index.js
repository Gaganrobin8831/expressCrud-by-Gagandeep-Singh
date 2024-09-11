const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const app = express()
const path = require('path')
const staticRouter= require('./routes/Static.router')
// const methodOverride = require('method-override');

const router = require('./routes/index.router')
const PORT = process.env.PORT || 3000

app.set("view engine","ejs")
app.set("views",path.resolve("./views"))



// Middleware
app.use(express.static(path.join(__dirname, 'public')));

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(methodOverride('_method')); // Enable method-override for PUT and DELETE

// set router for renderning
app.use('/add',staticRouter)
app.use('/',router)

app.listen(PORT,()=>console.log(`Server run on http://localhost:${PORT}/`))