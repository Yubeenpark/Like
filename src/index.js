const http2 = require('http2');
var fs = require('fs');
const api  = require('./api');
const Koa = require('koa');
const Router = require("koa-router");
const jwtMiddleware = require('./lib/jwtMiddleware');
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');
const port = process.env.PORT || 3000
//443
const passport = require('koa-passport')
const app = new Koa();
const router = new Router()
const render = require('koa-ejs');
const path = require('path');
//const User = require('../models/user');
//const views = require('koa-views');
const book = require('./routes/book');
const auth = require('./routes/user');
const page = require('./routes/page');

const send = require('koa-send');
var options = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.crt'),
  allowHTTP1: true
};
//app.use(express.static('images'))  

mongoose.Promise = global.Promise; // Node 의 네이티브 Promise 사용
// mongodb 연결
mongoose.connect(process.env.MONGO_URI).then(
    (response) => {
        console.log('Successfully connected to mongodb');
    }
).catch(e => {
    console.error(e);
});


//app.use(router.routes())
/*
app
  .use(router.routes())
  .use(router.allowedMethods());
  

  render(app, {
    root: path.join(__dirname, 'views'),
    layout: false,
    viewExt: 'ejs',
    cache: false,
    debug: true
  });
  */
//  app.use(async function (ctx) {
 //   await ctx.render('home/welcome');
 // });
 app
 .use(jwtMiddleware)
 .use(bodyParser()); // bodyParser는 라우터 코드보다 상단에 있어야 합니다.

 render(app, {
  root: path.join(__dirname, 'views'),
  layout: false,
  viewExt: 'ejs',
  cache: false,
  debug: true
});

app
.use(router.routes())
.use(router.allowedMethods())
.use(passport.initialize());

 // .use(views(path.join(__dirname, 'views'), {
  //extension: 'ejs'
//}))

 //.use(views('views', { map: { html: 'ejs' } }));
 router.get('/', async ctx =>{
  await ctx.render('home/welcome');
});

router.get('/about', async ctx =>{
   ctx.render('home/about');
});
router.get('/auth', async ctx =>{
  ctx.render('users/login');
});

//router.use('/', api.routes());
//router.use("/book", require("./routes/book"));
//router.use("/page", require("./routes/page"));
//router.use("/auth", require("./routes/user"));
router.use('/auth', auth.routes());
router.use('/book', book.routes());
router.use('/page', page.routes());
app.use(router.routes()).use(router.allowedMethods());
  



//router.get('/', async (ctx, next) => {
  //  const rawContent = fs.readFileSync('index.html').toString('utf8')
    //ctx.body = rawContent
//})


//router.use(api.routes());
//app.use(router.routes()).use(router.allowedMethods())

//app.use(router.routes()).use(router.allowedMethods());


http2
  .createSecureServer(options, app.callback())
  .listen(port, () => console.log("listening on port %i", port));

 /*
  app.listen(port, function () {
console.log('server listening on port %d', port);
  });
*/

  