const fs = require('fs').promises;


async function handleFileError(res, err) {
    console.error(err);
    res.statusCode = 500;
    res.end('Server Error');
}


async function readFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return data.trim() ? JSON.parse(data) : []; 
    } catch (err) {
        throw err;
    }
}


async function writeJSONToFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        throw err;
    }
}


async function updateJSONData(filePath, updateFn) {
    try {
        const data = await readFile(filePath);

        
        updateFn(data);

      
        await writeJSONToFile(filePath, data);
    } catch (err) {
        throw err;
    }
}

module.exports = {
    handleFileError,
    readFile,
    writeJSONToFile,
    updateJSONData
};


