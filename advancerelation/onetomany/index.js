const http = require('http');
const path = require('path');

const { writeFile, updateJSONData, readFile, writeJSONToFile } = require('./handler function/handleFunc');

const PORT = 8000;
const MANAGER_FILE = path.join(__dirname, 'Manager.json');
const TEAMMEMBER_FILE = path.join(__dirname, 'TeamMember.json');

function getNextId(jsonArray) {
    const maxId = jsonArray.reduce((max, item) => (item.id > max ? item.id : max), 0);
    return maxId + 1;
}

const server = http.createServer((req, res) => {
    console.log(`Received request: ${req.method} ${req.url}`);

    if (req.method === 'POST' && req.url === '/Manager') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const { name } = JSON.parse(body);
                if (!name) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Missing name' }));
                    return;
                }

                updateJSONData(MANAGER_FILE, (managers) => {
                    const managerId = getNextId(managers);
                    const newManager = { id: managerId, name, teamMemberIds: [] };
                    managers.push(newManager);
                }, res);

            } catch (e) {
                console.error('Error parsing JSON:', e.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid JSON' }));
            }
        });

    } else if (req.method === 'POST' && req.url === '/TeamMember') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const { name, managerId } = JSON.parse(body);
                if (!name || !managerId) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Missing name or managerId' }));
                    return;
                }

                updateJSONData(TEAMMEMBER_FILE, (teamMembers) => {
                    const teamMemberId = getNextId(teamMembers);
                    const newTeamMember = { id: teamMemberId, name, managerId };
                    teamMembers.push(newTeamMember);

                    // Update manager's teamMemberIds
                    updateJSONData(MANAGER_FILE, (managers) => {
                        const manager = managers.find(mgr => mgr.id === managerId);
                        if (manager) {
                            manager.teamMemberIds.push(teamMemberId);
                        }
                    }, res);

                }, res);

            } catch (e) {
                console.error('Error parsing JSON:', e.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid JSON' }));
            }
        });

    } else if (req.method === 'DELETE' && req.url.startsWith('/Manager/')) {
        const urlParts = req.url.split('/');
        const managerId = parseInt(urlParts[urlParts.length - 1], 10);
        const forceDelete = urlParts.includes('force');

        readFile(MANAGER_FILE, (managers) => {
            const manager = managers.find(mgr => mgr.id === managerId);
            if (!manager) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Manager not found' }));
                return;
            }

            if (manager.teamMemberIds.length > 0 && !forceDelete) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Manager still has team members. Use force delete.' }));
                return;
            }

            // Remove manager and cascade delete (set teamMember managerId to null)
            const updatedManagers = managers.filter(mgr => mgr.id !== managerId);
            writeFile(MANAGER_FILE, updatedManagers);

            updateJSONData(TEAMMEMBER_FILE, (teamMembers) => {
                teamMembers.forEach(teamMember => {
                    if (teamMember.managerId === managerId) {
                        teamMember.managerId = null; // Cascade delete
                    }
                });
            }, res);

        }, res);

    } else if (req.method === 'GET' && req.url === '/TeamSizeReport') {
        readFile(MANAGER_FILE, (managers) => {
            const report = managers.map(manager => ({
                managerId: manager.id,
                managerName: manager.name,
                teamSize: manager.teamMemberIds.length
            }));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(report, null, 2));
        }, res);

    } else if (req.method === 'GET' && req.url.startsWith('/TeamMembers/')) {
        const urlParts = req.url.split('/');
        const managerId = parseInt(urlParts[urlParts.length - 1], 10);

        readFile(MANAGER_FILE, (managers) => {
            const manager = managers.find(mgr => mgr.id === managerId);
            if (!manager) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Manager not found' }));
                return;
            }

            readFile(TEAMMEMBER_FILE, (teamMembers) => {
                const associatedMembers = teamMembers.filter(tm => tm.managerId === managerId);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(associatedMembers, null, 2));
            }, res);

        }, res);

    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
