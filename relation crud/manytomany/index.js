const http = require('http');
const fs = require('fs');
const path = require('path');
const { handleFileError, writeJSONToFile, updateJSONData, readFile } = require('./handler/handle');
const PORT = 8000;
const STUDENTS_FILE_PATH = path.join(__dirname, 'student.json');
const COURSES_FILE_PATH = path.join(__dirname,  'courses.json');


const server = http.createServer((req, res) => {
    console.log(`Received request: ${req.method} ${req.url}`);

    if (req.method === 'GET' && req.url === '/students') {
        
        readFile(STUDENTS_FILE_PATH, (err, students) => {
            if (err) return handleFileError(res, err);
            readFile(COURSES_FILE_PATH, (err, courses) => {
                if (err) return handleFileError(res, err);
                const enrichedStudents = students.map(student => {
                    const enrolledCourses = student.classId.map(courseId =>
                        courses.find(course => course.id === courseId)
                    );
                    return { ...student, classId: enrolledCourses };
                });
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(enrichedStudents));
            });
        });
   
    }else if(req.method=== 'GET' && req.url === '/Courses'){ 
        
        readFile(COURSES_FILE_PATH, (err, courses) => {
            if (err) return handleFileError(res, err);
            readFile(STUDENTS_FILE_PATH, (err, students) => {
                if (err) return handleFileError(res, err);
                const enrichedcourses = courses.map(course => {
                    const enrolledstudent = course.studentIds.map(studentId =>
                        students.find(student => student.id === studentId)
                    );
                    return { ...course, studentIds: enrolledstudent };
                });
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(enrichedcourses));
            });
        });
   
    }else if (req.method === 'POST' && req.url === '/create-student') {
        let body = '';
        console.log("ksjdbjksdbjksbdjkb");
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const parsedBody = JSON.parse(body);
                const { name, course } = parsedBody;
                if (!name || !course) {
                    res.statusCode = 400;
                    res.end('Missing name or course');
                    return;
                }
                console.log("entet here");
                
                readFile(STUDENTS_FILE_PATH, (err, students) => {
                    if (err) return handleFileError(res, err);
                    readFile(COURSES_FILE_PATH, (err, courses) => {
                        if (err) return handleFileError(res, err);
                       
                        let courseObj = courses.find(c => c.coursename === course);
                        if (!courseObj) {
                            const newCourseId = courses.length ? courses[courses.length - 1].id + 1 : 1;
                            courseObj = {
                                id: newCourseId,
                                coursename: course,
                                studentIds: []
                            };
                            courses.push(courseObj);
                        }
                       
                        let student = students.find(s => s.name === name);
                        if (!student) {
                            const newStudentId = students.length ? students[students.length - 1].id + 1 : 1;
                            student = { id: newStudentId, name, courseID: [courseObj.id] };
                            students.push(student);
                        } else {
                            if (!student.courseID.includes(courseObj.id)) {
                                student.courseID.push(courseObj.id);
                            }
                        }
                      
                        if (!courseObj.studentIds.includes(student.id)) {
                            courseObj.studentIds.push(student.id);
                        }
                        
                        writeJSONToFile(STUDENTS_FILE_PATH, students, err => {
                            if (err) return handleFileError(res, err);
                            writeJSONToFile(COURSES_FILE_PATH, courses, err => {
                                if (err) return handleFileError(res, err);
                                res.statusCode = 200;
                                res.end('Student and course updated successfully');
                            });
                        });
                    });
                });
            } catch (e) {
                console.error('Error parsing JSON:', e.message);
                res.statusCode = 400;
                res.end('Invalid JSON');
            }
        });
    } else if (req.method === 'PUT' && req.url.startsWith('/update-student')) {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { id, name, classId } = JSON.parse(body);
                if (!id || !name || !Array.isArray(classId)) {
                    res.statusCode = 400;
                    res.end('Invalid data format');
                    return;
                }
                updateJSONData(STUDENTS_FILE_PATH, students => {
                    const index = students.findIndex(student => student.id === id);
                    if (index === -1) {
                        res.statusCode = 404;
                        res.end('Student not found');
                        return;
                    }
                    students[index] = { id, name, classId };
                }, res, () => {
                    res.statusCode = 200;
                    res.end('Student updated');
                });
            } catch (e) {
                res.statusCode = 400;
                res.end('Invalid JSON');
            }
        });
    } else if (req.method === 'PUT' && req.url.startsWith('/update-course')) {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { id, coursename, studentid } = JSON.parse(body);
                if (!id || !coursename || !Array.isArray(studentid)) {
                    res.statusCode = 400;
                    res.end('Invalid data format');
                    return;
                }
                updateJSONData(COURSES_FILE_PATH, courses => {
                    const index = courses.findIndex(course => course.id === id);
                    if (index === -1) {
                        res.statusCode = 404;
                        res.end('Course not found');
                        return;
                    }
                    courses[index] = { id, coursename, studentid };
                }, res, () => {
                    res.statusCode = 200;
                    res.end('Course updated');
                });
            } catch (e) {
                res.statusCode = 400;
                res.end('Invalid JSON');
            }
        });
    } else if (req.method === 'DELETE' && req.url.startsWith('/delete-student')) {
        const studentID = parseInt(req.url.split('/').pop());
        if (isNaN(studentID)) {
            res.statusCode = 400;
            res.end('Invalid student ID');
            return;
        }
        
        readFile(STUDENTS_FILE_PATH, (err, students) => {
            if (err) {
                handleFileError(res, err);
                return;
            }
            const newStudents = students.filter(student => student.id !== studentID);
            if (newStudents.length === students.length) {
                res.statusCode = 404;
                res.end('Student not found');
                return;
            }
           
            writeJSONToFile(STUDENTS_FILE_PATH, newStudents, (err) => {
                if (err) {
                    handleFileError(res, err);
                    return;
                }
               
                
                readFile(COURSES_FILE_PATH, (err, courses) => {
                    if (err) {
                        handleFileError(res, err);
                        return;
                    }
                    const updatedCourses = courses.map(course => {
                        course.studentIds = course.studentIds.filter(id => id !== studentID);
                        return course;
                    });
                    
                    
                    writeJSONToFile(COURSES_FILE_PATH, updatedCourses, (err) => {
                        if (err) {
                            handleFileError(res, err);
                            return;
                        }
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end('Student and associated course links deleted successfully');
                    });
                });
            });
        });
    } else if (req.method === 'DELETE' && req.url.startsWith('/delete-course')) {
        const courseID = parseInt(req.url.split('/').pop());
        if (isNaN(courseID)) {
            res.statusCode = 400;
            res.end('Invalid course ID');
            return;
        }
       readFile(COURSES_FILE_PATH, (err, courses) => {
            if (err) {
                handleFileError(res, err);
                return;
            }
            const newCourses = courses.filter(course => course.id !== courseID);
            if (newCourses.length === courses.length) {
                res.statusCode = 404;
                res.end('Course not found');
                return;
            }
           
            writeJSONToFile(COURSES_FILE_PATH, newCourses, (err) => {
                if (err) {
                    handleFileError(res, err);
                    return;
                }
              
                readFile(STUDENTS_FILE_PATH, (err, students) => {
                    if (err) {
                        handleFileError(res, err);
                        return;
                    }
                    const updatedStudents = students.map(student => {
                        student.courseID = student.courseID.filter(id => id !== courseID);
                        return student;
                    });
                    
                    writeJSONToFile(STUDENTS_FILE_PATH, updatedStudents, (err) => {
                        if (err) {
                            handleFileError(res, err);
                            return;
                        }
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end('Course and associated student links deleted successfully');
                    });
                });
            });
        });
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});