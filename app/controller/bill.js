'use strict';

const moment = require('moment');
const { setResponse, handleResponse } = require('../util/common');
const { httpCode } = require('../constant/httpCode');
const Controller = require('egg').Controller;

class BillController extends Controller {
  // 新增账单
  async add() {
    // 获取请求中携带的参数
    const { ctx } = this;
    const { amount, type_id, type_name, bill_date, pay_type, remark = '' } = ctx.request.body;

    // 判空处理
    if (!amount || !type_id || !type_name || !bill_date || !pay_type) {
      setResponse(ctx, httpCode.BAD_REQUEST, '参数错误');
    }

    try {
      // 获取用户id 从中间件传递的信息中获取用户id
      const user_id = ctx.state.userInfo.id;
      // user_id 默认添加到每个账单项，作为后续获取指定用户账单的标示。
      // 可以理解为，我登陆了A账单，那么所做的操作都得加上A账户的id，后续获取的时候，就过滤出A的账单
      const result = await ctx.service.bill.add({
        amount,
        type_id,
        type_name,
        bill_date,
        pay_type,
        remark,
        user_id,
      });
      handleResponse(ctx, result, '新增成功');
    } catch (error) {
      setResponse(ctx, httpCode.INTERNAL_SERVER_ERROR, '系统错误');
    }
  }

  // 获取账单列表
  async list() {
    const { ctx } = this;
    // 获取， 日期 date， 分页数据， 类型 type_id, 这些都是前端传给后端的数据
    const { date, page = 1, page_size = 5, type_id = 'all' } = ctx.query;

    try {
      // 获取用户id 从中间件传递的信息中获取用户id
      const user_id = ctx.state.userInfo.id;

      const list = await ctx.service.bill.list(user_id, page);

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
      }, []);

      // 返回数据
      setResponse(ctx, httpCode.SUCCESS, null, {
        totalExpendAmount,
        totalIncomeAmount,
        totalPage: Math.ceil(listMap.length / page_size),
        list: listMap || [],
      });
    } catch (error) {
      setResponse(ctx, httpCode.INTERNAL_SERVER_ERROR, '系统错误');
    }
  }

  // 获取账单详情
  async getBillDetail() {
    const { ctx } = this;
    const { id = '' } = ctx.query;

    if (!id) {
      setResponse(ctx, httpCode.INTERNAL_SERVER_ERROR, '订单id不能为空');
    }
    // 获取用户id 从中间件传递的信息中获取用户id
    const user_id = ctx.state.userInfo.id;
    try {
      const result = await ctx.service.bill.getBillDetail(id, user_id);
      handleResponse(ctx, result, '请求成功', result);
    } catch (error) {
      setResponse(ctx, httpCode.INTERNAL_SERVER_ERROR, '系统错误');
    }
  }

  // 编辑账单接口
  async update() {
    const { ctx } = this;
    // 账单的相关参数，这里注意要把账单的id也传进去
    const { id, amount, type_id, type_name, bill_date, pay_type, remark = '' } = ctx.request.body;
    // 判空处理
    if (!id || !amount || !type_id || !type_name || !bill_date || !pay_type) {
      setResponse(ctx, httpCode.BAD_REQUEST, '参数错误');
      return;
    }

    try {
      // 获取用户id 从中间件传递的信息中获取用户id
      const user_id = ctx.state.userInfo.id;
      // 根据账单 id 和 user_id，修改账单数据
      const result = await ctx.service.bill.update({
        id,
        amount,
        type_id,
        type_name,
        bill_date,
        pay_type,
        remark,
        user_id,
      });
      handleResponse(ctx, result, '修改成功');
    } catch (error) {
      setResponse(ctx, httpCode.INTERNAL_SERVER_ERROR, '系统错误');
    }
  }

  // 删除账单接口
  async delete() {
    const { ctx } = this;
    const { id } = ctx.request.body;

    // 获取用户id 从中间件传递的信息中获取用户id
    const user_id = ctx.state.userInfo.id;
    console.log('user_id', user_id);
    try {
      const result = await ctx.service.bill.delete(id, user_id);
      handleResponse(ctx, result, '删除成功');
    } catch (error) {
      setResponse(ctx, httpCode.INTERNAL_SERVER_ERROR, '系统错误');
    }
  }

  // 获取账单图标统计出来的数据
  async statistics() {
    const { ctx } = this;
    const { date = '' } = ctx.query;

    // 获取用户id 从中间件传递的信息中获取用户id
    const user_id = ctx.state.userInfo.id;
    try {
      const result = await ctx.service.bill.list(user_id, 1);

      const start = moment(date).startOf('month').unix() * 1000; // 选择月份，月初时间
      const end = moment(date).endOf('month').unix() * 1000; // 选择月份，月末时间
      const _data = result.filter(item => (Number(item.bill_date)) > start && (Number(item.bill_date)) < end);

      // 总支出
      const total_expense = _data.reduce((arr, curr) => {
        if (curr.pay_type === 1) {
          arr += Number(curr.amount);
        }
        return arr;
      }, 0);

      // 总收入
      const total_income = _data.reduce((arr, curr) => {
        if (curr.pay_type === 2) {
          arr += Number(curr.amount);
        }
        return arr;
      }, 0);

      let total_data = _data.reduce((arr, curr) => {
        const index = arr.findIndex(item => item.type_id === curr.type_id);
        if (index === -1) {
          arr.push({ ...curr, number: Number(curr.amount) });
        } else {
          arr[index].number += Number(curr.amount);
        }
        return arr;
      }, []);

      total_data = total_data.map(item => {
        item.number = Number(Number(item.number).toFixed(2));
        return item;
      });

      setResponse(ctx, httpCode.SUCCESS, {
        total_income: Number(total_income).toFixed(2),
        total_expense: Number(total_expense).toFixed(2),
        total_data: total_data || [],
      });
    } catch (error) {
      setResponse(ctx, httpCode.INTERNAL_SERVER_ERROR, '系统错误');
    }
  }
}

module.exports = BillController;
