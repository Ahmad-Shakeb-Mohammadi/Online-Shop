
const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

const auth = require("../middlewares/is-auth")

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get("/products/:productId",shopController.getProduct)

router.get('/cart',auth, shopController.getCart);

router.post("/cart/:productId", auth, shopController.postCart)

router.get("/checkout",auth, shopController.getCheckout)

router.get('/orders', auth, shopController.getOrders);

router.post("/delete-product-item", auth, shopController.postDeleteCartItem)

router.get("/create-order", auth, shopController.postOrders)

router.get("/invoice/:orderId",auth, shopController.getInvoice)

module.exports = router;
