const fs = require('fs').promises; // Use fs.promises


async function readfile(filepath) {
    try {
        const data = await fs.readFile(filepath, 'utf-8',null,2);
        return data
    } catch (err) {
        console.error("Error reading file:", err);
        throw err;
    }
    
}


async function showData(filepath) {
    let data = await readfile(filepath)
    // console.log(data);
    if (data?.trim()?.length=="") {
           
    }else{
        console.log(data);
        
    }
}

showData('./user.json')