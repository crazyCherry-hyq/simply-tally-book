'use strict';

const { setResponse } = require('../util/common');
const { httpCode } = require('../constant/httpCode');

module.exports = secret => {
  return async function jwtErr(ctx, next) {
    const token = ctx.request.header.authorization;
    let decode;
    if (token !== 'null' && token) {
      try {
        decode = ctx.app.jwt.verify(token, secret);
        await next();
      } catch (error) {
        console.log('error', error);
        setResponse(ctx, httpCode.UNAUTHORIZED, 'token已过期，请重新登录');
        return;
      }
    } else {
      setResponse(ctx, httpCode.UNAUTHORIZED, 'token不存在');
      return;
    }
  };
};
