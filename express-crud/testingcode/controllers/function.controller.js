const fs = require('fs').promises; // Import the promise-based API

async function HandleGet(req, res) {
    try {
        const data = await fs.readFile('./example.json', 'utf8');
        const jsonData = JSON.parse(data);
        res.render('index', { quizData: jsonData });
    } catch (err) {
        console.error('Error reading file:', err);
        res.status(500).render('error', { error: 'Internal Server Error' });
    }
}
async function HandlePost(req, res) {
   let data = req.body;
   console.log(data);
   res.render('Create')
   
}


module.exports = { HandleGet ,HandlePost};
