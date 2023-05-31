'use strict';

const crypto = require('crypto');

function setResponse(ctx, code, msg, data = null) {
  ctx.status = code;
  ctx.body = {
    code,
    msg,
    data,
  };
}

function encryptPassword(password) {
  const md5 = crypto.createHash('md5');
  const encryptedPassword = md5.update(password).digest('hex');
  return encryptedPassword;
}

module.exports = {
  setResponse,
  encryptPassword,
};
