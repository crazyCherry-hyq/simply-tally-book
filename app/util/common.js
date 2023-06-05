'use strict';

const crypto = require('crypto');
const { httpCode } = require('../constant/httpCode');

function setResponse(ctx, code, msg, data = null) {
  ctx.status = code;
  ctx.body = {
    code,
    msg,
    data,
  };
}

// 处理发送接口响应的接口处理方式
function handleResponse(ctx, successStatus, message) {
  const code = successStatus ? httpCode.SUCCESS : httpCode.INTERNAL_SERVER_ERROR;
  setResponse(ctx, code, successStatus ? message : '报错啦');
}

function encryptPassword(password) {
  const md5 = crypto.createHash('md5');
  const encryptedPassword = md5.update(password).digest('hex');
  return encryptedPassword;
}

module.exports = {
  setResponse,
  handleResponse,
  encryptPassword,
};
