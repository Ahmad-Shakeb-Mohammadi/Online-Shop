const express = require('express');
const adminController = require('../controllers/admin');
const { check, body } = require("express-validator");

const router = express.Router();

const auth = require("../middlewares/is-auth")

// /admin/add-product => GET
router.get('/add-product', auth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', auth, adminController.getProducts);

// // /admin/add-product => POST
router.post('/add-product', auth,
    body("title", "Title is invalid").trim().notEmpty().isLength({ min: 3 }).withMessage("At least 3 char"),
    body("price").isFloat().withMessage("price must be of type number"),
    body("description").trim().notEmpty().withMessage("Description can't be empty").isLength({ min: 5 })
        .withMessage("description can't be less than 5 char")
    , adminController.postAddProduct);

router.get("/edit-product/:productId", auth, adminController.getEditProduct)

router.post("/edit-product/:productId", auth,
    body("title", "Title is invalid").trim().notEmpty().isLength({ min: 3 }).withMessage("At least 3 char"),
    body("price").isFloat().withMessage("price must be of type number"),
    body("description").trim().notEmpty().withMessage("Description can't be empty").isLength({ min: 5 })
        .withMessage("description can't be less than 5 char")
    , adminController.postEditProduct)

// router.post("/delete-product/:productId", auth, adminController.deleteProduct)      //now we use async js 
router.delete("/product/:productId",auth,adminController.deleteProduct)

module.exports = router;
