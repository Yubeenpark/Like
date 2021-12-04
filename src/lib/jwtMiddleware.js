const jwt = require("jsonwebtoken");
const User = require("../models/user");
/*function generateToken(payload) {
  return new Promise((resolve, reject) => {
      jwt.sign(
          payload,
          jwtSecret,
          {
              expiresIn: '7d' // 토큰 유효기간 7일 설정
          }, (error, token) => {
              if (error) reject(error);
              resolve(token);
          }
      );
  }
  );
};


function decodeToken(token) {
    return new Promise(
        (resolve, reject) => {
            jwt.verify(token, jwtSecret, (error, decoded) => {
                if(error) reject(error);
                resolve(decoded);
            });
        }
    );
}


const jwtMiddleware = async (ctx, next) => {
  const token = ctx.cookies.get("access_token");
  if (!token) {
    return next();} //token이 없음
  try {
    const decoded = await decodeToken(token); // 토큰을 디코딩 합니다
    const user = await User.findById(decoded._id).exec();
    ctx.state.user = {
      _id: decoded._id,
      email: decoded.email
    };
    //특정 시간 남았으면 재발급
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp - now < 60 * 60 * 24 * 3.5) {
      const user = await User.findById(decoded._id);
      const token = user.generateToken();
      ctx.cookies.set("access_token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
        httpOnly: true
      });
    }
    ctx.request.user = decoded;
    return next();
  } catch (e) {
    //검증 실패
    return next();
  }
};
*/

const jwtMiddleware = async (ctx, next) => {
  const token = ctx.cookies.get("access_token");
  if (!token) {
    return next();} //token이 없음
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id).exec();
    ctx.state.user = {
      _id: decoded._id,
      email: decoded.email
    };
    //특정 시간 남았으면 재발급
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp - now < 60 * 60 * 24 * 3.5) {
      const user = await User.findById(decoded._id);
      const token = user.generateToken();
      ctx.cookies.set("access_token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
        httpOnly: true,
      });
    }

    return next();
  } catch (e) {
    //검증 실패
    return next();
  }
};

module.exports = jwtMiddleware;