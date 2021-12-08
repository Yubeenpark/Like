const Router = require("@koa/router");
const  checkLoggedIn = require("../../src/lib/checkLoggedIn");
//const  bookCtrl  = require("./book.ctrl");
const book = new Router();
const User = require("../models/user");
const Book = require("../models/book");
const Joi = require('@hapi/joi');
//북id params로 전달. Render books/show
book.get('/:id', async (ctx) => {
    const bookid = ctx.params.id;//bookid by parameter
  console.log(bookid);
    try {
      const book = await Book.findOne({_id:ctx.params.id});
      const page = await Page.findById(book.pages);
      const user = await User.findById(book.author).exec();
      await ctx.render('books/show', {book,user,page});
      //ctx.body.authorname = user.nickname;
      //ctx.body = mybook;
    } catch (e) {
      ctx.throw(500, e);
    }
      //const user = await User.findById(mybook.author).exec();
    //ctx.body = mybook;
    console.log('책 정보 하나! 얻기 성공');
    ctx.status = 200;
});
//mybook=page,title
//author_name = author name     
book.post('/',checkLoggedIn,async (ctx) => {
    
    const {
        title,
        author,
        contents,
        cover,
        hashtag,
      } = ctx.request.body;
    
      const schema = Joi.object().keys({
        title: Joi.string().required(),
        author: Joi.string(),
        contents: Joi.string().allow(null, ''),
        hashtag: Joi.string().allow(null, ''),
        cover: Joi.allow(null, ''),
      });
      try {
          await schema.validateAsync(ctx.request.body);
        } catch (err) {
          console.log('add book validaton' + err);
          ctx.status = 400;
          return;
        }
        ctx.request.body.author = ctx.state.user;
        const book = new Book(ctx.request.body);
      
        try {
          book.save(async (err) => {
            if (err) throw err;
            const user = await User.findById(ctx.state.user._id).exec();
            console.log(book._id);
            await ctx.redirect('/books');
          });
        } catch (e) {
          ctx.throw(500, e);
        }
        console.log('저장 성공!');
        ctx.status = 200;
});    
// add book
// redirect posts (create)

book.patch('/:id', checkLoggedIn, async (ctx) => {
    const file = ctx.request.files;
      if(ctx.request.body.cover != undefined) // when user add a new pet image
        ctx.request.body.cover = fs.readFileSync(file.image.path);
      else{
        ctx.request.body.cover = ""
      }
      var book = ctx.request.body; //require books's _id
      try {
            const mybook = await Book.findOne({ _id: ctx.params.id });
            if(ctx.state.user._id == mybook.author){//작성한 사람이 맞을 때만
              await mybook.updateB(book);
              await ctx.redirect('/api/page/detail/'+ctx.params.id);
              ctx.status = 200;}
              else{
                console.log('작성자가 아니다. ');
                ctx.status = 400;
              }
            }
            catch (e) {
            ctx.throw(500, e);
          
            ctx.status = 400;
            ctx.body = {
              message: "작성자가 아닙니다. "   }
        }
});// modify book information
//update book rediret:"/books/"+ctx.params.id
//book.id params
book.delete('/:id',checkLoggedIn,async (ctx) => {
    let bookid =ctx.params.id;  
    try {

        //var foundB = await Book.findById(bookid).exec();
        //북작가에게서 책 정보 지우기
        var author = await User.findById(bookid);//북 작가.
        console.log(author);
        console.log(author.books);
        await User.delBook(ctx.state.user.email,bookid);
         //book에 있던 페이지 다 지우기 
        await Page.deleteMany({"pages":{$in:b.pages}});
       

        //최종 book지우기
        var b = await Book.deleteOne({_id:bookid});
    } catch (e) {
        if(e.name === 'CastError') {
            ctx.status = 400;
            return;
        }
    }
    console.log('delete success');
  ctx.body = {
    message: "Delete"
  }
});   // delete book
// params.id
//redirect('/books')<-index
book.get('/',async (ctx) => {
    try {
        const books = await Book.find({}).sort({createDate: -1}).exec();
        await ctx.render('books/index', {books:books});
          } catch (e) {
        return ctx.throw(500, e);
    }
    }
);
book.get('/search', async (ctx) => {
    const {filter, renewal} = ctx.query

    if(filter === "조회순") {  //조회순
        try {
            const books = await Book.find().sort({'views': -1}).skip(parseInt(renewal)*10).limit(10)
            let result = await bookInfo(books);
            ctx.status = 200;
            ctx.body = result;
        } catch (e) {
            ctx.throw(500, e);
        }
    }
});

book.get('/new', async (ctx) => {
  try{
  await ctx.render('books/new');
  }catch(e){
    ctx.throw(500, e);
  }
  });
//test용
  book.get('/booklist',async (ctx) => {
    try {
        const books = await Book.find({}).sort({createDate: -1}).exec();
        ctx.body = books;
          } catch (e) {
        return ctx.throw(500, e);
    }
    }
);

module.exports = book;