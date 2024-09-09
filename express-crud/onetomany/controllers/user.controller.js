const fs = require('fs').promises; // Use fs.promises

async function writeData(filepath, dataFromUser) {
    try {
       
        const jsonData = JSON.stringify(dataFromUser, null, 2);
        
        await fs.writeFile(filepath, jsonData);
    } catch (err) {
        console.error("Error writing file:", err);
        throw err;
    }
}

async function readfile(filepath) {
    try {
        const data = await fs.readFile(filepath, 'utf-8');
        if (data.trim().length === 0) {
            return []; // Return an empty array for an empty file
        }
        return JSON.parse(data); // Parse JSON data
    } catch (err) {
        // Handle errors from JSON parsing
        console.error("Error reading or parsing file:", err);
        return []; // Return an empty array on error
    }
}


module.exports = {
    writeData,
    readfile
};
