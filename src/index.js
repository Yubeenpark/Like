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
const app = new Koa();
const router = new Router()
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

var readFileThunk = function(src) {
  return new Promise(function (resolve, reject) {
    fs.readFile(src, {'encoding': 'utf8'}, function (err, data) {
      if(err) return reject(err);
      resolve(data);
    });
  });
}
//app.use(router.routes())
/*
app
  .use(router.routes())
  .use(router.allowedMethods());
  */
  app
  .use(jwtMiddleware)
  .use(bodyParser()) // bodyParser는 라우터 코드보다 상단에 있어야 합니다.
  .use(router.routes())
  .use(router.allowedMethods());
  

  
/*
router.get('/', (ctx, next) => {
  ctx.body = '루트 페이지 입니다.';
});
*/
/*
router.get('/', async (ctx, next) => {
    const rawContent = fs.readFileSync('index.html').toString('utf8')
    ctx.body = rawContent
})*/

router.get('/', function *(){
  this.body = yield readFileThunk(__dirname + '/public/index.html');
})
//router.use(api.routes());
//app.use(router.routes()).use(router.allowedMethods())
router.use('/api', api.routes());
app.use(router.routes()).use(router.allowedMethods());

http2
  .createSecureServer(options, app.callback())
  .listen(port, () => console.log("listening on port %i", port));
//app.listen(port, function () {
//console.log('server listening on port %d', port);
  //});



