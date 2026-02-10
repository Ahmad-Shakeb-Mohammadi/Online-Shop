// const getDb = require("../util/database").getDb;
const mongoose = require("mongoose")
const Schema = mongoose.Schema;
// // const fs = require('fs');
// // const path = require('path');
// const db = require("../util/database");

// // const p = path.join(
// //   path.dirname(process.mainModule.filename),
// //   'data',
// //   'products.json'
// // );

// // const getProductsFromFile = cb => {
// //   fs.readFile(p, (err, fileContent) => {
// //     if (err) {
// //       cb([]);
// //     } else {
// //       cb(JSON.parse(fileContent));
// //     }
// //   });
// // };



// module.exports = class Product {
//   constructor(title, imageUrl, description, price) {
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.description = description;
//     this.price = price;
//   }

//   save() {
//     // this.id = Math.random().toString()
//     // getProductsFromFile(products => {
//     //   products.push(this);
//     //   fs.writeFile(p, JSON.stringify(products), err => {
//     //     console.log(err);
//     //   });
//     // });
//   return db.execute("INSERT INTO products (title,price,imageUrl,description) VALUES (?, ?, ?, ?)",
//     [this.title,this.price,this.imageUrl,this.description]
//   )

//   }

//   static fetchAll() {
//     // getProductsFromFile(cb);
//     return db.execute("SELECT * FROM products")

//   }

//   static findById(id){
//     // getProductsFromFile(products =>{
//     //   cb(products.find(product => product.id == id ))
//     // })
//   return db.query("SELECT * FROM products WHERE products.id = ?",[id])

//   }

//   static updateProducts(id,body,cb){
//     // const updatedProduct = {
//     //   id: id,
//     //   title: body.title,
//     //   imageUrl: body.imageUrl,
//     //   price: body.price,
//     //   description: body.description
//     // }
//     // getProductsFromFile(products =>{
//     //   const index = products.findIndex(el => el.id == id)
//     //   products[index] = updatedProduct
//     //   fs.writeFile(p,JSON.stringify(products),(err)=>{
//     //     console.log(err)
//     //   })
//     //   cb()
//     // })

//   }

//   static deleteProduct(id,cb){
//     // getProductsFromFile(products=>{
//     //   const index = products.findIndex(el => el.id == id)
//     //   products.splice(index,1)
//     //   fs.writeFile(p,JSON.stringify(products),(err)=>{
//     //     console.log(err)
//     //     cb()
//     //   })

//     // })
//   }
// };
// const Sequelize = require("sequelize");
// const sequelize = require("../util/database");

// const product = sequelize.define("product",{
//   id:{
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true
//   },
//   title: Sequelize.STRING,
//   price: {
//     type: Sequelize.DOUBLE,
//     allowNull: false
//   },
//   imageUrl: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   description: {
//     type: Sequelize.STRING,
//     allowNull: false
//   }
// })


//Mongodb
// class Product {
//   constructor(title, imageUrl, price, description,userId) {
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.price = price;
//     this.description = description,
//     this.userId = userId
//   }

//   save() {
//     const db = getDb();
//     return db.collection("products").insertOne(this)
//       .then((result) => {
//         console.log(result)
//       })
//       .catch(err => console.log(err))
//   }

//   static fetchAll(){
//     const db = getDb();
//     return db.collection("products").find().toArray()
//       .then(products =>{
//         console.log(products)
//         return products
//       })
//       .catch(err=> console.log(err))
//   }

//   static findById(id){
//     const db = getDb();
//     return db.collection("products").findOne({_id: new ObjectId(`${id}`)})
//       .then((product)=>{
//         return product
//       })
//       .catch(err=>console.log(err))
//   }

//   static updateProduct(id,title,imageUrl,price,description){
//     const db = getDb();
//     return db.collection("products").updateOne({_id: new ObjectId(`${id}`)},{
//       $set: {
//         title: title,
//         imageUrl: imageUrl,
//         price: price,
//         description: description
//       }
//     })
//   }

//   static deleteProduct(id){
//     const db = getDb();
//     return db.collection("products").deleteOne({_id: new ObjectId(`${id}`)})
//   }
// }


const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: String,
  user_id: {
    type: mongoose.Types.ObjectId, ref: 'Users', required: true
  }
})


module.exports = mongoose.model('Products',productSchema);