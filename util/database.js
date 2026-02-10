// const mysql = require("mysql2")

// const pool = mysql.createPool({
//     host: "localhost",
//     user: "root",
//     database: "node-complete",
//     password: "shakeb123"
// })

// module.exports = pool.promise();

// const Sequelize = require("sequelize")

// const sequelize = new Sequelize("node-complete","root","shakeb123",{    //auto returns promise
//     dialect: "mysql",
//     host: "localhost"
// })

// module.exports = sequelize;


// mongodb that now isnt needed for mongoose

// const mongoDb = require("mongodb");
// const mongoClient = mongoDb.MongoClient;

// let _db;
// const dbconnection = (cb)=>{
//     mongoClient.connect("mongodb://localhost:27017")
//     .then((client)=>{
//         console.log("Connected!")
//         _db = client.db('shop')
//         cb()
//     })
//     .catch(err=>{
//         console.log(err);
//         throw err;
//     })
// }

// const getDb = ()=>{
//     if(_db){
//         return _db
//     }
//     throw "db doesnt exist"
// }

// exports.dbconnection = dbconnection;
// exports.getDb = getDb;