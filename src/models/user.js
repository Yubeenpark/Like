var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
//const Pet = require("./pet");

const UserSchema = new Schema({
    //login require
    //email == id
    email: { type: String, required: true, unique: true },
    password: String,
    token: String,
    //user info
    username: String,
    phone: {type: String, require: true},
    nickname: {type: String, default: ""},
    books: [{type: String}],//array of bookid
    favorite: [{ type: String }],//String of url(book, page)
  });
  
  
function hash(password) {
    return crypto.createHmac('sha256', process.env.SECRET_KEY).update(password).digest('hex');
}
UserSchema.statics.localRegister = function ({ nickname,phone, email, password }) {
  const user = new this({
    phone,
    email,
    password: hash(password),
    nickname
  });

  return user.save();
};
  //User 모델에 정보를 save하기 전에 실행
  /*
UserSchema.pre('save', function( next ){
    var user = this;
  
    //비밀번호를 바꿀때만 비밀번호를 암호화해준다
    if (user.isModified('password')) {
      // 비밀번호를 암호화 시킨다
      bcrypt.hash(user.password, 10, function (err, hash) {   //hash: 암호화된 비밀번호
        if (err) return next(err);
        user.password = hash();
        next();
      });
  
    } else {
      next();
    }
  });
  
*/
  // parameters: login user email, new password to change
UserSchema.statics.updatePassword = async function (email, password) {
    const hash = await hash(password);
    this.findOneAndUpdate({email: email} , {$set: {password: hash}}, function(err, user) {
      if(err) throw err;
      console.log(user)
    })
  
    console.log("hash", hash);
  };

  UserSchema.methods.generateToken = function () {
    const token = jwt.sign(
      // 첫번째 파라미터엔 토큰 안에 집어넣고 싶은 데이터를 넣습니다
      {
        _id: this.id,
        email: this.email,
      },
      process.env.JWT_SECRET, // 두번째 파라미터에는 JWT 암호를 넣습니다
      {
        expiresIn: "7d", // 7일동안 유효함
      }
    );
    return token;
  };

  
UserSchema.statics.updateFcm = async function (email, fcm){
    this.findOneAndUpdate({email: email}, {$set: {fcmToken: fcm}}, function(err,user){
      if(err) throw err;
      //console.log(user);
    })
  };
  
  //응답하는 JSON에서 비밀번호 정보 삭제
  UserSchema.methods.serialize = async function () {
    const data = this.toJSON();
    delete data.password;
    delete data._id;
    return data;
  };
  
  
  UserSchema.methods.checkPassword = async function (password) {
    const hashed = hash(password);
    return this.password === hashed; 
  };
  
  //static method
  UserSchema.statics.findByEmail = async function (email) {
    return this.findOne({ email: email, logintype: "local" });
  };

  
  // parameters: user information to be updated
  UserSchema.statics.updateUser = async function (user) {
    this.findOneAndUpdate({ email: user.email }, { $set: user },
      function (err, result) {
        if (err) throw err;
        return result;
      });
  };
  
  // parameters: book's object id
  UserSchema.methods.addBook = async function (bookId) {
    console.log(bookId);
    this.books.push(bookId);
    this.save();
  }

//parameters: login user email, pet's object id
UserSchema.statics.delBook = async function (email, bookId) {
  return this.findOneAndUpdate({email: email}, {$pull: {books: bookId}});
}

// parameters: login user email, url of the book or page
UserSchema.statics.updateFavorite = async function (email, contentsID) {
  return this.findOneAndUpdate(
    {
      email: email,
    },
    { $addToSet: { favorite: contentsID } } 
  );
};

// parameters: login user email, url of the book or page
UserSchema.statics.delFavorites = async function (email, contentsID) {
  return this.findOneAndUpdate(
    {
      email: email,
    },
    { $pull: { favorite: contentsID } }
  ); 
};

UserSchema.statics.showFavorites = async function (email) {
  this.books
  return (
    {
      email: email,
    },
    { $pull: { favorite: contentsID } }
  ); 
};
  
module.exports = mongoose.model("User", UserSchema, "Users");