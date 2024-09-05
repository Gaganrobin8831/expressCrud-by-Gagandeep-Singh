const http = require('http');
const path = require('path');

const { writeFile, updateJSONData, readFile,writeJSONToFile } = require('./handler function/handleFunc');

const PORT = 8000;
const Employee_FILE = path.join(__dirname, 'Employee.json');
const ofiices_FILE = path.join(__dirname, 'ofiices.json');

function getNextId(jsonArray) {
    const maxId = jsonArray.reduce((max, item) => (item.id > max ? item.id : max), 0);
    return maxId + 1;
}

const server = http.createServer((req, res) => {
    console.log(`Received request: ${req.method} ${req.url}`);

    if (req.method === 'POST' && req.url === '/Employee') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const parsedBody = JSON.parse(body);
                const { name } = parsedBody;

                if (!name) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Missing name' }));
                    return;
                }

                readFile(Employee_FILE, (employeeData) => {

                    const employee = employeeData.find(emp => emp.name === name);

                    if (employee) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Employee already exit' }));
                        return;
                    }


                    updateJSONData(Employee_FILE, (employees) => {
                        const userId = getNextId(employees);
                        const newUser = { id: userId, name, officeId: null };
                        employees.push(newUser);
                    }, res);

                },res)
            } catch (e) {
                console.error('Error parsing JSON:', e.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid JSON' }));
            }
        });

    } else if (req.method === 'POST' && req.url === '/office') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                console.log("213123---------------");

                const parsedBody = JSON.parse(body);
                const { location } = parsedBody;


                if (!location) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Missing location' }));
                    return;
                }
                readFile(ofiices_FILE, (officeData) => {
                    console.log("1---------------");
                    
                    const office = officeData.find(office => office.location === location);

                    if (office) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Office already exit' }));
                        return;
                    }

                    updateJSONData(ofiices_FILE, (offices) => {
                        console.log("2---------------");
                        const officeId = getNextId(offices);
                        const newOffice = { id: officeId, location, EmployeeId: null };
                        offices.push(newOffice);
                    }, res);

                },res)
            } catch (e) {
                console.error('Error parsing JSON:', e.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid JSON' }));
            }
        });

    } else if (req.method === 'GET' && req.url === '/EmployeeRead') {
        readFile(Employee_FILE, (employeeData) => {
            readFile(ofiices_FILE, (officeData) => {
                const updatedEmployees = employeeData.map(employee => {
                    const matchedOffice = officeData.find(office => office.id === employee.officeId);
                    return {
                        ...employee,
                        office: matchedOffice || null
                    };
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(updatedEmployees, null, 2));
            }, res);
        }, res);

    } else if (req.method === 'GET' && req.url === '/OfficeRead') {
        readFile(ofiices_FILE, (officeData) => {
            readFile(Employee_FILE, (employeeData) => {
                const updatedOffices = officeData.map(office => {
                    const matchedEmployee = employeeData.find(employee => employee.id === office.EmployeeId);
                    return {
                        ...office,
                        employee: matchedEmployee || null
                    };
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(updatedOffices, null, 2));
            }, res);
        }, res);

    } else if (req.method === 'PUT' && req.url === '/UpdateEmployee') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const { employeeId, officeId } = JSON.parse(body);

                readFile(Employee_FILE, (employeeData) => {
                    readFile(ofiices_FILE, (officeData) => {

                        const employee = employeeData.find(emp => emp.id === employeeId);
                        const office = officeData.find(office => office.id === officeId);

                        if (!employee) {
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Employee not found' }));
                            return;
                        }
                        if (!office) {
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Office not found' }));
                            return;
                        }
                        if (office.EmployeeId && office.EmployeeId !== employeeId) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Office is already assigned to another employee' }));
                            return;
                        }
                        if (employee.officeId !== null) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Employee is already assigned to another Office' }));
                            return;
                        }


                        employee.officeId = officeId;
                        office.EmployeeId = employeeId;


                        writeFile(Employee_FILE, employeeData, res);
                        writeFile(ofiices_FILE, officeData, res);


                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Employee updated successfully' }));
                    }, res);
                }, res);

            } catch (e) {
                console.error('Error parsing JSON:', e.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });

    } else if (req.method === 'PUT' && req.url === '/UpdateOffice') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {

            try {
                console.log("HEllo");
                
             const { employeeId, officeId } = JSON.parse(body);

                readFile(Employee_FILE, (employeeData) => {
                    readFile(ofiices_FILE, (officeData) => {

                        const employee = employeeData.find(emp => emp.id === employeeId);
                        const office = officeData.find(office => office.id === officeId);



                        if (!office) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Office not found' }));
                            return;
                        }


                       
                        if (!employee) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Employee not found' }));
                            return;
                        }


                        if (office.EmployeeId && office.EmployeeId !== employeeId) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Office is already assigned to another employee' }));
                            return;
                        }

                        if (office.EmployeeId !== null) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Office is already assigned to another Emplooye' }));
                            return;
                        }

                        office.EmployeeId = employeeId;

                        employee.officeId = officeId;

                        writeFile(ofiices_FILE, officeData);
                        writeFile(Employee_FILE, employeeData);

                        res.writeHead(200, { 'Content-Type': 'application/json' });

                        res.end(JSON.stringify({ message: 'Employee assigned to office successfully' }));
          
                    })
                })
                        

            } catch (err) {
                console.error('Error parsing JSON:', err.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }

             
    })


    } else if (req.method === 'DELETE' && req.url.startsWith('/Emplloye/')) {
        
        const urlParts = req.url.split('/');
        const id = parseInt(urlParts[urlParts.length - 1], 10);

        if (isNaN(id)) {
            res.statusCode = 400;
            res.end('Invalid ID');
            return;
        }

        readFile(Employee_FILE, (Emplooyes) => {
            const newArray = Emplooyes.filter(Emplooye => Emplooye.id !== id);
            console.log(newArray);
            
            if (newArray.length === Emplooyes.length) {
                res.statusCode = 404;
                res.end('Employe not found');
                return;
            }
            Emplooyes.length = 0;
            Emplooyes.push(...newArray);

            writeFile(Employee_FILE,newArray)

            readFile(ofiices_FILE, (offices) => {
                let officeUpdated = false;
                const updatedOffices = offices.map(office => {
                    if (office.EmployeeId === id) {
                        office.EmployeeId = null;  
                        officeUpdated = true;
                    }
                    return office;
                });
        
                if (officeUpdated) {
                    console.log(updatedOffices);
                    writeFile(ofiices_FILE, updatedOffices);
                    res.statusCode = 200;
                    res.end('Employee deleted and office updated');
                } else {
                    res.statusCode = 200;
                    res.end('Employee deleted but no matching office found');
                }
            });
        });

    } else if (req.method === 'DELETE' && req.url.startsWith('/Office/')) {
      
       
        const urlParts = req.url.split('/');
        const id = parseInt(urlParts[urlParts.length - 1], 10);

        if (isNaN(id)) {
            res.statusCode = 400;
            res.end('Invalid ID');
            return;
        }

        readFile(ofiices_FILE, (Offices) => {
            const newArray = Offices.filter(office => office.id !== id);
            // console.log(newArray);
            
            if (newArray.length === Offices.length) {
                res.statusCode = 404;
                res.end('Employe not found');
                return;
            }
            Offices.length = 0;
            Offices.push(...newArray);

            writeFile(ofiices_FILE,newArray)

            readFile(Employee_FILE, (Emplooyes) => {
                console.log("You Enter in Employyes");
                
                let EmplloEmplooyeyeUpdate = false;
                const updateEmplloye = Emplooyes.map(Emplooye => {
                    if (Emplooye.officeId === id) {
                        Emplooye.officeId = null;  
                        EmplloEmplooyeyeUpdate = true;
                    }
                    return Emplooye;
                });
        console.log(updateEmplloye);
        
                if (EmplloEmplooyeyeUpdate) {
                    console.log(updateEmplloye);
                    writeFile(Employee_FILE, updateEmplloye);
                    res.statusCode = 200;
                    res.end('Employee deleted and office updated');
                } else {
                    res.statusCode = 200;
                    res.end('Employee deleted but no matching office found');
                }
            });
        });
    }
    else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
}
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
