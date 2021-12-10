const checkLoggedIn = (ctx, next) => {
    if (!ctx.state.user) {
      //debug
      
      console.log('checkLoggedin error');
      ctx.status = 401;
      return;
    }
    console.log('check login',ctx.state.user);
    console.log('cookcie',ctx.cookies.user);
    return next();
  };
  module.exports = checkLoggedIn;

  