require('dotenv').config()
const Router = require("@koa/router");
//const  authCtrl = require("auth.ctrl");
const  checkLoggedIn = require("../../src/lib/checkLoggedIn");
//var passport = require('passport');
const User = require("../models/user");
//var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const auth = new Router();

//  회원가입- 로컬	이메일 인증번호 발송	POST	auth/signup/email/demand
// 회원가입	이메일 인증번호 확인	POST	auth/signup/email/verify
// 로그인	"소셜 로그인
// (페이스북 구글 네이버 카카오)"	POST	auth/signin/social
// 회원정보갱신	설문이나 설정에서 개인정보 바꾸면 적용	PATCH	auth/update/pet
// 회원정보갱신	설문이나 설정에서 개인정보 바꾸면 적용	PATCH	auth/update/user
/*
auth.get('/userlist', authCtrl.userlist);
auth.get('/test', authCtrl.test);
auth.post('/signup', authCtrl.signupLocal);
auth.post('/signin', authCtrl.signinLocal);
auth.get('/signout',checkLoggedIn, authCtrl.signout);
auth.get('/check', authCtrl.check2);
auth.delete('/user',checkLoggedIn,authCtrl.Withdrawal); // 회원 탈퇴
auth.post('/validate', authCtrl.exists);
auth.post('/checkpassword', authCtrl.checkPassword);
auth.get('/book',checkLoggedIn,authCtrl.getUserBook);
auth.get('/user', checkLoggedIn,authCtrl.userinfo); // show user information
auth.patch('/user', checkLoggedIn, authCtrl.updateUser);    // modify user information
auth.patch('/user/password', authCtrl.changePassword);    // change password
auth.post('/find/password', authCtrl.findPassword); // 비밀번호 찾기
auth.get('/favorite',checkLoggedIn, authCtrl.showFavorite); // show a list of user's favorites
auth.post('/favorite',checkLoggedIn, authCtrl.addFavorite); // add favorite
auth.delete('/favorite',checkLoggedIn, authCtrl.delFavorite);   // delete favorite

auth.post('/find/password', authCtrl.findPassword); // 비밀번호 찾기
*/
auth.get('/new', async (ctx) => {
    ctx.render('users/new');
        });

auth.get('/test', async (ctx) => {
    ctx.render('users/login');
        });


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
      ctx.status = 401; //Unauthorized
      errors= '비밀번호, 이메일 중 하나가 틀렸습니다. '
      return;
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
    ctx.cookies.set('access_token', token, { maxAge: 1000 * 60 * 60 * 24 * 7 ,httpOnly: true,});
    console.log('set cookie ok');

    // 응답할 데이터에서 hashedPassword 필드 제거
    ctx.status = 200;
    await ctx.render('users/new');
  } catch (e) {
    ctx.throw(500, e);
  }});
  
  // update // 2
  auth.post('/:id', async (ctx) => {
    await User.findOne({username:ctx.params.username}).select('password').exec();

  
        // update user object
        user.originalPassword = user.password;
        user.password = ctx.body.newPassword? ctx.body.newPassword : user.password; // 2-3
        for(var p in ctx.body) // 2-4
          user[p] = ctx.body[p];
        
  
        // save updated user
        await user.save();

        ctx.redirect('/users/'+user.nickname);
    });

  
  // destroy
  auth.get('/logout', async (ctx) => {
    ctx.cookies.set('access_token');
    ctx.status = 204;
    ctx.redirect('/');
  });
  
  
module.exports =  auth;

function checkPermission(ctx, next){
    User.findOne({username:ctx.params.username}, function(err, user){
     if(err) return res.json(err);
     if(user.id != req.user.id) return util.noPermission(ctx);
   
     next();
    });
   }