// // const Sequelieze = require("sequelize");
// // const sequelize = require("../util/database");
// const getDb = require("../util/database").getDb;
// const {ObjectId} = require("mongodb");
const mongoose = require("mongoose");
const Order = require("./order");
const Schema = mongoose.Schema;

// // const User = sequelize.define("user",{
// //     id: {
// //         type: Sequelieze.INTEGER,
// //         allowNull: false,
// //         autoIncrement: true,
// //         primaryKey: true
// //     },
// //     name: {
// //         type: Sequelieze.STRING,
// //         allowNull: false
// //     },
// //     email: {
// //         type: Sequelieze.CHAR,
// //         allowNull: false
// //     }
// // })




// mongodb
// class User{
//     constructor(name,email,cart,id){
//         this.name = name;
//         this.email = email;
//         this.cart = cart
//         this._id = id;
//     }

//     save(){
//         const db = getDb();
//         return db.collection("Users").insertOne(this)
//     }

//     addToCart(product){
//         const db = getDb()
//         var updatedCart;
//         // const updatedCart = {items: [{...product, quantity: 1}]}  for emebedded one
//         updatedCart = { items: [{productId: new ObjectId(product._id), quantity: 1}]}
//         if(this.cart){
//             const index = this.cart.items.findIndex(cp=>{
//                 return cp.productId.equals(product._id)
//             })
//             if(index != -1){
//                 var oldQuantity = this.cart.items[index].quantity
//                 var updatedCartItems = this.cart.items.filter(obj => obj.productId.toString() != product._id.toString())
//                 updatedCartItems.push({productId: new ObjectId(product._id),quantity: oldQuantity+1})
//                 updatedCart = {items: updatedCartItems}
//             }else{
//                 updatedCart = {items: [...this.cart.items,{productId: new ObjectId(product._id),quantity: 1}]}
//             }
//         }
//         return db.collection("Users").updateOne(
//             {_id: new ObjectId(`${this._id}`)},
//             {$set: {cart:  updatedCart}}
//         )
//     }

//     static findById(id){
//         const db = getDb();
//         return db.collection("Users").findOne({_id: new ObjectId(`${id}`)})
//     }

//     getCart(){
//         const db = getDb()
//         let productsId = this.cart.items.map(item => item.productId)
//         return db.collection("products").find({_id: {$in: productsId}}).toArray().then((products =>{
//             if (products.length != productsId.length){
//                 let productsIdarr = products.map(p => {
//                     return p._id.toString()
//                 }) 
//                 let updatedCartItems = this.cart.items.filter(i=>{
//                     return productsIdarr.includes(i.productId.toString())
//                 })
//                 db.collection("Users").updateOne({_id: new ObjectId(`${this._id}`)},{
//                     $set: {cart: {items: updatedCartItems} }
//                 })
//             }
//             return products.map(p =>{
//                 return {...p,quantity: this.cart.items.find(i =>{
//                     return i.productId.toString() === p._id.toString()
//                 }).quantity }
//             })
//         }))
//     }

//     deleteCart(id){
//         const db = getDb()
//         return db.collection("Users").updateOne({_id: this._id},{
//             $pull: {"cart.items": {productId: new ObjectId(`${id}`)}}
//         })
//     }

//     addOrder(){
//         const db = getDb();
//         return this.getCart()
//             .then(products=>{
//                 let order = {
//                     items: products,
//                     user: {
//                         _id: new ObjectId(`${this._id}`),
//                         name: this.name
//                     }
//                 }
//                 return db.collection("Orders").insertOne(order)
//                 .then(result =>{
//                     return db.collection("Users").updateOne({_id: new ObjectId(`${this._id}`)},{
//                         $set: {cart: {items: []}}
//                     })
//                 })

//             })
//             .catch(err=>console.log(err))
//     }

//     getOrders(){
//         const db = getDb();
//         return db.collection("Orders").find({"user._id": new ObjectId(`${this._id}`)}).toArray()
//             .then(orders =>{
//                 return orders
//             })
//             .catch(err=>console.log(err))
//     }

// }

// module.exports = User;

const userSchema = Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        // items: [{ productId: { type: mongoose.Types.ObjectId, ref: 'Products', required: true }, quantity: { type: Number, required: true } }]
        items: [{ product: Object, quantity: { type: Number, required: true } }]
    }

})

userSchema.methods.addToCart = function (product) {
    var updatedCart;
    // const updatedCart = {items: [{...product, quantity: 1}]}  for emebedded one
    updatedCart = { items: [{ product: product, quantity: 1 }] }
    if (this.cart.items.length > 0) {
        const index = this.cart.items.findIndex(cp => {
            return cp.product._id.toString() == product._id
        })
        if (index != -1) {
            var oldQuantity = this.cart.items[index].quantity
            var updatedCartItems = this.cart.items.filter(obj => obj.product._id.toString() != product._id.toString())
            updatedCartItems.push({ product: product, quantity: oldQuantity + 1 })
            updatedCart = { items: updatedCartItems }
        } else {
            updatedCart = { items: [...this.cart.items, { product: product, quantity: 1 }] }
        }
    }
    this.cart = updatedCart
    return this.save()
}

userSchema.methods.getCart = function () {
            if (this.cart.items.length > 0) {
                let cp = this.cart.items.map(el => {
                        return { product: el.product, quantity: el.quantity }
                })
                return new Promise((resolve,reject)=> resolve(cp))
            } else {
                return new Promise((resolve,reject)=> resolve([]))
            }
    
}

userSchema.methods.deleteCart = function (id) {
    this.cart.items = this.cart.items.filter(el => el.product._id.toString() !== id.toString())
    return this.save()
}

userSchema.methods.addOrder = function () {
    let order = new Order({
        items: this.cart.items,
        user: {
            email: this.email,
            userId: this._id
        }
    })
    return order.save()
        .then(() => {
            this.cart.items = []
            return this.save()
        })
        .catch(err => console.log(err))

}

userSchema.methods.getOrders = function () {
    return Order.find({ "user.userId": this._id })
        .then(orders => {
            // return Order.find().populate("items.productId")
            // .then(orders2 => {
            //     let total = 0
            //     let pricearr;
            //     for (let i of orders2) {
            //         pricearr = i.items.map(j => j.productId ? j.productId.price : 0 * j.quantity)
            //         total += pricearr.reduce((acc, num) => acc + num, 0)
            //     }
            //     console.log(orders)
            //     return [orders, total]
            // })                              // this for total of all orders not only one user
            let total = 0
            let pricearr;
            for (let i of orders) {
                pricearr = i.items.map(j => j.product.price * j.quantity)
                total += pricearr.reduce((acc, num) => acc + num, 0)
            }
            return [orders,total]
        })
        .catch(err => console.log(err))
}
module.exports = mongoose.model('Users', userSchema)