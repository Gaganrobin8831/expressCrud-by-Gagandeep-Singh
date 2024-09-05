const fs = require('fs');
const path = require('path');

function handleFileError(res, err) {
    if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'File not found' }));
    } else {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Error reading data' }));
    }
}

function writeJSONToFile(filePath, data, res) {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error writing to file' }));
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'File updated successfully' }));
    });
}

function updateJSONData(filePath, updateCallback, res) {
    fs.readFile(filePath, 'utf8', (err, existingData) => {
        let jsonArray = [];

        if (err && err.code !== 'ENOENT') {
            handleFileError(res, err);
            return;
        }

        if (existingData.trim() !== '') {
            try {
                jsonArray = JSON.parse(existingData);  
                if (!Array.isArray(jsonArray)) {
                    throw new Error('File content is not an array');
                }
            } catch (e) {
                console.error('Error parsing existing JSON:', e.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error parsing existing JSON' }));
                return;
            }
        }

        updateCallback(jsonArray); 

        writeJSONToFile(filePath, jsonArray, res); 
    });
}

function readFile(filePath, callback, res) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            handleFileError(res, err);
            return;
        }

        let jsonArray = [];
        try {
            if (data.trim() === '') {

                jsonArray = [];

            } else {
                jsonArray = JSON.parse(data);  
            }
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            if (res) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error parsing JSON' }));
            }
            return;
        }
        callback(jsonArray);  
    });
}

function writeFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Error writing file ${filePath}:`, err);
    }
}



module.exports = { handleFileError, writeJSONToFile, updateJSONData, readFile ,writeFile};
