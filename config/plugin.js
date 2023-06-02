'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  // 配置数据库
  mysql: {
    enable: true,
    package: 'egg-mysql',
  },
  // 鉴权
  jwt: {
    enable: true,
    package: 'egg-jwt',
  },
  // 解决跨域
  cors: {
    enable: true,
    package: 'egg-cors',
  },
};
