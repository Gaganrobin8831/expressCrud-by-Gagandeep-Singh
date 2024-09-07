const fs = require('fs').promises; // Use fs.promises

async function writeData(filepath, dataFromUser) {
    try {
        // Convert dataFromUser to a JSON string
        const jsonData = JSON.stringify(dataFromUser, null, 2);
        // Write JSON string to file
        await fs.writeFile(filepath, jsonData);
    } catch (err) {
        console.error("Error writing file:", err);
        throw err;
    }
}
async function readfile(filepath) {
    try {
        const data = await fs.readFile(filepath, 'utf-8',null,2);
        return data
    } catch (err) {
        console.error("Error reading file:", err);
        throw err;
    }
}

module.exports = {
    writeData,
    readfile
};
