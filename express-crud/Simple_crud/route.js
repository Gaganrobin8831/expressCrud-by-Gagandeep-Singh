const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { readfile, writeData } = require('./handler_function/handle');
const router = express.Router();
const FILE_PATH = path.join(__dirname, 'user.json');


// Configure multer for form-data handling
const upload = multer();
router.post('/user', upload.none(), async (req, res) => {
    const body = req.body;

    try {
        let data = [];

        // Check if file exists and read data if it does
        if (fs.existsSync(FILE_PATH)) {
            const fileData = await readfile(FILE_PATH);

            if (fileData.trim().length > 0) { // Check if fileData is not empty
                try {
                    data = JSON.parse(fileData);
                    if (!Array.isArray(data)) {
                        data = []; // Initialize as empty array if data is not an array
                    }
                } catch (parseError) {
                    console.error("Error parsing JSON:", parseError);
                    data = []; // Initialize as empty array on parsing error
                }
            }
        }

        // Determine the next ID
        const maxId = data.reduce((max, item) => (item.id > max ? item.id : max), 0);
        const newId = maxId + 1;

        // Append the new data with the new ID
        const newData = {id: newId, ...body };
        data.push(newData);

        // Write the updated data back to the file
        await writeData(FILE_PATH, JSON.stringify(data, null, 2));
        res.send('Data saved successfully');

    } catch (err) {
        console.error("Error processing file:", err);
        res.status(500).send('Error processing file');
    }
});


router.get('/user', async (req, res) => {
    try {
       
        const data = await readfile(FILE_PATH);
       let getdata = JSON.parse(data)
        res.send(getdata); // Use res.send instead of res.end
    } catch (error) {
        res.status(500).send('Server Error'); // Respond with an error status if file reading fails
    }
});


router.get('/user/:id',async (req,res)=>{
    const id = req.params.id;
  const data =await readfile(FILE_PATH);
  
  let getdata = JSON.parse(data)
  
  const user = getdata.find(user => user.id === parseInt(id));
  return res.json(user)
    
    
})

router.put('/user/:id', upload.none(), async (req, res) => {
    const id = req.params.id;
    const { name, age } = req.body;

    // Check if at least one of the fields is missing or empty
    if (!name || !age) {
        return res.status(400).send({ message: "Please enter all fields" });
    }

    try {
        const data = await readfile(FILE_PATH);
        let getdata = JSON.parse(data);

        // Find the user
        const userIndex = getdata.findIndex(user => user.id === parseInt(id));

        if (userIndex === -1) {
            return res.status(404).send({ message: "User not found" });
        }

        // Update the user's data
        getdata[userIndex] = { id: parseInt(id), name, age };

        // Write the updated data back to the file
        await writeData(FILE_PATH, JSON.stringify(getdata, null, 2));

        res.send({ message: "User updated successfully" });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ message: "Internal server error" });
    }
});


router.delete('/user/:id', upload.none(), async (req, res) => {
    const id = req.params.id;

    try {
        // Read and parse the file data
        const data = await readfile(FILE_PATH);
        let getdata = JSON.parse(data);
        console.log({ getdata });

        // Filter out the user with the given ID
        const updatedData = getdata.filter(user => user.id !== parseInt(id));
        console.log({ updatedData });

        // If no user was found with the provided ID
        if (getdata.length === updatedData.length) {
            return res.status(404).send({ message: "User not found" });
        }

        // Write the updated data back to the file
        await writeData(FILE_PATH, JSON.stringify(updatedData, null, 2));

        res.send({ message: "User deleted successfully" });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send({ message: "Internal server error" });
    }
});

module.exports = router;
