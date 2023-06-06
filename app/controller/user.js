'use strict';
const { setResponse, encryptPassword } = require('../util/common');
const { httpCode } = require('../constant/httpCode');
const Controller = require('egg').Controller;
const defaultAvatar = 'http://s.yezgea02.com/1615973940679/WeChat77d6d2ac093e247c361f0b8a7aeb6c2a.png'; // 默认头像

class UserController extends Controller {
  // 用户注册
  async register() {
    const { ctx } = this;
    const { username, password } = ctx.request.body; // 获取注册需要的参数

    if (!username || !password) {
      setResponse(ctx, httpCode.SUCCESS, '账号密码不能为空');
      return;
    }

    // 根据用户名，在数据库查找相对应的id操作
    const userInfo = await ctx.service.user.getUserByName(username);
    if (userInfo && userInfo.id) {
      setResponse(ctx, httpCode.INTERNAL_SERVER_ERROR, '账户名已被注册，请重新输入');
    } else {
      const encryptedPassword = encryptPassword(password);
      const result = await ctx.service.user.register({
        username,
        password: encryptedPassword,
        signature: '嘿嘿',
        avatar: defaultAvatar,
      });
      setResponse(ctx, result ? httpCode.SUCCESS : httpCode.INTERNAL_SERVER_ERROR, `注册${result ? '成功' : '失败'}`);
    }
  }

  // 用户登录
  async login() {
    // app 为全局属性，相当于所有的插件方法都植入到了 app 对象
    const { ctx, app } = this;
    const { username, password } = ctx.request.body;
    // 根据用户名，在数据库查找相对应的id操作
    const userInfo = await ctx.service.user.getUserByName(username);
    if (!userInfo || !userInfo.id) {
      setResponse(ctx, httpCode.INTERNAL_SERVER_ERROR, '账号不存在');
      return;
    }

    if (userInfo && password !== userInfo.password) {
      setResponse(ctx, httpCode.INTERNAL_SERVER_ERROR, '账号密码错误');
      return;
    }

    const token = app.jwt.sign({
      id: userInfo.id,
      username: userInfo.username,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 设置token有效期为24小时
    }, app.config.jwt.secret);

    setResponse(ctx, httpCode.SUCCESS, '登录成功', { token });
  }

  async getUserInfo() {
    const { ctx } = this;
    // 通过 getUserByName 方法，以用户名 decode.username 为参数，从数据库获取到该用户名下的相关信息
    const userInfo = await ctx.service.user.getUserByName(ctx.state.userInfo.username);
    setResponse(ctx, httpCode.SUCCESS, null, {
      id: userInfo.id,
      username: userInfo.username,
      signature: userInfo.signature,
      avatar: userInfo.avatar || defaultAvatar,
    });
  }

  async editUserInfo() {
    const { ctx } = this;
    // 通过 post 请求，在请求体中获取签名字段 signature
    const { signature = '', avatar = '' } = ctx.request.body;

    try {
      // 获取用户id 从中间件传递的信息中获取用户id
      const user_id = ctx.state.userInfo.id;
      const userInfo = await ctx.service.user.getUserByName(ctx.state.userInfo.username);
      await ctx.service.user.editUserInfo({
        ...userInfo,
        signature,
        avatar,
      });
      setResponse(ctx, httpCode.SUCCESS, null, {
        id: user_id,
        username: userInfo.username,
        signature,
        avatar,
      });
    } catch (error) {
      return null;
    }
  }

}

module.exports = UserController;
