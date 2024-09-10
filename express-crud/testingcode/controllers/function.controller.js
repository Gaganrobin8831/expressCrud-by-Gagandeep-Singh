const { readfile, writeData } = require('../commonFunc/handle.common')

const fs = require('fs').promises; // Import the promise-based API

async function HandleGet(req, res) {
    try {
        const data = await readfile('./example.json');
        const jsonData = JSON.parse(data);
        res.render('index', { Data: jsonData });
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
        return res.redirect('/api/get')
    } catch (err) {
        console.error("Error processing file:", err);
        res.status(500).send("Error processing file");
    }
}


async function HandleupdateGet(req,res) {
    const id = req.params.id;
    let data = await readfile('./example.json')
    let getData = JSON.parse(data)
    const showData = getData.filter(item => item.id == id)
    //    let item = id
    //     console.log( );
        
 
    
    res.render('edit', { item:showData});
}

module.exports = { HandleGet,HandlePost,HandleupdateGet};
