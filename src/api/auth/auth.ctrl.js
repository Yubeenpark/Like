const Joi = require('@hapi/joi');
const User = require('../../models/user');
const Book = require('../../models/book');
const Page = require('../../models/page');
const nodemailer = require('nodemailer');
const config = require('../../lib/config');
const { Mongoose } = require('mongoose');
const { exist, allow } = require('@hapi/joi');
const fs = require('fs');
exports.test = async (ctx) => {
  console.log('cookie');
  ctx.cookies.set('second', 22222, {
    httpOnly: false
  })
  ctx.body = {code: 200, message: 'success'}
};

exports.signupLocal = async (ctx) => {
  const { email, password, address } = ctx.request.body;
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
    ctx.body = await account.serialize();
  } catch (e) {
    ctx.throw(500, e);
  }
};
exports.signinLocal = async (ctx) => {
  // 로그인
  const { email, password } = ctx.request.body;

  //handle error
  if (!email || !password) {
    ctx.status = 401; //Unauthorized
    return;
  }
  try {
    const user = await User.findOne({ email: email });
    //const user = await User.findByEmail(email);
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
    console.log('토큰나옴');
  } catch (e) {
    ctx.throw(500, e);
  }
};


/*
exports.localLogin = async (ctx) => {
  // 데이터 검증
  const schema = Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required()
  });

  const result = Joi.validate(ctx.request.body, schema);

  if (result.error) {
      ctx.status = 400; // Bad Request
      return;
  }

  const { email, password } = ctx.request.body;

  let account = null;
  try {
      // 이메일로 계정 찾기
      account = await User.findByEmail(email);
  }
  catch (e) {
      ctx.throw(500, e);
  }

  if (!account || !account.checkPassword(password)) {
      // 유저가 존재하지 않거나 || 비밀번호가 일치하지 않으면
      ctx.status = 403; // Forbidden
      return;
  }

  let token = null;
  try {
      token = await account.generateToken();
  } catch (e) {
      ctx.throw(500, e);
  }

  ctx.cookies.set('access_token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
  ctx.body = account.email;
};*/
exports.userlist = async (ctx) => {
  let user;

    try {
        user = await User.find()
            .sort({created: -1})
            .exec();
    } catch (e) {
        return ctx.throw(500, e);
    }

    ctx.body = user;
}

exports.exists = async (ctx) => {
  const { email } = ctx.request.body;
  
  try {
    const exists = await User.findByEmail(email);
    if (exists) {
      ctx.status = 409; 
      return;
    }
    ctx.status = 200;
  } catch (e) {
    ctx.throw(500, e);
  }
};

exports.checkPassword = async (ctx) => {
  const { email, password } = ctx.request.body;
  
  try {
    const user = await User.findOne({ email: email });
    const valid = await user.checkPassword(password);
    if (valid) {
      ctx.status = 200;
      console.log("Check password success");
      return;
    } else if(!valid){
      ctx.status = 401;
      console.log("Check password fail");
      return;
    }
  } catch (e) {
    ctx.throw(500, e);
  }
};
//회원가입
exports.signup = async (ctx) => {
  const { email, password, phone, fcmToken } = ctx.request.body;
  const schema = Joi.object().keys({
    email: Joi.string().min(3).required(),
    password: Joi.string().required().min(6),
    phone: Joi.string().allow(null, ''),
    fcmToken: Joi.string().allow(null, ''),
    nickname:Joi.string().allow(null, '')
  });

  let value= null;
  try {
    value = await schema.validateAsync(ctx.request.body);
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
      ctx.body = {
        key: exists.email === ctx.request.body.email ? 'email' : 'username'
    };
      return;
    }
  }catch(e)
  {
    ctx.throw(500, e);
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

   // const user = new User(ctx.request.body);
    console.log(ctx.cookies);
    ctx.status = 200;
};

exports.signin = async (ctx) => {
  // 로그인
  const { email, password } = ctx.request.body;

  //handle error
  if (!email || !password) {
    ctx.status = 401; //Unauthorized
    return;
  }
  let user = null;
  try {
    user = await User.findOne({ email: email });
    //const user = await User.findByEmail(email);
    //계정없으면 에러처리
    if (!user) {
      ctx.status = 401;
      return;
    }
  } catch (e) {
    ctx.throw(500, e);
  }
    const valid = await user.checkPassword(password);
    if (!valid) {
      ctx.status = 401;
      return;
    }
    console.log(user);
    console.log('check password');
    let token = null;
    try{
      token = await user.generateToken();
    }catch (e) {
    ctx.throw(500, e);
  }
    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      httpOnly: true,
    });
    console.log('login cookie');
    
    ctx.status = 200;
    console.log('200');
};

exports.check = async (ctx) => {
  const { user } = ctx.state;
  if (!user) {
    ctx.status = 401;
    return;
  }
  ctx.body = user;
  // 로그인 상태 확인
};
exports.check2 = (ctx) => {
  const { user } = ctx.request;

  if(!user) {
      ctx.status = 403; // Forbidden
      return;
  }

  ctx.body = user.profile;
};



exports.signout = async (ctx) => {
  ctx.cookies.set('access_token');
  ctx.status = 204;
};

exports.Withdrawal = async (ctx) => {
    try {
      ctx.cookies.set('access_token');
      await Book. //delete pets owned by user
      User.deleteOne({ email: ctx.state.user.email }, function (err) {}); //delete user
    } catch (err) {
      ctx.throw(500, e);
    }
  
  ctx.status = 200;
};

exports.userinfo = async (ctx) => {
  const { _id } = ctx.state.user;
  try {
    const user = await User.findById(_id).exec();
    ctx.status = 200;
    ctx.body = await user.serialize();
  } catch (e) {
    ctx.throw(500, e);
  }
};

exports.updateUser = async (ctx) => {
  // 이메일 변경 불가
  // 비밀번호 변경은 따로
  //책과 게시글은 따로
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
    User.updateUser(ctx.request.body);
  } catch (e) {
    ctx.throw(500, e);
  }
  ctx.status = 200;
};

exports.changePassword = async (ctx) => {
  const schema = Joi.object().keys({
    email: Joi.string(),
    password: Joi.string().min(6).max(20).required(),
  });

  try {
    const value = await schema.validateAsync(ctx.request.body);
  } catch (err) {
    ctx.status = 400;
    return;
  }
  User.updatePassword(ctx.request.body.email, ctx.request.body.password);
  ctx.status = 200;
  ctx.body = { message: '비밀번호 변경 완료' };
};

exports.findPassword = async (ctx) => {
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

  var mailOptions = {
    from: `"Like project"<${config.mailer.user}>`, //enter the send's name and email
    to: ctx.request.body.email, // recipient's email
    subject: 'Like password', // title of mail
    html: `안녕하세요, 글을 나누는 즐거움 Like 입니다.
              <br />
              인증번호는 다음과 같습니다.
              <br />
              ${ctx.request.body.numsend}`,
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

};

//favorite(즐겨찾기)
exports.addFavorite = async (ctx) => {
  id = ctx.request.body.contentsid;
  try {
    await User.updateFavorite(ctx.state.user.email, id);
  } catch (e) {
    console.log(e);
  }

  ctx.status = 200;
};

exports.delFavorite = async (ctx) => {
  try {
    await User.delFavorites(ctx.state.user.email, ctx.query.contentsid);
  } catch (e) {
    ctx.throw(500, e);
  }
  ctx.status = 200;
};

exports.showFavorite = async (ctx) => {
  try {
    const user = await User.findById(ctx.state.user._id).exec();
    //url, title, image
    const favbooks = await Book.find({_id:{$in:user.favorite}});
    ctx.status = 200;
    ctx.body = favbooks;
  } catch (e) {
    ctx.throw(500, e);
  }
};


exports.getUserBook = async (ctx) => {
  const user = await User.findById(ctx.state.user._id).exec();
    try {
      const mybook = await Book.find({_id:{$in:user.books}});
      ctx.body = mybook;
    } catch (e) {
      ctx.throw(500, e);
    }
      //const user = await User.findById(mybook.author).exec();

    
};