'use strict';

const Service = require('egg').Service;

class BillService extends Service {
  async add(params) {
    const { app } = this;
    try {
      // 往 bill 表中，插入一条账单数据
      const result = await app.mysql.insert('bill', params);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async list(id, page) {
    const { app } = this;
    try {
      const result = await app.mysql.select('bill', {
        where: { user_id: id },
        columns: [ 'id', 'pay_type', 'amount', 'bill_date', 'type_id', 'type_name', 'remark' ],
        orders: [[ 'bill_date', 'desc' ], [ 'id', 'desc' ]],
        limit: 10,
        offset: (page - 1) * 10,
      });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 获取账单详情
  async getBillDetail(id, user_id) {
    const { app } = this;
    try {
      const result = await app.mysql.get('bill', { id, user_id });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 修改账单
  async update(params) {
    const { app } = this;
    try {
      const result = await app.mysql.update('bill', { ...params }, {
        id: params.id,
        user_id: params.user_id,
      });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 删除账单接口
  async delete(id, user_id) {
    const { app } = this;
    try {
      const result = await app.mysql.delete('bill', { id, user_id });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getTotalsByType(userId, date) {
    const { app } = this;
    try {
      const sql = `
        SELECT t.name AS type_name, SUM(b.amount) AS total_amount
FROM type AS t
LEFT JOIN (
    SELECT type_id, amount
    FROM bill
    WHERE user_id IN (0, 1) AND DATE_FORMAT(bill_date, '%Y-%m') = ${date}
) AS b ON b.type_id = t.id
WHERE t.user_id IN (0, 1)
GROUP BY t.name;
      `;
      console.log(userId, date);
      const result = await app.mysql.query(sql);
      console.log(result);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

}

module.exports = BillService;
