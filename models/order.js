// const Sequelieze = require("sequelize");
// const sequelize = require("../util/database");
// const { type } = require("express/lib/response");

const mongoose = require("mongoose")
const product = require("./product")
const Schema = mongoose.Schema

// const order = sequelize.define("order",{
//     id: {
//         type: Sequelieze.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     }
// })

// module.exports = order;

const orderSchema = new Schema({
    items: [{product: Object ,quantity: Number}],
    user: {
        email: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'Users'
        }
    }
})

module.exports = mongoose.model('Orders',orderSchema);