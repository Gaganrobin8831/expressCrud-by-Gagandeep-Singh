// user.routes.js
const fs = require('fs')
const { writeData, readfile } = require('../controllers/user.controller');

async function getId() {
    try {
        // Read and parse the file data

        const data = await readfile('./user.json');

        // Determine the next ID: max ID from the array + 1, default to 1 if array is empty
        const maxId = data.reduce((max, item) => (item.id > max ? item.id : max), 0);
        const newId = maxId + 1;

        return newId;
    } catch (err) {
        console.error("Error getting next ID:", err);
        throw err;
    }
}

//Read file function---------------------------------------
async function HandleGet(req, res) {
    //readFile function from controllers
    const dataFromUser = await readfile('./user.json', (data) => data)
    console.log(JSON.parse(dataFromUser));

    res.json(JSON.parse(dataFromUser));
}

//write file function---------------------------------------
async function HandleCreate(req, res) {
let myId = await getId()
console.log(myId);


    try {
        let dataFromUser = await readfile('./user.json');
        
        if (dataFromUser.length === 0) {
            dataFromUser.push({id:myId,...req.body,profileId:null});
            await writeData('./user.json', dataFromUser);
            res.json("User created");
        } else {
            // Ensure dataFromUser is an array
            if (Array.isArray(dataFromUser)) {

                let myArr = [...dataFromUser, {id:myId,...req.body,profileId:null}];
                await writeData('./user.json', myArr);
                res.json("New User created");
            } else {
                res.status(500).json("Data format error");
            }
        }
    } catch (err) {
        console.error("Error handling create:", err);
        res.status(500).json("Internal Server Error");
    }
}


//HandlePut file function---------------------------------------


async function HandlePut(req, res) {
    const id = parseInt(req.query.id, 10); // Access id from query parameters
    console.log(id);
    
    if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
    }
    // Handle user update logic here
    try {
        let dataFromUser = await readfile('./user.json');
        
       // Filter out items that match the id
       let compareId = dataFromUser.filter(item => item.id === id);
       console.log(compareId);
        
        res.status(201).json(compareId)
    }catch{
        res.status(500).json({ message: "Error reading for ", id });
    }
   
}


// async function DeleteUser(req, res) {

async function DeleteUser(req, res) {
    const id = req.params.id; // Extract id from the params
    // Handle user delete logic here
    res.json({ message: "User delete", id });
}

// async function get element by id
async function HandleGetBYId(req,res) {
    const id = parseInt(req.query.id, 10); // Access id from query parameters
    console.log(id);
    
    if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
    }
    // Handle user update logic here
    try {
        let dataFromUser = await readfile('./user.json');
        
        
     
            let compareId = dataFromUser.filter(item => item.id === id);
            console.log(compareId);
        
        res.status(201).json(compareId)
    }catch{
        res.status(500).json({ message: "Error reading for ", id });
    }
}

module.exports = {
    HandleGet,
    HandleCreate,
    HandlePut,
    DeleteUser,
    HandleGetBYId
};
