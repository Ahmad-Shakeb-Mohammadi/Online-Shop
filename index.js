const express = require("express")
const app = express()
const adminRoutes = require("./routes/admin")
const shopRoutes = require("./routes/shop")
const errorRoutes = require("./routes/errors")
const loginRoutes = require("./routes/auth")
const path = require("path")
const fs = require("fs")
const auth = require("./middlewares/is-auth");
// const sequalize = require("./util/database");
// const Product = require("./models/product");
const User = require("./models/user");
const shopController = require("./controllers/shop")
// const Cart = require("./models/cart")
// const CartItem = require("./models/cart-item");
// const Order = require("./models/order");
// const OrderItem = require("./models/order-item");
// const dbconnection = require("./util/database").dbconnection;   // mongodb
const mongoose = require("mongoose");
const session = require("express-session");
const mongodbSession = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash")
const multer = require("multer");
const helmet = require("helmet")
const compression = require("compression")
const morgan = require("morgan")
// const https = require("https")

// const imageStore = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'images')
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "-" + file.originalname)
//     }
// })

// const fileFilter = (req, file, cb) => {
//     if (file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
//         cb(null, true)
//     } else {
//         cb(null, false)
//     }
// }

const storage = multer.memoryStorage()
const upload = multer({storage,limits:{fileSize: 10*1024*1024 }})


const accssLogStream = fs.createWriteStream(path.join(__dirname,"access.log"),{flags: 'a'})
// const privateKey = fs.readFileSync("server.key")
// const certificate = fs.readFileSync("server.crt")

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'","data:","https://*.supabase.co"]
        }
    }
}))
app.use(compression({
    threshold: 1024
}))
app.use(morgan('tiny',{stream: accssLogStream}))
app.use(express.static(path.join(__dirname, "public")))
// app.use("/images", express.static("images"))
app.use(express.urlencoded({ extended: false }))
app.use(upload.single("image"))
app.set('view engine', 'ejs');
app.set('views', 'views')

const store = new mongodbSession({
    uri: process.env.MONGO_URL,
    collection: "sessions"
})

app.use(session({
    secret: 'my secret', saveUninitialized: false, resave: false, store: store
}))

const csrfProtection = csrf()


app.use((req, res, next) => {
    if (!req.session.user) {
        return next()
    }
    User.findById(req.session.user._id)
        .then(user => {
            // req.user = user
            // req.user = new User(user.name,user.email,user.cart,user._id) mongodb
            if (!user) {
                return next();      // user may be deleted by db even if the session exists 
            }
            req.user = user
            next()
        })
        .catch(err => {
            // console.log(err)
            //throw new Error(err)   // this doesnt work in async code  // may be monogdb sr is down so throw it dont go further
            next(new Error("catch dummy"))
        })
})

app.post('/create-checkout-session', auth, shopController.postCheckout);

app.use(csrfProtection)

// now a middleware to modify the res object
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken()
    next()
})
app.use(flash())
app.post('/user',(req,res,next)=>{
    res.status(200).json({message:'native fetch api'})
})
app.use("/admin", adminRoutes)
app.use(shopRoutes)
app.use(loginRoutes)
app.use(errorRoutes)


app.use((err, req, res, next) => {
    // res.redirect("/500")
    console.log(err)
    res.status(500).render("500", {
        pageTitle: 'Error', path: '/500', isAuthenticated: req.session.isLoggedIn
    })
})

// Product.belongsTo(User,{constraints: true, onDelete: "CASCADE"});
// User.hasMany(Product);
// User.hasOne(Cart)
// Cart.belongsTo(User)
// Cart.belongsToMany(Product, {through: CartItem})
// Product.belongsToMany(Cart, {through: CartItem})
// Order.belongsTo(User)
// User.hasMany(Order)
// Order.belongsToMany(Product,{through: OrderItem, onDelete: "CASCADE"})
// sequalize.sync(
//     // {force: true}
// )
// .then(result =>{
//     // console.log(result)
//     return User.findByPk(1)
// })
// .then(user =>{
//     if(!user){
//         return User.create({
//             name: "ahmad shakeb",
//             email: "ahmad@gmail.com"
//         })
//     }
//     return user
// })
// .then(user =>{
//     // console.log(user)
//     return user.createCart()
// })
// .then(cart=>{
//     app.listen(3000,()=>{
//         console.log(`server is running on port 3000`)
//     })
// })
// .catch(err => console.log(err))

// mongodb
// dbconnection(()=>{
//     User.findById('68e69a4096939e89d5befb0a')
//     .then((user)=>{
//         if(!user){
//             const user = new User("ahmad","ahmad@gmail.com")
//             return user.save()
//         }
//         return user
//     })
//     .then(user =>{
//         console.log(user)
//         app.listen(3000,()=>{
//             console.log(`server is running on port 3000`)
//         }) 
//     })
//     .catch(err => console.log(err))

// })
// const monogdb_url = "mongodb+srv://ahmadshakeb:Shakeb.123@cluster0.mjftxwd.mongodb.net/shop?appName=Cluster0/shop"
console.log(process.env.MONGO_URL)
mongoose.connect(process.env.MONGO_URL)
    // .then(result =>{
    //     return User.findOne()     // we needed this untill there was no authentication signup
    //     .then(user =>{
    //         if(!user){
    //             return User.create({
    //                 name: "ahmad shakeb",
    //                 email: "ahmadshakebm@gmail.com",
    //                 cart: {items: []}
    //             })
    //         }
    //         return user
    //     })
    .then(result => {
        // https.createServer({key:privateKey,cert:certificate},app).listen(3000,()=>console.log('running on port 3000'))
        app.listen(process.env.PORT, () => {
            console.log(`server is running on port 3000`)
        })
    })


    // })
    .catch(err => {
        console.log(err)
    })
