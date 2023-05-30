'use strict';

function setResponse(ctx, code, msg, data = null) {
  ctx.status = code;
  ctx.body = {
    code,
    msg,
    data,
  };
}

module.exports = {
  setResponse,
};
