'use strict';

const Service = require('egg').Service;
const svgCaptcha = require('svg-captcha')

class UserService extends Service {
  // 通过用户名获取用户信息
  async getUserByName(username) {
    const { app } = this;
    try {
      const result = await app.mysql.get('user', { username });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 注册
  async register(params) {
    const { app } = this;
    try {
      const result = await app.mysql.insert('user', params);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 编辑用户信息
  async editUserInfo(params) {
    const { ctx, app } = this;
    try {
      const result = await app.mysql.update('user', { ...params }, { id: params.id });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 获取验证码
  async captcha() {
    const captcha = svgCaptcha.create({});
    this.ctx.session.code = captcha.text;
    console.log(this.ctx.session.code);
    return captcha;
  }
}

module.exports = UserService;
