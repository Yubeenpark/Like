const Router = require("@koa/router");
const  checkLoggedIn = require("../../src/lib/checkLoggedIn");
// const  pageCtrl  = require("./page.ctrl");
const Joi = require('@hapi/joi');
const page = new Router();
const Page = require("../models/page");
const User = require("../models/user");
//const index = require('../../../src/index');
//const render = require('koa-ejs');
//Page api

/*
page.get('/',pageCtrl.getPage);    // show a list of user's pages
page.post('/',checkLoggedIn,pageCtrl.addPage);    // add page
page.patch('/', checkLoggedIn,pageCtrl.updatePage);  // modify page information
page.delete('/',checkLoggedIn,pageCtrl.deletePage);   // delete book

page.get('/search', pageCtrl.search); //  /search?title=search_query&petType=petType
//page.post('/search/filter', pageCtrl.searchFilter);   //아직 구현 안함
page.post('/:id', pageCtrl.detailPage);    // detail recipe page

//page.get('/recipe/slide', pageCtrl.slidRecipe);   // 5 recommended videos in main page

//   /recipe/scroll?filter=filter_query&renewal=count (filter_query: 추천순 or 조회순)
page.get('/recipe/scroll', pageCtrl.scrollPage);    // video list sorted by 추천순 or 조회순 in main page
*/
//For test
page.get('/pagelist', async (ctx) => {

  try{
    const page = await Page.find({}).sort({createDate:-1}).exec();
  ctx.body = page;
  }catch(e){
    ctx.throw(500, e);
  }
  });



 page.get('/', async (ctx) => {

  try{
    const page = await Page.find({}).sort({createDate:-1}).exec();
  console.log(page);
  await ctx.render('posts/index', {page});
  }catch(e){
    ctx.throw(500, e);
  }
  });


 page.get('/new', async (ctx) => {
   try{
    await ctx.render('posts/new');
   }catch(e){
    ctx.throw(500, e);
   }
  });

  // create
  page.put('/', checkLoggedIn, async (ctx, next) => {
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
          await ctx.redirect('/page');
        });
      } catch (e) {
        ctx.throw(500, e);
      }
      console.log('저장 성공!');
      ctx.status = 200;
      
      await ctx.redirect('/page');
    });

  

  // show
  page.get('/:id', async (ctx, next) => {
    try{ 
        var id = ctx.params.id;      
        const page = await Page.findById(id).exec();
        const user = await User.findById(page.author).exec();
        await ctx.render('posts/show', {page:page,user:user});
        ctx.status = 200;
      }catch(e){
        ctx.throw(500,e);
      }


  });


// update
page.patch('/:id',checkLoggedIn, async (ctx, next) => {
  const id = ctx.params.id;
  if(ctx.request.files != undefined) // when user add a new pet image
      ctx.request.body.image = fs.readFileSync(file.image.path);
    else
      ctx.request.body.image = ""
      ctx.body.updateDate = Date.now();
    var page = ctx.request.body; 
    try {
      const mypage = await Page.findOne({ _id: id });//require page's _id
      if(ctx.state.user._id == mypage.author){
        await mypage.updateP(page);
        
        console.log(mypage);
        await ctx.redirect("/page/"+id);
        ctx.status = 200;}

      } catch (e) {
      ctx.throw(500, e);
      ctx.body = {
        message: "작성자가 아닙니다. "   }
  }
    });
  
  // destroy
  page.delete('/:id', async (ctx, next) => {
      try{
        const page = await Page.deleteOne({_id:ctx.params.id})
        //await ctx.redirect('/page');
          }catch(e){
            ctx.throw(500, e);
          }
    });
  
  

//page.post('/postinfo', pageCtrl.uploadInfo);
//page.get('/info',pageCtrl.getbyurl);//url로 recipe정보 가져오기 (flutter 내 레시피에서 쓰임.)
module.exports =  page;
