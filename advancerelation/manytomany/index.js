const http = require('http');
const fs = require('fs');
const path = require('path');
const { handleFileError, writeJSONToFile, updateJSONData, readFile } = require('./handler/handle');
const PORT = 8000;
const TRAINERS_FILE_PATH = path.join(__dirname, 'trainers.json');
const WORKSHOPS_FILE_PATH = path.join(__dirname, 'workshops.json');

const server = http.createServer(async (req, res) => {
    console.log(`Received request: ${req.method} ${req.url}`);

  
    if (req.method === 'GET' && req.url === '/trainers') {
        try {
            const [trainers, workshops] = await Promise.all([
                readFile(TRAINERS_FILE_PATH),
                readFile(WORKSHOPS_FILE_PATH)
            ]);
            const enrichedTrainers = trainers.map(trainer => {
                const trainerWorkshops = trainer.workshopIds.map(workshopId =>
                    workshops.find(workshop => workshop.id === workshopId)
                );
                return { ...trainer, workshopIds: trainerWorkshops };
            });
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(enrichedTrainers));
        } catch (err) {
            handleFileError(res, err);
        }

        // GET workshops
    } else if (req.method === 'GET' && req.url === '/workshops') {
        try {
            const [workshops, trainers] = await Promise.all([
                readFile(WORKSHOPS_FILE_PATH),
                readFile(TRAINERS_FILE_PATH)
            ]);
            
            const enrichedWorkshops = workshops.map(workshop => {
                const workshopTrainers = workshop.trainerIds.map(trainerId =>
                    trainers.find(trainer => trainer.id === trainerId)
               
                );
                
                return { ...workshop, trainerIds: workshopTrainers};
            });
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(enrichedWorkshops));
        } catch (err) {
            handleFileError(res, err);
        }

        // POST create-trainer
    } else if (req.method === 'POST' && req.url === '/create-trainer') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { name } = JSON.parse(body);
                if (!name) {
                    res.statusCode = 400;
                    res.end('Missing name');
                    return;
                }

                const trainers = await readFile(TRAINERS_FILE_PATH);
                const newTrainerId = trainers.length ? trainers[trainers.length - 1].id + 1 : 1;
                const newTrainer = { id: newTrainerId, name, workshopIds: [] };
                trainers.push(newTrainer);

                await writeJSONToFile(TRAINERS_FILE_PATH, trainers);
                res.statusCode = 201;
                res.end('Trainer created successfully');
            } catch (e) {
                res.statusCode = 400;
                res.end('Invalid JSON');
            }
        });

        // POST create-workshop
    } else if (req.method === 'POST' && req.url === '/create-workshop') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { title } = JSON.parse(body);
                if (!title) {
                    res.statusCode = 400;
                    res.end('Missing title');
                    return;
                }

                const workshops = await readFile(WORKSHOPS_FILE_PATH);
                const newWorkshopId = workshops.length ? workshops[workshops.length - 1].id + 1 : 1;
                const newWorkshop = { id: newWorkshopId, title, trainerIds: [] };
                workshops.push(newWorkshop);

                await writeJSONToFile(WORKSHOPS_FILE_PATH, workshops);
                res.statusCode = 201;
                res.end('Workshop created successfully');
            } catch (e) {
                res.statusCode = 400;
                res.end('Invalid JSON');
            }
        });

        // PUT update-trainer
    } else if (req.method === 'PUT' && req.url.startsWith('/update-trainer')) {
        let body = '';

        req.on('data', chunk => body += chunk.toString());

        req.on('end', async () => {
            try {
                const parsedBody = JSON.parse(body);
                const { name, workshop } = parsedBody;

                if (!name || !workshop) {
                    res.statusCode = 400;
                    res.end('Missing name or workshop');
                    return;
                }

                // Read trainers and workshops files
                const trainers = await readFile(TRAINERS_FILE_PATH);
                const workshops = await readFile(WORKSHOPS_FILE_PATH);

                // Find or create the workshop
                let workshopObj = workshops.find(c => c.title === workshop); // Adjusted to 'title' based on your JSON structure
                if (!workshopObj) {
                    const newWorkshopId = workshops.length ? workshops[workshops.length - 1].id + 1 : 1;
                    workshopObj = {
                        id: newWorkshopId,
                        title: workshop,
                        trainerIds: []
                    };
                    workshops.push(workshopObj);
                }

                // Find or create the trainer
                let trainer = trainers.find(s => s.name === name);
                if (!trainer) {
                    const newTrainerId = trainers.length ? trainers[trainers.length - 1].id + 1 : 1;
                    trainer = { id: newTrainerId, name, workshopIds: [workshopObj.id] };
                    trainers.push(trainer);
                } else {
                    if (!trainer.workshopIds) trainer.workshopIds = []; // Ensure workshopIds is an array
                    if (!trainer.workshopIds.includes(workshopObj.id)) {
                        trainer.workshopIds.push(workshopObj.id);
                    }
                }

                // Ensure trainerIds is initialized
                if (!workshopObj.trainerIds) workshopObj.trainerIds = [];
                if (!workshopObj.trainerIds.includes(trainer.id)) {
                    workshopObj.trainerIds.push(trainer.id);
                }

                // Write updates to the files
                await writeJSONToFile(TRAINERS_FILE_PATH, trainers);
                await writeJSONToFile(WORKSHOPS_FILE_PATH, workshops);

                res.statusCode = 200;
                res.end('Trainer and workshop updated successfully');
            } catch (e) {
                console.error('Error parsing JSON:', e.message);
                res.statusCode = 400;
                res.end('Invalid JSON');
            }
        });

        // PUT update-workshop
    } else if (req.method === 'PUT' && req.url.startsWith('/update-workshop')) {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const parsedBody = JSON.parse(body);
                const { name, workshop } = parsedBody;

                if (!name || !workshop) {
                    res.statusCode = 400;
                    res.end('Missing name or workshop');
                    return;
                }

                // Read trainers and workshops files
                const trainers = await readFile(TRAINERS_FILE_PATH);
                const workshops = await readFile(WORKSHOPS_FILE_PATH);

      

                // Find or create the workshop
                let workshopObj = workshops.find(c => c.title === workshop); 
                if (!workshopObj) {
                    const newWorkshopId = workshops.length ? workshops[workshops.length - 1].id + 1 : 1;
                    workshopObj = {
                        id: newWorkshopId,
                        title: workshop,
                        trainerIds: []
                    };
                    workshops.push(workshopObj);
                }

                // Find or create the trainer
                let trainer = trainers.find(s => s.name === name);
                if (!trainer) {
                    const newTrainerId = trainers.length ? trainers[trainers.length - 1].id + 1 : 1;
                    trainer = { id: newTrainerId, name, workshopIds: [workshopObj.id] };
                    trainers.push(trainer);
                } else {
                    if (!trainer.workshopIds) trainer.workshopIds = []; // Ensure workshopIds is an array
                    if (!trainer.workshopIds.includes(workshopObj.id)) {
                        trainer.workshopIds.push(workshopObj.id);
                    }
                }

                // Ensure trainerIds is initialized
                if (!workshopObj.trainerIds) workshopObj.trainerIds = [];
                if (!workshopObj.trainerIds.includes(trainer.id)) {
                    workshopObj.trainerIds.push(trainer.id);
                }

                // Write updates to the files
                await writeJSONToFile(TRAINERS_FILE_PATH, trainers);
                await writeJSONToFile(WORKSHOPS_FILE_PATH, workshops);

                res.statusCode = 200;
                res.end('Trainer and workshop updated successfully');


            } catch (e) {
                res.statusCode = 400;
                res.end('Invalid JSON');
            }
        });

        // DELETE delete-trainer
    } else if (req.method === 'DELETE' && req.url.startsWith('/delete-trainer/')) {
        const trainerId = parseInt(req.url.split('/').pop());
        if (isNaN(trainerId)) {
            res.statusCode = 400;
            res.end('Invalid trainer ID');
            return;
        }

        try {
            const trainers = await readFile(TRAINERS_FILE_PATH);
            const updatedTrainers = trainers.filter(trainer => trainer.id !== trainerId);
            if (updatedTrainers.length === trainers.length) {
                res.statusCode = 404;
                res.end('Trainer not found');
                return;
            }
            await writeJSONToFile(TRAINERS_FILE_PATH, updatedTrainers);

            const workshops = await readFile(WORKSHOPS_FILE_PATH);
            const updatedWorkshops = workshops.map(workshop => {
                workshop.trainerIds = workshop.trainerIds.filter(id => id !== trainerId);
                return workshop;
            });
            await writeJSONToFile(WORKSHOPS_FILE_PATH, updatedWorkshops);

            res.statusCode = 200;
            res.end('Trainer deleted and associated workshops updated successfully');
        } catch (err) {
            handleFileError(res, err);
        }

        // DELETE delete-workshop
    } else if (req.method === 'DELETE' && req.url.startsWith('/delete-workshop/')) {
        const workshopId = parseInt(req.url.split('/').pop());
        if (isNaN(workshopId)) {
            res.statusCode = 400;
            res.end('Invalid workshop ID');
            return;
        }

        try {
            const workshops = await readFile(WORKSHOPS_FILE_PATH);
            const updatedWorkshops = workshops.filter(workshop => workshop.id !== workshopId);
            if (updatedWorkshops.length === workshops.length) {
                res.statusCode = 404;
                res.end('Workshop not found');
                return;
            }
            await writeJSONToFile(WORKSHOPS_FILE_PATH, updatedWorkshops);

            const trainers = await readFile(TRAINERS_FILE_PATH);
            const updatedTrainers = trainers.map(trainer => {
                trainer.workshopIds = trainer.workshopIds.filter(id => id !== workshopId);
                return trainer;
            });
            await writeJSONToFile(TRAINERS_FILE_PATH, updatedTrainers);

            res.statusCode = 200;
            res.end('Workshop and associated trainers updated successfully');
        } catch (err) {
            handleFileError(res, err);
        }

    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});