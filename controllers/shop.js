const Product = require('../models/product');
const fs = require("fs");
const path = require("path")
const Order = require("../models/order");
const PDFdoc = require("pdfkit")
const deleteHelper = require("../util/file");
const Stripe = require("stripe")

const ITEMS_PER_PAGE = 6

exports.getProducts = (req, res, next) => {
  // Product.fetchAll() mongodb
  const page = +req.query.page || 1;
  let totalproducts;
  Product.find().countDocuments()
    .then(numberofprod => {
      totalproducts = numberofprod
      return Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/products',
        currentPage: page,
        nextPage: page + 1,
        previousPage: page - 1,
        hasNextPage: page * ITEMS_PER_PAGE < totalproducts,
        hasPreviousPage: page > 1,
        lastPage: Math.ceil(totalproducts / ITEMS_PER_PAGE)
      });
    }).catch(err => {
      // console.log(err)
      let error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })

  // Product.fetchAll()
  // .then(([rows,fieldData])=>{
  //     res.render('shop/product-list', {
  //     prods: rows,
  //     pageTitle: 'All Products',
  //     path: '/products'
  //   });
  // })
  // .catch(err=> console.log(err))
};

exports.getIndex = (req, res, next) => {
  // Product.fetchAll() mongodb
  const page = +req.query.page || 1;
  let totalproducts;
  Product.find().countDocuments()
    .then(numberofprod => {
      totalproducts = numberofprod
      return Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Home',
        path: '/',
        currentPage: page,
        nextPage: page + 1,
        previousPage: page - 1,
        hasNextPage: page * ITEMS_PER_PAGE < totalproducts,
        hasPreviousPage: page > 1,
        lastPage: Math.ceil(totalproducts / ITEMS_PER_PAGE)
      });
    }).catch(err => {
      // console.log(err)
      let error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })

  // Product.fetchAll()
  // .then(([rows,fieldData])=>{
  //     res.render('shop/index', {
  //     prods: rows,
  //     pageTitle: 'Home',
  //     path: '/'
  //   });
  // })
  // .catch(err=> console.log(err))
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then(products => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Carts',
        products: products,
      })
    }).catch(err => {
      console.log(err)
      // let error = new Error(err)
      // error.httpStatusCode = 500;
      // return next(error)
    })

  // req.user.getCart()
  //   .then(cart => {
  //     return cart.getProducts()
  //   })
  //   .then(products => {
  //     res.render('shop/cart', {
  //       path: '/cart',
  //       pageTitle: 'Your Carts',
  //       products: products
  //     });
  //   })
  //   .catch(err => console.log(err))
  // sequelieze up to here


  // const cartProduts = []
  // Cart.getCarts(carts => {
  //   if (carts) {
  //     Product.fetchAll(products => {
  //       for (let product of products) {
  //         const matchedCart = carts.products.find(prod => prod.id == product.id)
  //         if (matchedCart) {
  //           cartProduts.push({ product: product, qty: matchedCart.qty })
  //         }
  //       }
  //       res.render('shop/cart', {
  //         path: '/cart',
  //         pageTitle: 'Your Carts',
  //         products: cartProduts
  //       });
  //     })
  //   }
  // })
};

exports.postCart = (req, res, next) => {
  const productId = req.params.productId
  Product.findById(productId).then(product => {
    return req.user.addToCart(product)
  })
    .then(result => {
      res.redirect("/cart")
    }).catch(err => {
      // console.log(err)
      let error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })
  // let fetchedCart;
  // let newQuantity = 1
  // req.user.getCart()
  //   .then(cart => {
  //     fetchedCart = cart;
  //     return cart.getProducts({ where: { id: productId } })
  //   })
  //   .then(products =>{
  //     let product;
  //     if(products.length >0){
  //       product = products[0]
  //     }
  //     if(product){
  //       let oldQuantity = product.cartItem.quantity;
  //       newQuantity = oldQuantity +1
  //       return product
  //     }
  //     return Product.findByPk(productId)
  //   })
  //   .then(product =>{
  //     return fetchedCart.addProduct(product ,{through:{
  //       quantity: newQuantity
  //     }})
  //   })
  //   .then(()=> res.redirect("/cart"))
  //   .catch(err => console.log(err))


  // Product.findById(productId, product => {
  //   if (product != -1) {
  //     Cart.addProduct(productId, product.price)
  //   } else {
  //     console.log("The product no longer exist")
  //   }

  // })
  // res.redirect("/cart")
}

exports.getCheckout = (req, res, next) => {
  req.user.getCart()
    .then(products => {
      let total = 0
      products.forEach(p => {
        total = total + p.product.price * p.quantity
      })
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products,
        total
      })
    }).catch(err => next(err))
}


exports.getOrders = (req, res, next) => {
  req.user.getOrders()
    .then(([orders, total]) => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders,
        total,
        isAuthenticated: req.session.isLoggedIn                     // req.isAuthenticated
      });
    })
    .catch(err => {
      // console.log(err)
      let error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })

  // req.user.getOrders({include: "products"})
  // .then(orders =>{
  //   res.render('shop/orders', {
  //   path: '/orders',
  //   pageTitle: 'Your Orders',
  //   orders
  // });
  // })
  // .catch(err => console.log(err))

};

exports.postCheckout = (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE_KEY)
  let total = 0
  req.user.getCart()
    .then(async (products) => {
      products.forEach(p => {
        total = total + (p.product.price * p.quantity)
      })
      try {
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'All your cart items',
                },
                unit_amount: total * 100, // $ in cent
              },
              quantity: 1,
            },
          ],
          success_url: `${process.env.CLIENT_URL}/create-order`,
          cancel_url: `${process.env.CLIENT_URL}/cart`,
        });

        res.json({ url: session.url });
      } catch (error) {
        console.log("Offline")
        return res.redirect("/checkout")
        //  return res.status(500).json({ error: error.message });
      }

    })
    .catch(err => {
      // console.log(err)
      let error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })


  // let fetchedCart;
  // req.user.getCart()
  // .then(cart =>{
  //   fetchedCart = cart
  //   return cart.getProducts()
  // })
  // .then(products =>{
  //   return req.user.createOrder()
  //   .then(order =>{
  //     order.addProducts(products.map(product =>{
  //       product.orderItem = {quantity: product.cartItem.quantity}
  //       return product
  //     }))
  //   })
  //   .then(result =>{
  //     return fetchedCart.setProducts(null)
  //     .then(result =>res.redirect("/orders") 
  //   )})
  //   .catch(err => console.log(err))
  // })
  // .catch(err => console.log(err))
}


exports.postOrders = (req, res, next) => {
  req.user.addOrder()
    .then(result => {
      res.redirect("/orders")
    })
}

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)    // here my findById is the same with mongoose method and mongoose auto changes the id to objectid
    .then(product => {
      res.render("shop/product-detail", {
        pageTitle: product.title,
        path: "/products",
        product,
        isAuthenticated: req.session.isLoggedIn                     // req.isAuthenticated
      })
    })
    .catch(err => {
      // console.log(err)
      let error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })

  // Product.findById(1)
  // .then(([[product]])=>{
  //     console.log(product)
  //     res.render("shop/product-detail", {
  //     pageTitle: product.title,
  //     path: "/products",
  //     product
  //   })
  // })
}

exports.postDeleteCartItem = (req, res, next) => {
  const productId = req.body.productId;
  req.user.deleteCart(productId)
    .then(result => {
      res.redirect("/cart")
    })
    .catch(err => {
      // console.log(err)
      let error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })


  // req.user.getCart()
  //   .then(cart => {
  //     return cart.getProducts({where: {id: productId}})
  //   })
  //   .then(products =>{
  //     let product = products[0];
  //     return product.cartItem.destroy()
  //   })
  //   .then(()=> res.redirect("/cart"))
  //   .catch(err => console.log(err))
  // Product.findById(productId, prod => {
  //   Cart.deleteProduct(productId, prod.price)
  //   res.redirect("/cart")
  // })
}

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error("no order is found"))
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("not authorized"))
      }
      const invoiceName = "invoice-" + orderId + ".pdf"
      const invoicePath = path.join("data", "invoices", invoiceName)

      const pdfDoc = new PDFdoc();
      pdfDoc.pipe(fs.createWriteStream(invoicePath))       // a readable stram is connected to writable
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
      pdfDoc.pipe(res)
      pdfDoc.fontSize(28).text("Invoice")
      pdfDoc.text("-----------")
      let total = 0
      order.items.forEach(prod => {
        total = total + prod.product.price * prod.quantity;
        pdfDoc.fontSize(18).text(`${prod.product.title} => ${prod.quantity} X $${prod.product.price}`)
      })
      pdfDoc.text("----------")
      pdfDoc.fontSize(24).text("Total: $" + total)
      pdfDoc.end()
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err)
      //   }
      //   res.setHeader('Content-Type', 'application/pdf')
      //   res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
      //   res.send(data)
      // })
      // now lets serve it with chunck of stream
      // const stream = fs.createReadStream(invoicePath)
      // res.setHeader('Content-Type', 'application/pdf')
      // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
      // stream.pipe(res)      // connects readable stream to writeable stream
    })
    .catch(err => {
      return next(err)
    })

}