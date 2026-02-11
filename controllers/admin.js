const Product = require('../models/product');
const { validationResult } = require("express-validator")
const deleteHelper = require("../util/file");
const supabase = require("../middlewares/supabase")

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    // isAuthenticated: req.session.isLoggedIn                     // req.isAuthenticated
    // now we send this variable through a middleware alongside the csrfToken 
    oldInputs: {
      title: "",
      imageUrl: "",
      price: "",
      description: ""
    },
    validateErr: [],
    errorMessage: null
  });
};

exports.postAddProduct = (req, res, next) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    return res.render("admin/edit-product", {
      pageTitle: "Add Product",
      path: 'admin/add-product',
      editing: false,
      oldInputs: {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description
      },
      validateErr: result.array(),
      errorMessage: null
    })
  }
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  // const product = new Product(title, imageUrl, description, price);
  // product.save()   // i used queries here for the db
  // .then(()=>res.redirect('/'))
  // .catch(err=> console.log(err))
  // Product.create({   // before having products associated with users
  //   title: title,
  //   price,
  //   imageUrl,
  //   description,
  //   userId: req.user.id
  // })
  // req.user.createProduct({  // sequelize 
  //   title: title,
  //   price,
  //   imageUrl,
  //   description
  // })

  // the mongodb and mongoose v are the same here 
  // const product = new Product(title, imageUrl, price, description, req.user._id)  mongodb
  if (!image) {
    return res.render("admin/edit-product", {
      pageTitle: "Add Product",
      path: 'admin/add-product',
      editing: false,
      oldInputs: {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description
      },
      validateErr: [],
      errorMessage: "NO image is selected!"
    })
  }

  try {
    let imageUrl;
    const fileName = Date.now() + '-' + req.file.originalname;
    supabase.storage.from("images").upload(fileName, req.file.buffer, { contentType: req.file.mimetype })
      .then(({ data, error }) => {
        if (error) throw error;
        return supabase.storage.from("images").getPublicUrl(fileName)
      })
      .then((args) => {
        if (args.error) next(new Error("Error"));
        imageUrl = args.data.publicUrl
        const product = new Product({ title, imageUrl: imageUrl, price, description, user_id: req.user }) // mongoose auto takes id from user.
        return product.save()
      })
      .then(result => {
        res.redirect("/admin/products")
      })
      .catch(err => {
        // console.log("an error occured")
        console.log(err)                        // lets catch big picture errors gracefully
        // res.redirect("/500")                 // now instead of doing it here lets pass it to a error handleing middleware
        let error = new Error(err)
        error.httpStatusCode = 500;
        return next(error)                     // calling next by passing err obj then express cleverly escapes all other middlewares and reach err middleware
      })
  } catch (err) {
    throw err;
  }


};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  const productId = req.params.productId
  if (!editMode && !productId) {
    return res.redirect("/")
  }
  // Product.findByPk(productId)
  // req.user.getProducts({where: {id: productId}})
  // .then(products=>{
  //     const product = products[0]
  //     res.render('admin/edit-product', {
  //     pageTitle: 'Edit Product',
  //     path: '/admin/edit-product',
  //     editing: true,
  //     product
  //     })
  //   })  
  // .catch(err => console.log(err))

  Product.findById(productId)
    .then(product => {
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: true,
        product,
        // isAuthenticated: req.session.isLoggedIn                     // req.isAuthenticated
        oldInputs: {
          title: "",
          imageUrl: "",
          price: "",
          description: ""
        },
        validateErr: [],
        errorMessage: null
      })
    })
    .catch(err => {
      // console.log(err)
      let error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })
};

exports.postEditProduct = async (req, res, next) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    return res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: 'admin/add-product',
      editing: true,
      product: {
        _id: req.params.productId,
        title: req.body.title,
        price: req.body.price,
        description: req.body.description
      },
      oldInputs: {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description
      },
      validateErr: result.array(),
      errorMessage: null
    })
  }
  const id = req.params.productId;
  const title = req.body.title;
  const price = req.body.price;
  const image = req.file;
  const description = req.body.description;

  // Product.findByPk(id)   // sequelize
  // .then(product =>{
  //   product.title = title;
  //   product.price = price;
  //   product.imageUrl = imageUrl;
  //   product.description = description
  //   return product.save()
  // })
  // .then(()=>{
  //   console.log('product updated');
  //   res.redirect("/admin/products")
  // })
  // .catch(err => console.log(err))

  // mongodb
  // Product.updateProduct(id,title,imageUrl,price,description)
  //   .then(()=>{
  //     console.log('product updated');
  //     res.redirect("/admin/products")
  //   })
  //   .catch(err => console.log(err))

  const product = await Product.findById(id)
  if (!product) {
    return res.redirect("/admin/products")
  }
  if (product.user_id.toString() !== req.user._id.toString()) {
    return res.redirect("/admin/products")
  }
  product.price = price
  product.title = title
  product.description = description
  if (image) {
    // deleteHelper.deleteFile(product.imageUrl);
    const fileName = Date.now() + "-" + req.file.originalname;
    let remvUrl = product.imageUrl.split("/public/images/")[1]
    remvUrl = decodeURIComponent(remvUrl)
    const result = await supabase.storage.from("images").remove([remvUrl])
    if (result.error) {
      next(new Error("could'nt remove the old path"))
    }
    try {
      const { data, error } = await supabase.storage.from("images").upload(fileName, req.file.buffer, { contentType: req.file.mimetype })
      if (error) next(error);
    } catch (err) {
      next(err)
    }
    const args = await supabase.storage.from("images").getPublicUrl(fileName)
    if (args.error) next(new Error("Error"));
    product.imageUrl = args.data.publicUrl
    await product.save()
    return res.redirect("/admin/products")
  } else {
    await product.save()
    return res.redirect("/admin/products")
  }

}

exports.getProducts = (req, res, next) => {
  // Product.findAll()
  // req.user.getProducts()
  //   .then(products => {
  //     res.render('admin/products', {
  //       prods: products,
  //       pageTitle: 'Admin Products',
  //       path: '/admin/products'
  //     });
  //   }).catch(err => console.log(err))

  // Product.fetchAll(products => {
  //   res.render('admin/products', {
  //     prods: products,
  //     pageTitle: 'Admin Products',
  //     path: '/admin/products'
  //   });
  // });

  // Product.fetchAll()  mngoddb
  Product.find({ user_id: req.user._id })
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        isAuthenticated: req.session.isLoggedIn                     // req.isAuthenticated
      });
    })
    .catch(err => {
      // console.log(err)
      let error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })
};

exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;
  // const price = req.body.deletedPrice;
  // Product.findByPk(productId)
  // .then(product=>{
  //   return product.destroy()
  // })
  // .then(()=>{
  //   console.log("product deleted");
  //   res.redirect("/admin/products")
  // })
  // .catch(err => console.log(err))

  // Cart.deleteProduct(productId,price)
  // Product.deleteProduct(productId,()=>[
  //   res.redirect("/admin/products")
  // ])

  // Product.deleteProduct(productId)  mongodb
  Product.findById(productId)
    .then(product => {
      if (!product) {
        return res.json({message: 'not found'})
      }
      // deleteHelper.deleteFile(product.imageUrl);
      let remvUrl = product.imageUrl.split("/public/images/")[1]
      remvUrl = decodeURIComponent(remvUrl)
      return supabase.storage.from("images").remove([remvUrl])
        .then(args => {
          if (args.error) {
            next(new Error("could'nt remove the old path"))
          }
          return Product.deleteOne({ _id: productId, user_id: req.user._id })
        })
        .then(() => {
          // res.redirect("/admin/products")  // now use async js
          res.status(200).json({ message: 'success!' })
        })
    })
    .catch(err => {
      // res.status(500).json({ message: 'deleting product failed.' })
      next(err)
      // let error = new Error(err)
      // error.httpStatusCode = 500;
      // return next(error)
    })



}