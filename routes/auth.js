const express = require('express');
const router = express.Router();
const authController = require("../controllers/auth")
const { check, body } = require("express-validator")
const User = require("../models/user")

router.get("/login", authController.getLogin)

router.post("/login",
    body('email').isEmail().withMessage("Enter a valid email address").normalizeEmail(), // sanitizing
    body('password',"Enter a valid password").trim().isLength({min: 8}).isAlphanumeric()
    ,authController.postLogin)

router.post("/logout", authController.postLogout)

router.get("/signup", authController.getSignup)

router.post("/signup",
    [
        check('email').isEmail().normalizeEmail().withMessage('Please Enter a valid Email.')
            .custom((value, { req }) => {
                return User.findOne({ email: value })
                    .then(user => {
                        if (user) {
                            // req.flash("error", "Email is taken")
                            return Promise.reject("The email has already been taken")
                        }
                    })
            })
        ,
        body('password', "password should be alphanumeric and at least 8 characters").trim().isLength({ min: 8 }).isAlphanumeric()
        ,
        body('confirmPassword').trim().custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Confirm password doesnt match.")
            }
            return true
        })
    ]
    , authController.postSignup)

router.get("/reset", authController.getReset)

router.post("/reset", authController.postReset)

router.get("/reset/:token", authController.getNewPassword)

router.post("/newPassword", authController.postNewPassword)

module.exports = router;