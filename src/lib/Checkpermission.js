  
  const User = require('../models/user')
  const checkPermission = (ctx, next) => {
    const user = User.findOne({username:ctx.params.username});
    if(user._id  != ctx.status.user._id)
      return util.noPermission(ctx);
     next();
  };
  module.exports = checkPermission;
