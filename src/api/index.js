const Router = require("koa-router");
const page = require("./page");
const auth = require("./auth");
const book = require("./book");
const api = new Router();

api.use("/auth", auth.routes());
api.use("/book", book.routes());
api.use("/page", page.routes());

api.get('/test', (ctx) => (ctx.body = 'hi'));
module.exports = api;

