const Router = require("@koa/router");
const  checkLoggedIn = require("../../lib/checkLoggedIn");
const  bookCtrl  = require("./book.ctrl");
const book = new Router();

book.get('/',bookCtrl.getOneBook);  
//mybook=page,title
//author_name = author name     
book.post('/',checkLoggedIn,bookCtrl.addBook);    // add book
book.patch('/', checkLoggedIn, bookCtrl.updateBook);  // modify book information
book.delete('/',checkLoggedIn,bookCtrl.deleteBook);   // delete book
book.get('/booklist',bookCtrl.booklist);
book.get('/search',bookCtrl.scrollBook);

module.exports = book;