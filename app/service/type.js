'use strict';

const Service = require('egg').Service;

class TypeService extends Service {
  // 查询所有类型和用户定制的类型
  async getBillTypeByPayType(type, user_id) {
    const { app } = this;
    try {
      const result = await app.mysql.select('type', {
        where: { type, user_id: [ 0, user_id ] },
        columns: [ 'id', 'name' ],
      });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

module.exports = TypeService;
