'use strict';
const { setResponse } = require('../util/common');
const { httpCode } = require('../constant/httpCode');
const Controller = require('egg').Controller;
const defaultAvatar = 'http://s.yezgea02.com/1615973940679/WeChat77d6d2ac093e247c361f0b8a7aeb6c2a.png'; // 默认头像

class UserController extends Controller {
  async register() {
    const { ctx } = this;
    const { username, password } = ctx.request.body; // 获取注册需要的参数

    if (!username || !password) {
      setResponse(ctx, httpCode.SUCCESS, '账号密码不能为空');
      return;
    }

    // 判断名字是否存在重复
    const userInfo = await ctx.service.user.getUserByName(username);
    if (userInfo && userInfo.id) {
      setResponse(ctx, httpCode.INTERNAL_SERVER_ERROR, '账户名已被注册，请重新输入');
    } else {
      const result = await ctx.service.user.register({
        username,
        password,
        signature: '嘿嘿',
        avatar: defaultAvatar,
      });
      setResponse(ctx, result ? httpCode.SUCCESS : httpCode.INTERNAL_SERVER_ERROR, `注册${result ? '成功' : '失败'}`);
    }
  }
}

module.exports = UserController;
