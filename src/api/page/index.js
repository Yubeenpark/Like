const Router = require("@koa/router");
const  checkLoggedIn = require("../../lib/checkLoggedIn");
const  pageCtrl  = require("./page.ctrl");
const page = new Router();

//Page api
page.get('/',pageCtrl.getPage);    // show a list of user's pages
page.post('/',checkLoggedIn,pageCtrl.addPage);    // add page
page.patch('/', checkLoggedIn,pageCtrl.updatePage);  // modify page information
page.delete('/',checkLoggedIn,pageCtrl.deletePage);   // delete book

page.get('/search', pageCtrl.search); //  /search?title=search_query&petType=petType
//page.post('/search/filter', pageCtrl.searchFilter);   //아직 구현 안함
page.post('/detail', pageCtrl.detailPage);    // detail recipe page

//page.get('/recipe/slide', pageCtrl.slidRecipe);   // 5 recommended videos in main page

//   /recipe/scroll?filter=filter_query&renewal=count (filter_query: 추천순 or 조회순)
page.get('/recipe/scroll', pageCtrl.scrollPage);    // video list sorted by 추천순 or 조회순 in main page

//page.post('/postinfo', pageCtrl.uploadInfo);
//page.get('/info',pageCtrl.getbyurl);//url로 recipe정보 가져오기 (flutter 내 레시피에서 쓰임.)
module.exports =  page;