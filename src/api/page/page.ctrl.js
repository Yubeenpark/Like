const Page = require("../../models/page");
const User = require("../../models/user");
const Book = require("../../models/book");
const Joi = require('@hapi/joi');
const config = require('../../lib/config');
const { Mongoose } = require('mongoose');


exports.search = async (ctx) => {
    const { title } = ctx.query;   //search word
    console.log(title)
    try {
            var pages = await Page.findBySearchWord(title);
        ctx.status = 200;
        ctx.body = pages;
    } catch (e) {
        ctx.throw(500, e);
    }
    ctx.status = 200;
};


exports.detailPage = async (ctx) => {
  try{ 
  var ObjectId = require('mongodb').ObjectId; 
    var id = req.params.id;      
    var o_id = new ObjectId(id);
    const page = await db.Page.find({_id:o_id});
    await ctx.redirect('/api/page/detail/'+req.params.id);
    ctx.body = page;
    ctx.status = 200;
  }catch(e){
    ctx.throw(500,e);
  }

};

// parameters: array with book objects as elements
// return image, title and author of book DB information
//list에 보여질 정보 일부분
async function bookInfo (arr) {
    let result = []
    arr.map(obj => {
        temp = new Object();
        temp.image = obj.image;
        temp.title = obj.title;
        temp.author = obj.author;
        temp.views = obj.views;
        result.push(temp);
        delete temp;
    })
    return result;
}

async function pageInfo (arr) {
    let result = []
    arr.map(obj => {
        temp = new Object();
        temp.image = obj.image;
        temp.title = obj.title;
        temp.author = obj.author;
        temp.views = obj.views;
        result.push(temp);
        delete temp;
    })
    return result;
}




exports.scrollPage = async (ctx) => {
    //클라이언트에서 미리 요청하는 방법 사용하자

    //select: 조회순 or 추천순
    //renewal: 앱 화면 바닥에 도달한 횟수 (처음으로 데이터를 추가로 가져올때 1, 그다음 2 ...)
    const {filter, renewal} = ctx.query

    if(filter === "조회순") {  //조회순
        try {
            const pages = await Page.find().sort({'views': -1}).skip(parseInt(renewal)*10).limit(10)
            let result = await pageInfo(pages);
            ctx.status = 200;
            ctx.body = result;
        } catch (e) {
            ctx.throw(500, e);
        }
    }

    else if(filter === "추천순") { //추천순

    }
};

//pet
    exports.addPage = async (ctx) => {
      //const file = ctx.request.files; 
      // console.log("file\n", file)
      // console.log(file.image.path)
      //ctx.request.body.image = fs.readFileSync(file.image.path);
      if( ctx.request.files==undefined)
        console.log("파일없음");
      else
        ctx.request.body.cover = ""
      const {
        title,
        author,
        contents,
        cover,
        hashtag,
        book,
      } = ctx.request.body;
    
      const schema = Joi.object().keys({
        title: Joi.string().required(),
        author: Joi.string(),
        contents: Joi.string().required(),
        hashtag: Joi.string().allow(null, ''),
        cover: Joi.allow(null, ''),
        book: Joi.string().allow(null, ''),
      });

      
    //검증 결과
    try {
      await schema.validateAsync(ctx.request.body);
    } catch (err) {
      console.log('add page validaton' + err);
      ctx.status = 400;
      return;
    }
    ctx.request.body.author = ctx.state.user;
    const page = new Page(ctx.request.body);
  
    try {
      page.save(async (err, page) => {
        if (err) throw err;
        const user = await User.findById(ctx.state.user._id).exec();
        if(page.book!='')
        {
          const result = await Book.findOneAndUpdate({_id: page.book}, {$push: {pages: page._id}});
          console.log(result);
        }

      });
    } catch (e) {
      ctx.throw(500, e);
    }
    ctx.body = page;
    ctx.status = 200;
  };
  
  exports.updatePage = async (ctx) => {
    // validation추가 필요
    if(ctx.request.files != undefined) // when user add a new pet image
      ctx.request.body.image = fs.readFileSync(file.image.path);
    else
      ctx.request.body.image = ""
  
    var page = ctx.request.body; 
    try {
      const mypage = await Page.findOne({ _id: page._id });//require page's _id
      if(ctx.state.user._id == mypage.author){
        mypage.updateP(book);
        ctx.body = mypage;
        console.log(mypage);
        ctx.status = 200;}

      } catch (e) {
      ctx.throw(500, e);
      ctx.body = {
        message: "작성자가 아닙니다. "   }
  }

    ctx.status = 200;
  };

  
exports.deletePage = async (ctx) => {
  try {
      var b = await Page.find(ctx.params.id);
      await Page.deleteMany({"pages":{$in:b.pages}});
  } catch (e) {
      if(e.name === 'CastError') {
          ctx.status = 400;
          return;
      }
  }
  ctx.status = 204; // No Content
};
