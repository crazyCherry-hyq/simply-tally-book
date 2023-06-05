'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app;
  const _jwt = middleware.jwtErr(app.config.jwt.secret);
  router.post('/api/user/register', controller.user.register); // 注册
  router.post('/api/user/login', controller.user.login); // 登录
  // 用户管理
  router.get('/api/user/getUserInfo', _jwt, controller.user.getUserInfo); // 获取用户信息
  router.post('/api/user/editUserInfo', _jwt, controller.user.editUserInfo); // 编辑用户信息
  router.post('/api/upload', controller.upload.upload); // 上传文件
  // 账单管理
  router.post('/api/bill/add', _jwt, controller.bill.add); // 添加账单
  router.get('/api/bill/list', _jwt, controller.bill.list); // 获取账单列表
  router.get('/api/bill/detail', _jwt, controller.bill.getBillDetail); // 获取账单详情
  router.post('/api/bill/update', _jwt, controller.bill.update); // 编辑账单
  router.post('/api/bill/delete', _jwt, controller.bill.delete); // 删除账单
  router.get('/api/bill/statistics', _jwt, controller.bill.statistics); // 获取统计账单接口
};
