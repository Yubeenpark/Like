const Page = require("../../models/page");
const User = require("../../models/user");
const Book = require("../../models/book");
const Joi = require('@hapi/joi');
const config = require('../../lib/config');
const { Mongoose } = require('mongoose');
exports.booklist = async (ctx) => {
  let user;

    try {
        book = await Book.find()
            .sort({createDate: -1})
            .exec();
            await ctx.render('books/index', {book:book});
    } catch (e) {
        return ctx.throw(500, e);
    console.log('get /book/booklist');
  }
}


exports.addBook = async (ctx) => {
    //const file = ctx.request.files; 
    // console.log("file\n", file)
    // console.log(file.image.path)
    //ctx.request.body.image = fs.readFileSync(file.image.path);

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
          ctx.redirect('/books');
        });
      } catch (e) {
        ctx.throw(500, e);
      }
      console.log('저장 성공!');
      ctx.status = 200;
};

exports.getOneBook = async (ctx) => {

  const bookid = ctx.request.body._id;
  console.log(bookid);
    try {
      const mybook = await Book.findById(bookid).exec();
      const user = await User.findById(mybook.author).exec();//작가정보
      const author_name = user.nickname;
      const bookInfo = {
        "author_name":author_name
      }
      ctx.body = {mybook,author_name:author_name}
      console.log(mybook)
      //ctx.body.authorname = user.nickname;
      //ctx.body = mybook;
    } catch (e) {
      ctx.throw(500, e);
    }
      //const user = await User.findById(mybook.author).exec();
    //ctx.body = mybook;

    
};



exports.updateBook = async (ctx) => {
    // validation추가 필요
    const file = ctx.request.files;
    if(ctx.request.body.cover != undefined) // when user add a new pet image
      ctx.request.body.cover = fs.readFileSync(file.image.path);
    else
      ctx.request.body.cover = ""
    var book = ctx.request.body; //require books's _id
    try {
          const mybook = await Book.findOne({ _id: book._id });
          if(ctx.state.user._id == mybook.author){
            mybook.updateB(book);
            ctx.body = book._id;
            ctx.status = 200;}

          }
         catch (e) {
          ctx.throw(500, e);
        
          ctx.status = 400;
          ctx.body = {
            message: "작성자가 아닙니다. "   }
      }
  };



exports.deleteBook = async (ctx) => {

  let bookid = ctx.query.id;
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
};

exports.detailBook = async (ctx) => {
  try{ 
    var id = ctx.params.id;      
    const book = await dBook.find({_id:id});
    ctx.render('books/show', {book:book});
    ctx.status = 200;
  } catch (e) {
    ctx.status = 400;
    console.log('북 삭제 오류');
  }
    
  
};

exports.scrollBook = async (ctx) => {
  //클라이언트에서 미리 요청하는 방법 사용하자

  //select: 조회순 or 추천순
  //renewal: 앱 화면 바닥에 도달한 횟수 (처음으로 데이터를 추가로 가져올때 1, 그다음 2 ...)
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
};
