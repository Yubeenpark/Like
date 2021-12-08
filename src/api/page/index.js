const Router = require("@koa/router");
const  checkLoggedIn = require("../../lib/checkLoggedIn");
const  pageCtrl  = require("./page.ctrl");
const page = new Router();
const Page = require("../../models/page");
const index = require('../../../src/index');
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


 page.get('/', async (ctx) => {

  const page = await Page.find({}).sort({createDate:-1}).exec();
  console.log(page);
  await ctx.render('posts/index', {page});
  });


 page.get('/new', async (ctx) => {
    await ctx.render('posts/new');
  });

  // create
  page.post('/', async (ctx, next) => {
    await Page.create(ctx.body);
    ctx.redirect('/posts');
    });

  

  // show
  page.get('/:id', async (ctx, next) => {
    const page  = await Page.findOne({_id:ctx.params.id});
    console.log('찾은 페이지',page);
  ctx.render('posts/show', {page:page,user:ctx.state.user});
  });


// update
page.put('/:id', async (ctx, next) => {
    ctx.body.updatedAt = Date.now(); //2
    const page = await Page.findOneAndUpdate({_id:ctx.params.id}, ctx.body);
      ctx.redirect("/posts/"+ctx.params.id);
    });
  
  // destroy
  page.delete('/:id', async (ctx, next) => {
      try{
        await Page.deleteOne({_id:ctx.params.id})
        ctx.redirect('/posts');
          }catch(e){
            ctx.throw(500, e);
          }
    });
  
  

//page.post('/postinfo', pageCtrl.uploadInfo);
//page.get('/info',pageCtrl.getbyurl);//url로 recipe정보 가져오기 (flutter 내 레시피에서 쓰임.)
module.exports =  page;
