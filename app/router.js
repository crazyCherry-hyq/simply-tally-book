'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app;
  const _jwt = middleware.jwtErr(app.config.jwt.secret);
  router.post('/api/user/register', controller.user.register); // 注册
  router.post('/api/user/login', controller.user.login); // 登录
  router.get('/api/user/getUserInfo', _jwt, controller.user.getUserInfo); // 获取用户信息
  router.post('/api/user/editUserInfo', _jwt, controller.user.editUserInfo); // 编辑用户信息
  router.post('/api/upload', controller.upload.upload); // 上传文件
  router.post('/api/bill/add', _jwt, controller.bill.add); // 添加账单
  router.get('/api/bill/list', _jwt, controller.bill.list); // 获取账单列表
};
