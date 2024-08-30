const http = require('http');
const fs = require('fs');
const path = require('path');
const { updateJSONData, handleFileError, readFile } = require('./handler/handle');
const AUTHORS_FILE_PATH = path.join(__dirname, 'data', 'authors.json');
const BOOKS_FILE_PATH = path.join(__dirname, 'data', 'books.json');


const PORT = 8000;

const server = http.createServer((req, res) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    if (req.method === 'POST' && req.url === '/create') {
     
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { authorName, booksName } = JSON.parse(body);
                if (!authorName || !booksName) {
                    res.statusCode = 400;
                    res.end('Missing authorName or booksName');
                    return;
                }
             
                fs.readFile(AUTHORS_FILE_PATH, 'utf8', (err, authorsData) => {
                    if (err) {
                        handleFileError(res, err);
                        return;
                    }
                    let authors = [];
                    if (authorsData) {
                        authors = JSON.parse(authorsData);
                    }
                    let existingAuthor = authors.find(author => author.authorName === authorName);
                    if (existingAuthor) {
                     
                        updateJSONData(BOOKS_FILE_PATH, (books) => {
                            const newBookId = books.length ? books[books.length - 1].id + 1 : 1;
                            const newBook = { id: newBookId, booksName, authorId: existingAuthor.id };
                            books.push(newBook);
                            existingAuthor.booksId.push(newBookId);
                           
                            fs.writeFile(AUTHORS_FILE_PATH, JSON.stringify(authors, null, 2), 'utf8', (err) => {
                                if (err) {
                                    handleFileError(res, err);
                                    return;
                                }
                                fs.writeFile(BOOKS_FILE_PATH, JSON.stringify(books, null, 2), 'utf8', (err) => {
                                    if (err) {
                                        handleFileError(res, err);
                                        return;
                                    }
                                   
                                    // res.setHeader('Content-Type', 'application/json');
                                    res.end('Book added to existing author');
                                });
                            });
                        }, res);
                    } else {
                       
                        updateJSONData(AUTHORS_FILE_PATH, (authors) => {
                            const newAuthorId = authors.length ? authors[authors.length - 1].id + 1 : 1;

                            const newAuthor = { id: newAuthorId, authorName, booksId: [] };
                            console.log(newAuthor);
                            
                            authors.push(newAuthor);
                            updateJSONData(BOOKS_FILE_PATH, (books) => {
                                const newBookId = books.length ? books[books.length - 1].id + 1 : 1;
                                const newBook = { id: newBookId, booksName, authorId: newAuthorId };
                                console.log(newBook);
                                
                                books.push(newBook);
                                newAuthor.booksId.push(newBookId);
                               
                                fs.writeFile(AUTHORS_FILE_PATH, JSON.stringify(authors, null, 2), 'utf8', (err) => {
                                    if (err) {
                                        handleFileError(res, err);
                                        return;
                                    }
                                    fs.writeFile(BOOKS_FILE_PATH, JSON.stringify(books, null, 2), 'utf8', (err) => {
                                        if (err) {
                                            handleFileError(res, err);
                                            return;
                                        }
                                        res.statusCode = 200;
                                        // res.setHeader('Content-Type', 'application/json');
                                        res.end('Author and book created successfully');
                                    });
                                });
                            });
                        }, res);
                    }
                });
            } catch (e) {
                console.error('Error parsing JSON:', e.message);
                res.statusCode = 400;
                res.end('Invalid JSON');
            }
        });
    } else if (req.method === 'GET' && req.url === '/authors') {
      
        fs.readFile(AUTHORS_FILE_PATH, 'utf8', (err, authorsData) => {
            if (err) {
                handleFileError(res, err);
                return;
            }
            readFile(BOOKS_FILE_PATH,(booksData)=> {
               
               
                
                const authors = JSON.parse(authorsData);
                const books = booksData
               
                const combinedData = authors.map(author => {
                    const authorBooks = books.filter(book => author.booksId.includes(book.id));
                    return {
                        ...author,
                        booksId: authorBooks
                    };
                });
             
                
            
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(combinedData, null, 2));
            });
        });
    } else if (req.method === 'GET' && req.url === '/books') {
        
        fs.readFile(BOOKS_FILE_PATH, 'utf8', (err, data) => {
            if (err) {
                handleFileError(res, err);
                return;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(data);
        });
    } else if (req.method === 'PUT' && req.url.startsWith('/update-author')) {
      
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { id, authorName } = JSON.parse(body);
                if (id === undefined || !authorName) {
                    res.statusCode = 400;
                    res.end('Missing id or authorName');
                    return;
                }
                updateJSONData(AUTHORS_FILE_PATH, (authors) => {
                    const authorIndex = authors.findIndex(author => author.id === id);
                    if (authorIndex === -1) {
                        res.statusCode = 404;
                        res.end('Author not found');
                        return;
                    }
                    authors[authorIndex].authorName = authorName;
                }, res);
            } catch (e) {
                console.error('Error parsing JSON:', e.message);
                res.statusCode = 400;
                res.end('Invalid JSON');
            }
        });
    } else if (req.method === 'PUT' && req.url.startsWith('/update-book')) {
        // Update a book
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { id, booksName } = JSON.parse(body);
                if (id === undefined || !booksName) {
                    res.statusCode = 400;
                    res.end('Missing id or booksName');
                    return;
                }
                updateJSONData(BOOKS_FILE_PATH, (books) => {
                    const bookIndex = books.findIndex(book => book.id === id);
                    if (bookIndex === -1) {
                        res.statusCode = 404;
                        res.end('Book not found');
                        return;
                    }
                    books[bookIndex].booksName = booksName;
                }, res);
            } catch (e) {
                console.error('Error parsing JSON:', e.message);
                res.statusCode = 400;
                res.end('Invalid JSON');
            }
        });
    } else if (req.method === 'DELETE' && req.url.startsWith('/delete-author/')) {
        const authorId = parseInt(req.url.split('/').pop());
        if (isNaN(authorId)) {
            res.statusCode = 400;
            res.end('Invalid author ID');
            return;
        }

        // Read and update authors.json
        updateJSONData(AUTHORS_FILE_PATH, (authors) => {
            const authorIndex = authors.findIndex(author => author.id === authorId);
            if (authorIndex === -1) {
                res.statusCode = 404;
                res.end('Author not found');
                return;
            }

            // Get the list of books associated with the author to be deleted
            const booksToDelete = authors[authorIndex].booksId;

            // Remove the author
            authors.splice(authorIndex, 1);

            // Write the updated authors data back to file
            fs.writeFile(AUTHORS_FILE_PATH, JSON.stringify(authors, null, 2), 'utf8', (err) => {
                if (err) {
                    handleFileError(res, err);
                    return;
                }

                // Now update books.json to remove all books associated with the deleted author
                updateJSONData(BOOKS_FILE_PATH, (books) => {
                    const updatedBooks = books.filter(book => !booksToDelete.includes(book.id));

                    // Write the updated books data back to file
                    fs.writeFile(BOOKS_FILE_PATH, JSON.stringify(updatedBooks, null, 2), 'utf8', (err) => {
                        if (err) {
                            handleFileError(res, err);
                            return;
                        }

                        res.statusCode = 200;
                        res.end('Author and associated books deleted successfully');
                    });
                }, res);
            });
        }, res);

    // DELETE Book
    } else if (req.method === 'DELETE' && req.url.startsWith('/delete-book/')) {
        const bookId = parseInt(req.url.split('/').pop());
        if (isNaN(bookId)) {
            res.statusCode = 400;
            res.end('Invalid book ID');
            return;
        }

        // Read and update books.json
        updateJSONData(BOOKS_FILE_PATH, (books) => {
            const bookIndex = books.findIndex(book => book.id === bookId);
            if (bookIndex === -1) {
                res.statusCode = 404;
                res.end('Book not found');
                return;
            }

            // Remove the book
            books.splice(bookIndex, 1);

            // Write the updated books data back to file
            fs.writeFile(BOOKS_FILE_PATH, JSON.stringify(books, null, 2), 'utf8', (err) => {
                if (err) {
                    handleFileError(res, err);
                    return;
                }

                // Update authors.json to remove the reference to this book
                updateJSONData(AUTHORS_FILE_PATH, (authors) => {
                    authors.forEach(author => {
                        author.booksId = author.booksId.filter(id => id !== bookId);
                    });

                    // Write the updated authors data back to file
                    fs.writeFile(AUTHORS_FILE_PATH, JSON.stringify(authors, null, 2), 'utf8', (err) => {
                        if (err) {
                            handleFileError(res, err);
                            return;
                        }

                        res.statusCode = 200;
                        res.end('Book deleted successfully');
                    });
                }, res);
            });
        }, res);

    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});









