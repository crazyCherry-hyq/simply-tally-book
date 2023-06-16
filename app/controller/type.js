const { setResponse } = require('../util/common');
const { httpCode } = require('../constant/httpCode');

const Controller = require('egg').Controller;

class TypeController extends Controller {
  // 获取账单类型
  async getBillTypeList() {
    const { ctx } = this;
    const userId = ctx.state.userInfo.id;
    const expenseBillTypeList = await ctx.service.type.getBillTypeByPayType(1, userId);
    const incomeBillTypeList = await ctx.service.type.getBillTypeByPayType(2, userId);
    setResponse(ctx, httpCode.SUCCESS, null, {
      expenseBillTypeList,
      incomeBillTypeList,
    });
  }
}

module.exports = TypeController;
