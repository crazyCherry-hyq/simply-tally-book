'use strict';

const moment = require('moment');
const { setResponse } = require('../util/common');
const { httpCode } = require('../constant/httpCode');
const Controller = require('egg').Controller;

class BillController extends Controller {
  // 新增账单
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

  // 获取账单列表
  async list() {
    const { ctx, app } = this;
    // 获取， 日期 date， 分页数据， 类型 type_id, 这些都是前端传给后端的数据
    const { date, page = 1, page_size = 5, type_id = 'all' } = ctx.query;

    try {
      const token = ctx.request.header.authorization;
      const decode = app.jwt.verify(token, app.config.jwt.secret);

      if (!decode) return;
      const user_id = decode.id;
      const list = await ctx.service.bill.list(user_id);

      let totalExpendAmount = 0;
      let totalIncomeAmount = 0;
      list.forEach(item => {
        const isEqualCurrentQueryDate = item => moment(Number(item.bill_date)).format('YYYY-MM') === date;
        if (isEqualCurrentQueryDate) {
          if (item.pay_type === 1) { // 累加所有支出的金额
            totalExpendAmount += Number(item.amount);
          }
          if (item.pay_type === 2) { // 累加所有收入的金额
            totalIncomeAmount += Number(item.amount);
          }
        }
      });


      // 过滤出月份和类型所对应的账单列表
      const _list = list.filter(item => {
        const isEqualCurrentDate = moment(Number(item.bill_date)).format('YYYY-MM') === date;
        return type_id !== 'all' ? isEqualCurrentDate && type_id === item.type_id : isEqualCurrentDate;
      });
      // 格式化数据，将其变成我们之间设置好的对象格式
      const listMap = _list.reduce((curr, item) => {
        // curr 默认初始化是一个空数据
        // 把第一个账单项的时间格式化为 yyyy-mm-dd
        const date = moment(Number(item.bill_date)).format('YYYY-MM-DD');
        // 如果能在累加的数据中找到当前项日期date，那么在数组中的加入当前项到bills数组
        const index = curr.findIndex(item => item.bill_date === date);
        if (curr && curr.length && index > -1) {
          curr[index].bills.push(item);
        }

        // 如果在累加的数组中找不到当前项日期的，那么再新建一项
        if (curr && curr.length && index === -1) {
          curr.push({ date, bills: [ item ] });
        }

        // 如果curr为空数组，则默认添加第一个账单项item，格式化为下列模式
        if (!curr.length) {
          curr.push({ date, bills: [ item ] });
        }
        return curr;
      }, []).sort((a, b) => moment(b.date) - moment(a.date));

      // 分页处理，listMap 为我们格式化后的全部数据，还为分页
      const filterListMap = listMap.slice((page - 1) * page_size, page * page_size);

      // 返回数据
      setResponse(ctx, httpCode.SUCCESS, null, {
        totalExpendAmount,
        totalIncomeAmount,
        totalPage: Math.ceil(listMap.length / page_size),
        list: filterListMap || [],
      });
    } catch (error) {
      setResponse(ctx, httpCode.INTERNAL_SERVER_ERROR, '系统错误');
    }
  }
}

module.exports = BillController;
