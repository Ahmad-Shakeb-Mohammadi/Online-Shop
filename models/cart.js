// const Sequelieze = require("sequelize");
// const sequelize = require("../util/database");

// const cart = sequelize.define("cart",{
//   id:{
//     type: Sequelieze.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true
//   }
// })

// module.exports = cart;



// const fs = require("fs")
// const path = require("path");
// const p = path.join(
//   path.dirname(process.mainModule.filename),
//   'data',
//   'cart.json'
// );

// const getCartsFromFile = cb => {
//   fs.readFile(p, (err, fileContent) => {
//     if (err) {
//       cb(null);
//     } else {
//       cb(JSON.parse(fileContent));
//     }
//   });
// };


// module.exports = class Cart{
//     static addProduct(id, price){
//       fs.readFile(p,(err,fileContent)=>{
//         let cart = {products: [], totalprice:0}
//         if (!err){
//           cart = JSON.parse(fileContent)
//         }
//         const existingProductIndex = cart.products.findIndex(product => product.id === id)
//         const existingProduct = cart.products[existingProductIndex]
//         let updatedProduct;
//         if(existingProduct){
//           updatedProduct = { ...existingProduct}
//           updatedProduct.qty +=1
//           cart.products[existingProductIndex] = updatedProduct
//         }else{
//           updatedProduct = {id: id,qty:1}
//           cart.products.push(updatedProduct)
//         }
//         cart.totalprice += +price
//         fs.writeFile(p,JSON.stringify(cart),(err)=>{
//           console.log(err)
//         })
//       })
//     }
//     static deleteProduct(id,price){
//       getCartsFromFile(carts =>{
//         const cartIndex = carts.products.findIndex(el => el.id == id)
//         if (cartIndex != -1) {
//           const qty = carts.products[cartIndex].qty;
//           const deducedPrice = qty * price
//           carts.products.splice(cartIndex, 1)
//           carts.totalprice -= deducedPrice
//           fs.writeFile(p, JSON.stringify(carts), (err) => {
//             console.log(err)
//           })
//         }

//       })
//     }

//     static getCarts(cb){
//       getCartsFromFile(carts=>{
//         cb(carts)
//       })
//     }
// }