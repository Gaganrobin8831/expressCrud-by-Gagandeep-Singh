const { readfile, writeData } = require('../commonFunc/handle.common')

const fs = require('fs').promises; // Import the promise-based API

async function HandleGet(req, res) {
    try {
        const data = await readfile('./example.json');
        
        if (!data || data.trim().length === 0) {
            res.render('index', { Data: [], message: 'Data not found' });
        } else {
            const jsonData = JSON.parse(data);
            res.render('index', { Data: jsonData, message: '' });
        }
       
    } catch (err) {
        console.error('Error reading file:', err);
        res.status(500).render('error', { error: 'Internal Server Error' });
    }
}


async function HandlePost(req, res) {
    let data = req.body;
    console.log(data);

    try {
        // Read existing data from the file
        let fileData = await readfile('./example.json');

        let jsonData = [];

        if (fileData.trim().length > 0) {
            try {
                jsonData = JSON.parse(fileData);
                if (!Array.isArray(jsonData)) {
                    jsonData = [];
                }
            } catch (parseError) {
                console.error("Error parsing JSON:", parseError);
                jsonData = [];
            }
        }

        // Determine the next ID
        const maxId = jsonData.reduce((max, item) => (item.id > max ? item.id : max), 0);
        const newId = maxId + 1;

        // Append the new data with the new ID
        const newData = { id: newId, ...data }; // Merge ID with incoming data
        jsonData.push(newData);

        // Write the updated data back to the file
        await writeData('./example.json', JSON.stringify(jsonData, null, 2));

        res.status(201)
        return res.redirect('/get')
    } catch (err) {
        console.error("Error processing file:", err);
        res.status(500).send("Error processing file");
    }
}


async function HandleupdateGet(req, res) {
    const id = req.params.id;
    let data = await readfile('./example.json')
    let getData = JSON.parse(data)
    const showData = getData.filter(item => item.id == id)
    //    let item = id
    //     console.log( );



    res.render('edit', { item: showData });
}

async function HandlePut(req, res) {
    const id = req.body.id;
    const { name } = req.body;

    // Check if at least one of the fields is missing or empty
    if (!name) {
        return res.status(400).send({ message: "Please enter all fields" });
    }

    try {
      
        let data = await readfile('./example.json')
        let getData = JSON.parse(data)



        const neData = getData.filter((item) => {
            if (item.id == parseInt(id)) {
                return item.name = name
            }
        })
    
        // Write the updated data back to the file
        await writeData('./example.json', JSON.stringify(getData, null, 2));

        res.status(201)
        return res.redirect('/get')
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ message: "Internal server error" });
    }


}

async function HandleDelete(req, res) {
    console.log("Hello Delete");

    const id = req.params.id;

    try {
        // Read and parse the file data
        const data = await readfile('./example.json');
        let getdata = JSON.parse(data);
        // console.log({ getdata });

        // Filter out the user with the given ID
        const updatedData = getdata.filter(user => user.id !== parseInt(id));
        // console.log({ updatedData });

        // If no user was found with the provided ID
        if (getdata.length === updatedData.length) {
            return res.status(404).send({ message: "User not found" });
        }

        // Write the updated data back to the file
        await writeData('./example.json', JSON.stringify(updatedData, null, 2));

        return res.redirect('/get')
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send({ message: "Internal server error" });
    }

}
module.exports = { HandleGet, HandlePost, HandleupdateGet, HandlePut, HandleDelete };
