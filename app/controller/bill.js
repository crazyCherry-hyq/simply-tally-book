'use strict';

const moment = require('moment');
const { setResponse } = require('../util/common');
const { httpCode } = require('../constant/httpCode');
const Controller = require('egg').Controller;

class BillController extends Controller {
  async add() {
    // 获取请求中携带的参数
    const { ctx, app } = this;
    const { amount, type_id, type_name, bill_date, pay_type, remark = '' } = ctx.request.body;

    // 判空处理
    if (!amount || !type_id || !type_name || !bill_date || !pay_type) {
      setResponse(ctx, httpCode.BAD_REQUEST, '参数错误');
    }

    try {
      const token = ctx.request.header.authorization;
      // 拿到token之后去获取用户信息
      const decode = app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      // user_id 默认添加到每个账单项，作为后续获取指定用户账单的标示。
      // 可以理解为，我登陆了A账单，那么所做的操作都得加上A账户的id，后续获取的时候，就过滤出A的账单
      await ctx.service.bill.add({
        amount,
        type_id,
        type_name,
        bill_date,
        pay_type,
        remark,
        user_id,
      });
      setResponse(ctx, httpCode.SUCCESS, '新增成功');
    } catch (error) {
      setResponse(ctx, httpCode.INTERNAL_SERVER_ERROR, '系统错误');
    }
  }
}

module.exports = BillController;
