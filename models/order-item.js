const Sequelieze = require("sequelize");
const sequelize = require("../util/database");

const orderItem = sequelize.define("orderItem",{
  id:{
    type: Sequelieze.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  quantity: Sequelieze.INTEGER
})

module.exports = orderItem;