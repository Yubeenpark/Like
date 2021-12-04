require('dotenv').config()
const Router = require("@koa/router");
const  authCtrl = require("./auth.ctrl");
const  checkLoggedIn = require("../../lib/checkLoggedIn");
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const auth = new Router();

//  회원가입- 로컬	이메일 인증번호 발송	POST	auth/signup/email/demand
// 회원가입	이메일 인증번호 확인	POST	auth/signup/email/verify
// 로그인	"소셜 로그인
// (페이스북 구글 네이버 카카오)"	POST	auth/signin/social
// 회원정보갱신	설문이나 설정에서 개인정보 바꾸면 적용	PATCH	auth/update/pet
// 회원정보갱신	설문이나 설정에서 개인정보 바꾸면 적용	PATCH	auth/update/user

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

auth.get('/favorite',checkLoggedIn, authCtrl.showFavorite); // show a list of user's favorites
auth.post('/favorite',checkLoggedIn, authCtrl.addFavorite); // add favorite
auth.delete('/favorite',checkLoggedIn, authCtrl.delFavorite);   // delete favorite

auth.post('/find/password', authCtrl.findPassword); // 비밀번호 찾기


module.exports =  auth;