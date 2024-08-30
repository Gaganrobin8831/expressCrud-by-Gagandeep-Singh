const http = require('http');
const fs = require('fs');
const path = require('path');

const {handleFileError,writeJSONToFile,updateJSONData} = require('./userHandler/handleFunc')

const PORT = 8000;
const USERS_FILE = path.join(__dirname,  'users.json');
console.log(USERS_FILE);

const PROFILES_FILE = path.join(__dirname,  'profiles.json');


function getNextId(jsonArray) {
    return jsonArray.length ? Math.max(jsonArray.map(item => item.id)) + 1 : 1;
}

const server = http.createServer((req, res) => {
    console.log(`Received request: ${req.method} ${req.url}`);

    if (req.method === 'POST' && req.url === '/users') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const parsedBody = JSON.parse(body);
                const { name ,bio} = parsedBody;

                if (!name) {
                    res.statusCode = 400;
                    res.end('Missing name');
                    return;
                }

            
                updateJSONData(USERS_FILE, (users) => {
                    const userId = getNextId(users);
                    const newUser = { id: userId, name, profileId: null };
                    users.push(newUser);

                  
                    updateJSONData(PROFILES_FILE, (profiles) => {
                        const profileId = getNextId(profiles);
                        const newProfile = { id: profileId, bio: bio, userId };
                        profiles.push(newProfile);

                      
                        users = users.map(user => user.id === userId ? { ...user, profileId } : user);
                        writeJSONToFile(USERS_FILE, users, res);
                    }, res);
                }, res);
            } catch (e) {
                console.error('Error parsing JSON:', e.message);
                res.statusCode = 400;
                res.end('Invalid JSON');
            }
        });

    }else if (req.method === 'PUT' && req.url.startsWith('/users/')) {
       
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const parsedBody = JSON.parse(body);
                const { id, name, profileId } = parsedBody;

                if (!id) {
                    res.statusCode = 400;
                    res.end('Missing id');
                    return;
                }

                updateJSONData(USERS_FILE, (users) => {
                    const index = users.findIndex(user => user.id === id);
                    if (index === -1) {
                        res.statusCode = 404;
                        res.end('User not found');
                        return;
                    }

                    users[index] = { ...users[index], name, profileId };
                    writeJSONToFile(USERS_FILE, users, res);
                }, res);
            } catch (e) {
                console.error('Error parsing JSON:', e.message);
                res.statusCode = 400;
                res.end('Invalid JSON');
            }
        });

    } else if (req.method === 'PUT' && req.url.startsWith('/profiles/')) {
       
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const parsedBody = JSON.parse(body);
                const { id, bio, userId } = parsedBody;

                if (!id) {
                    res.statusCode = 400;
                    res.end('Missing id');
                    return;
                }

                updateJSONData(PROFILES_FILE, (profiles) => {
                    const index = profiles.findIndex(profile => profile.id === id);
                    if (index === -1) {
                        res.statusCode = 404;
                        res.end('Profile not found');
                        return;
                    }

                    profiles[index] = { ...profiles[index], bio, userId };
                    writeJSONToFile(PROFILES_FILE, profiles, res);
                }, res);
            } catch (e) {
                console.error('Error parsing JSON:', e.message);
                res.statusCode = 400;
                res.end('Invalid JSON');
            }
        });

    } else if (req.method === 'DELETE' && req.url.startsWith('/users/')) {
        
        const urlParts = req.url.split('/');
        const id = parseInt(urlParts[urlParts.length - 1], 10);

        if (isNaN(id)) {
            res.statusCode = 400;
            res.end('Invalid ID');
            return;
        }

        updateJSONData(USERS_FILE, (users) => {
            const newArray = users.filter(user => user.id !== id);
            if (newArray.length === users.length) {
                res.statusCode = 404;
                res.end('User not found');
                return;
            }
            users.length = 0;
            users.push(...newArray);

            
            updateJSONData(PROFILES_FILE, (profiles) => {
                const newProfiles = profiles.filter(profile => profile.userId !== id);
                profiles.length = 0;
                profiles.push(...newProfiles);
                writeJSONToFile(PROFILES_FILE, profiles, res);
            }, res);
        }, res);

    } else if (req.method === 'DELETE' && req.url.startsWith('/profiles/')) {
      
        const urlParts = req.url.split('/');
        const id = parseInt(urlParts[urlParts.length - 1], 10);

        if (isNaN(id)) {
            res.statusCode = 400;
            res.end('Invalid ID');
            return;
        }

        updateJSONData(PROFILES_FILE, (profiles) => {
            const newArray = profiles.filter(profile => profile.id !== id);
            if (newArray.length === profiles.length) {
                res.statusCode = 404;
                res.end('Profile not found');
                return;
            }
            profiles.length = 0;
            profiles.push(...newArray);

           
            updateJSONData(USERS_FILE, (users) => {
                users.forEach(user => {
                    if (user.profileId === id) {
                        user.profileId = null;
                    }
                });
                writeJSONToFile(USERS_FILE, users, res);
            }, res);
        }, res);

    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
