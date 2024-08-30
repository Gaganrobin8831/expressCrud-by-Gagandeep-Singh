const fs = require('fs');

function handleFileError(res, err) {
    if (err.code === 'ENOENT') {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'File not found' }));
    } else {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Error reading data' }));
    }
}

function writeJSONToFile(filePath, data, callback) {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
            console.error(`Error writing to file ${filePath}:`, err);
            callback(err); 
        }
        //  else {
        //     callback(null); 
        // }
    });
}

function updateJSONData(filePath, updateCallback, res, callback) {
    fs.readFile(filePath, 'utf8', (err, existingData) => {
        let jsonArray = [];

        if (err && err.code !== 'ENOENT') {
            console.error(`Error reading file ${filePath}:`, err);
            handleFileError(res, err);
            return;
        }

        if (existingData) {
            try {
                jsonArray = JSON.parse(existingData);
                if (!Array.isArray(jsonArray)) {
                    throw new Error('File content is not an array');
                }
            } catch (e) {
                console.error(`Error parsing existing JSON from ${filePath}:`, e.message);
                handleFileError(res, e);
                return;
            }
        }

        updateCallback(jsonArray);

        writeJSONToFile(filePath, jsonArray, (err) => {
            if (err) {
                handleFileError(res, err);
                return;
            }
            if (callback) {
                callback();
            }
            //  else {
            //     res.statusCode = 200;
            //     res.setHeader('Content-Type', 'application/json');
            //     res.end('File updated successfully');
            // }
        });
    });
}


function readFile(filetPath,readCallBack){
    fs.readFile(filetPath, 'utf8', (err, data) => {
        if (err) {
            handleFileError(res, err);
            return;
        }
        let jsonArray = [];
        jsonArray = JSON.parse(data);
       readCallBack(jsonArray)
    });
    }
module.exports = {
    handleFileError,
    writeJSONToFile,
    updateJSONData,
    readFile
};
