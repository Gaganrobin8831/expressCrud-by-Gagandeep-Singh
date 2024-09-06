const fs = require('fs');
const http = require('http');
const path = require('path');

const EMPLOYEE_FILE = path.join(__dirname, 'TeamMember.json');
const MANAGER_FILE = path.join(__dirname, 'Manager.json');

const {  writeJSONToFile, updateJSONData, readFile, writeFile } = require('./handler function/handleFunc');

const server = http.createServer((req, res) => {
    const urlParts = req.url.split('/');
    const id = parseInt(urlParts[urlParts.length - 1], 10);

    if (req.method === 'POST' && req.url === '/managers') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const newManager = JSON.parse(body);
            newManager.employeeIds = [];
            readFile(MANAGER_FILE, (managers) => {
                newManager.id = managers.length ? managers[managers.length - 1].id + 1 : 1;
                managers.push(newManager);
                writeFile(MANAGER_FILE, managers, res);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'File Write successfully' }));
            });
        });
    }

    else if (req.method === 'POST' && req.url === '/employees') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const newEmployee = JSON.parse(body);
            newEmployee.managerId = null;
            readFile(EMPLOYEE_FILE, (employees) => {
                newEmployee.id = employees.length ? employees[employees.length - 1].id + 1 : 1;
                employees.push(newEmployee);
                writeFile(EMPLOYEE_FILE, employees, res);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'File Write successfully' }));
            });
        });
    }
    else if (req.method === 'PUT' && req.url.startsWith('/managers/')) {
        if (isNaN(id)) {
            res.statusCode = 400;
            res.end('Invalid ID');
            return;
        }

        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            let parsedBody;
            try {
                parsedBody = JSON.parse(body);
            } catch (error) {
                res.statusCode = 400;
                res.end('Invalid JSON');
                return;
            }


            const employeeIds = Array.isArray(parsedBody.employeeIds) ? parsedBody.employeeIds : [parsedBody.employeeIds];

            readFile(MANAGER_FILE, (managers) => {
                const manager = managers.find(manager => manager.id === id);
                if (!manager) {
                    res.statusCode = 404;
                    res.end('Manager not found');
                    return;
                }


                const previousEmployeeIds = [...manager.employeeIds];


                // manager.employeeIds = [];

                readFile(EMPLOYEE_FILE, (employees) => {
                    employees.forEach(employee => {
                        if (employeeIds.includes(employee.id)) {

                            employee.managerId = id;


                            manager.employeeIds.push(employee.id);
                        } 
                     
                    });


                    previousEmployeeIds.forEach(prevEmpId => {
                        if (!manager.employeeIds.includes(prevEmpId)) {
                            const oldManager = managers.find(mgr => mgr.employeeIds.includes(prevEmpId));
                            if (oldManager) {
                                oldManager.employeeIds = oldManager.employeeIds.filter(empId => empId !== prevEmpId);
                            }
                        }
                    });


                    writeFile(EMPLOYEE_FILE, employees, res);
                    writeFile(MANAGER_FILE, managers, res);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Manager and employee records updated successfully' }));


                });
            });
        });
    }
    else if (req.method === 'PUT' && req.url.startsWith('/employees/')) {
        if (isNaN(id)) {
            res.statusCode = 400;
            res.end('Invalid ID');
            return;
        }

        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            let parsedBody;
            try {
                parsedBody = JSON.parse(body);
            } catch (error) {
                res.statusCode = 400;
                res.end('Invalid JSON');
                return;
            }
            const managerId = parsedBody.managerId;
            console.log("HEllo");

            readFile(EMPLOYEE_FILE, (employees) => {
                const employee = employees.find(employee => employee.id === id);
                if (!employee) {
                    res.statusCode = 404;
                    res.end('Employee not found');
                    return;
                }
                employee.managerId = managerId;

                readFile(MANAGER_FILE, (managers) => {
                    managers.forEach(manager => {
                        if (manager.id === managerId) {
                            if (!manager.employeeIds.includes(id)) {
                                manager.employeeIds.push(id);
                            }
                        } else {
                            manager.employeeIds = manager.employeeIds.filter(empId => empId !== id);
                        }
                    });
                    writeFile(MANAGER_FILE, managers, res);
                    writeFile(EMPLOYEE_FILE, employees, res);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Manager and employee records updated successfully' }));

                });
            });
        });
    }
    else if (req.method === 'GET' && req.url === '/EmployeeRead') {
        readFile(EMPLOYEE_FILE, (employeeData) => {
            readFile(MANAGER_FILE, (MAnagerDATA) => {
                const updatedEmployees = employeeData.map(employee => {
                    const matchedOffice = MAnagerDATA.find(Manger => Manger.id === employee.managerId);
                    console.log(matchedOffice);

                    return {
                        ...employee,
                        office: matchedOffice || null
                    };
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(updatedEmployees, null, 2));
            }, res);
        }, res);

    } else if (req.method === 'GET' && req.url === '/ManagersRead') {

        fs.readFile(MANAGER_FILE, 'utf8', (err, ManagerData) => {
            if (err) {
                handleFileError(res, err);
                return;
            }
            readFile(EMPLOYEE_FILE, (EmployeeData) => {



                const Manager = JSON.parse(ManagerData);
                const Employes = EmployeeData

                const combinedData = Manager.map(Manger => {
                    const MangerEmployes = Employes.filter(employee => Manger.employeeIds.includes(employee.id));
                    return {
                        ...Manger,
                        booksId: MangerEmployes
                    };
                });



                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(combinedData, null, 2));
            });
        });
    }
    else if (req.method === 'DELETE' && req.url.startsWith('/managers/')) {
        if (isNaN(id)) {
            res.statusCode = 400;
            res.end('Invalid ID');
            return;
        }

        readFile(MANAGER_FILE, (managers) => {
            const newManagers = managers.filter(manager => manager.id !== id);
            if (newManagers.length === managers.length) {
                res.statusCode = 404;
                res.end('Manager not found');
                return;
            }

            readFile(EMPLOYEE_FILE, (employees) => {
                employees.forEach(employee => {
                    if (employee.managerId === id) {
                        employee.managerId = null;
                    }
                });
                writeFile(EMPLOYEE_FILE, employees, res)
                writeFile(MANAGER_FILE, newManagers, res);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Manager records Delete successfully' }));
            });
        });
    }

    else if (req.method === 'DELETE' && req.url.startsWith('/employees/')) {
        if (isNaN(id)) {
            res.statusCode = 400;
            res.end('Invalid ID');
            return;
        }

        readFile(EMPLOYEE_FILE, (employees) => {
            const newEmployees = employees.filter(employee => employee.id !== id);
            if (newEmployees.length === employees.length) {
                res.statusCode = 404;
                res.end('Employee not found');
                return;
            }

            readFile(MANAGER_FILE, (managers) => {
                managers.forEach(manager => {
                    manager.employeeIds = manager.employeeIds.filter(empId => empId !== id);
                });
                writeFile(MANAGER_FILE, managers, res);
                writeFile(EMPLOYEE_FILE, newEmployees, res);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'employee records Delete successfully' }));
            });
        });
    } else {
        res.statusCode = 404;
        res.end('Invalid Request');
    }
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});