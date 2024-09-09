const fs = require('fs').promises;

async function readfile(filepath) {
    try {
        const data = await fs.readFile(filepath, 'utf-8');
        return data
    } catch (err) {
        console.error("Error reading file:", err);
        throw err;
    }
}

async function writeData(filepath, dataFromUser) {
    try {
        await fs.writeFile(filepath, dataFromUser);
    } catch (err) {
        console.error("Error writing file:", err);
        throw err;
    }
}

module.exports = { readfile, writeData };
