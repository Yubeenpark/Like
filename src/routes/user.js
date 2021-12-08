require('dotenv').config()
const Router = require("@koa/router");
//const  authCtrl = require("auth.ctrl");
const  checkLoggedIn = require("../../src/lib/checkLoggedIn");
//var passport = require('passport');
const User = require("../models/user");
//var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const auth = new Router();
const nodemailer = require('nodemailer');
const config = require('../lib/config');
const Joi = require('@hapi/joi');
/*

*/


// show
/*
auth.get('/:id', async (ctx) => {
    try{
      const user = await User.findOne({_id:ctx.params._id});
    ctx.render('users/show', {user});
    }catch(e){
      ctx.throw(500, e);
      console.log(e);  }

    });
*/
auth.get('/login', async (ctx) => {

  await ctx.render('home/login')
});

 
auth.get('/new', async (ctx) => {
  try{
  await ctx.render('users/new');
  }catch(e){
    console.log(e);
  }
      });

  // edit
  auth.get('/:id/edit', async (ctx) => {
    const user = await User.find({email:ctx.params.email}).exec();
    ctx.render('users/edit', {user:user});
    });


  auth.post('/login',async(ctx) =>{
    const { email, password } = ctx.request.body;
    const errors ='';
    //handle error
    if (!email || !password) {
       //Unauthorized
      alert( '비밀번호, 이메일 중 하나가 틀렸습니다. ');
      await ctx.redirect('/auth/login');
    }
    try {
      //const user = User.findOne({ email: email });
      const user = await User.findByEmail(email);
      //계정없으면 에러처리
      console.log(user);
      if (!user) {
        ctx.status = 401;
        return;
      }
  
      const valid = await user.checkPassword(password);
      if (!valid) {
        ctx.status = 401;
        return;
      }
      ctx.body = await user.serialize();
      const token = user.generateToken();
      ctx.cookies.set('access_token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
        httpOnly: false,
      });
      ctx.status = 200;
      ctx.state.user = user;
      ctx.redirect('/page');
      console.log('토큰나옴, 로그인');
    } catch (e) {
      ctx.throw(500, e);
      ctx.redirect('/')
    }
    
  });
  
  auth.post('/signup',async(ctx)=>{const { email, password, address } = ctx.request.body;
  console.log(ctx.request.body);
  const schema = Joi.object().keys({
    email: Joi.string().min(3).required(),
    password: Joi.string().required(),
    phone: Joi.string().allow(null, ''),
    nickname:Joi.string().allow(null, '')
  });

  //검증 결과
  try {
    const value = await schema.validateAsync(ctx.request.body);
  } catch (err) {
    console.log(err);
    ctx.status = 400;
    return;
  }

  try {
    // email 이미 존재하는지 확인
    const exists = await User.findByEmail(email);
    if (exists) {
      ctx.status = 409; // Conflict
      return;
    }

    let account = null;
    try {
        account = await User.localRegister(ctx.request.body);
    } catch (e) {
        ctx.throw(500, e);
    }

    let token = null;
    try {
        token = await account.generateToken();
        console.log('token ok');
    } catch (e) {
        ctx.throw(500, e);
    }
    await ctx.cookies.set('access_token', token, { maxAge: 1000 * 60 * 60 * 24 * 7 ,httpOnly: true,});
    console.log('set cookie ok');

    // 응답할 데이터에서 hashedPassword 필드 제거
    ctx.status = 200;
    await ctx.render('users/show');
  } catch (e) {
    ctx.throw(500, e);
  }});
  
  // update // 2
  auth.patch('/:id', async (ctx) => {
    const schema = Joi.object().keys({
      // password: Joi.string().min(6).max(20).required(),
      username: Joi.string().allow(null, ''),
      phone: Joi.string().allow(null, ''),
      nickname: Joi.string().allow(null, ''),
      fcmToken: Joi.string(),
      // birth: Joi.date()
    });
    
    try {
      const value = await schema.validateAsync(ctx.request.body);
    } catch (err) {
      console.log(err);
      ctx.status = 400;
      return;
    }
  
    ctx.request.body.email = ctx.state.user.email;
  
    try {
      await User.updateUser(ctx.request.body);
    } catch (e) {
      ctx.throw(500, e);
    }
    ctx.status = 200;
    await ctx.redirect('/users/'+user.nickname);
    });

  
  // destroy
  auth.get('/logout', async (ctx) => {
    await ctx.cookies.set('access_token');
     ctx.status = 204;
    await ctx.redirect('/');
  });

  function getRandomInt(min, max) { //min ~ max 사이의 임의의 정수 반환
    return Math.floor(Math.random() * (max - min)) + min;
}


 

  auth.post('/findPassword', async (ctx) => {
    var status = 400;

    // 전송 옵션 설정
    // trainsporter: is going to be an object that is able to send mail
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      // port: 587,
      port: 465,
      secure: true,
      auth: {
        user: config.mailer.user, //gmail주소입력
        pass: config.mailer.password, //gmail패스워드 입력
      },
    });
    var numsend = getRandomInt(100000,999999);
    var mailOptions = {
      from: `"Like project"<${config.mailer.user}>`, //enter the send's name and email
      to: ctx.request.body.email, // recipient's email
      subject: 'Like password', // title of mail
      html: `안녕하세요, 글을 나누는 즐거움 Like 입니다.
                <br />
                인증번호는 다음과 같습니다. (임시)
                <br />
                ${numsend}`,
    };
  
    try {
      await transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
          ctx.status = 401;
          return;
        } else {
          console.log('Email sent: ' + info.response);
          ctx.body = { success: true };
          status = 200;
        }
      });
    } catch (e) {
      ctx.throw(500, e);
    }
    ctx.status = 200;
  });
  
module.exports =  auth;

function checkPermission(ctx, next){
    User.findOne({username:ctx.params.username}, function(err, user){
     if(err) return res.json(err);
     if(user.id != req.user.id) return util.noPermission(ctx);
   
     next();
    });
   }