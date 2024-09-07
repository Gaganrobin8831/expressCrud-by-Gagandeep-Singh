// user.routes.js
const fs = require('fs')
const {writeData,readfile}= require('../controllers/create.controller')

//Read file function---------------------------------------
async function HandleGet(req, res) {
//readFile function from controllers
const dataFromUser = await readfile('./user.json',(data)=>data)
console.log(JSON.parse(dataFromUser));

    res.json(JSON.parse(dataFromUser));
}

//write file function---------------------------------------

async function HandleCreate(req, res) {
//writeData function from controllers
    const first = [{'name':'gagan'}]
  await  writeData('./user.json',first)
    res.json("User created");
}

//HandlePut file function---------------------------------------


async function HandlePut(req, res) {
    const id = req.params.id; // Extract id from the params
    // Handle user update logic here
    res.json({ message: "User update", id });
}


// async function DeleteUser(req, res) {
 
async function DeleteUser(req, res) {
    const id = req.params.id; // Extract id from the params
    // Handle user delete logic here
    res.json({ message: "User delete", id });
}

module.exports = {
    HandleGet,
    HandleCreate,
    HandlePut,
    DeleteUser
};
