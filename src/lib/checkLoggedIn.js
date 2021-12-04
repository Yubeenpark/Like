const checkLoggedIn = (ctx, next) => {
    if (!ctx.state.user) {
      //debug
      console.log('checkLoggedin error');
      ctx.status = 401;
      return;
    }
    return next();
  };
  module.exports = checkLoggedIn;

  