const fs = require('fs');
function handleFileError(res, err) {
    if (res.headersSent) return; 
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
function readFile(filePath, callback) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            callback(err, []);
        } else {
            try {
                const jsonData = JSON.parse(data || '[]');
                callback(null, jsonData);
            } catch (e) {
                callback(e, []);
            }
        }
    });
}
function writeJSONToFile(filePath, data, callback) {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
        callback(err);
    });
}
module.exports = {
    handleFileError,
    readFile,
    writeJSONToFile
};