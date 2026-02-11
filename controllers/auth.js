const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { Resend } = require("resend")
const crypto = require("crypto");
const { validationResult } = require("express-validator");


exports.getLogin = (req, res, next) => {
  // var isAuthenticated = req.get("Cookie").split(";")[2].trim().split("=")[1] === 'true'
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    emailMessage: req.flash('emailError'),
    passwordMessage: req.flash("passwordError"),
    resetMessage: req.flash("resetMessage"),
    oldInputs: {
      email: "",
      password: ""
    },
    validationErr: []
  });
};

exports.postLogin = (req, res, next) => {
  // req.isAuthenticated = true  # for each response req ends and new one will be send to server.
  // res.setHeader('Set-Cookie','logged-in=true')    # cookie stores sensetive data on the client side

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render("auth/login", {
      pageTitle: 'Login',
      path: '/login',
      emailMessage: req.flash("emailError"),
      passwordMessage: req.flash("passwordError"),
      oldInputs: {
        email: req.body.email,
        password: req.body.password
      },
      validationErr: errors.array()
    })
  }
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('emailError', 'User doesnt exists')
        return res.redirect("/login")
      }
      bcrypt.compare(password, user.password)
        .then(boolResult => {
          if (boolResult) {
            req.session.isLoggedIn = true
            req.session.user = user
            req.session.save(() => {              // you dont need to call this but i needed a callback cause i will be redirected independantly
              res.redirect("/")                    // before session is written in senarios where it takes time to write 
            })
          } else {
            req.flash("passwordError", "Password is wrong.")
            return res.redirect("/login")
          }
        })
    })
    .catch(err => {
      // console.log(err)
      let error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })

};

exports.postLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/")
  })
}

exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    pageTitle: 'Sign Up',
    path: '/signup',
    errorMessage: req.flash("error"),
    oldInput: {
      email: "",
      password: "",
      confirmPassword: ""
    },
    validationErr: []
  })
}

exports.postSignup = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: 'Sign Up',
      path: '/signup',
      errorMessage: result.array()[0].msg,
      oldInput: {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
      },
      validationErr: result.array()
    })
  }
  const password = req.body.password;
  const email = req.body.email;

  bcrypt.hash(password, 14)
    .then(hashedPassword => {
      return User.create({
        email: email,
        password: hashedPassword
      })
    })
    .then(result => {
      res.redirect("/login")
    })
    .catch(err => {
      // console.log(err)
      let error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })
}


exports.getReset = (req, res) => {
  res.render("auth/reset", {
    path: "/rest",
    errorMessage: req.flash("error"),
    pageTitle: "Reset Password"
  })
}

exports.postReset = (req, res, next) => {
  const email = req.body.email
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset")
    }
    const token = buffer.toString('hex')
    User.findOne({ email: email })
      .then(user => {
        if (!user) {
          req.flash("error", "No user with this email found.")
          return res.redirect("/reset")
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000
        return user.save()
      })
      .then(user => {
        if (!user) {
          return null
        }
        req.flash("resetMessage","Reset Link sent to mohammadiahmadshakeb79@gmail.com")
        res.redirect("/login")
        try {
          const resend = new Resend("re_Abhis9ZZ_MvejwFQq67q9qSVPXRzYuFx9");
          resend.emails.send({
            from: "Resend <onboarding@resend.dev>",
            to: "mohammadiahmadshakeb79@gmail.com",
            subject: "Reset Password",
            html: `<h1>You requested a Password Reset</h1>
              <p>Click here to <a href='${process.env.CLIENT_URL}/reset/${token}'>Reset Password</a></p>
            `
          })
        } catch (err) {
          console.log(err)
        }
      })
      .catch(err => {
        // console.log(err)
        let error = new Error(err)
        error.httpStatusCode = 500;
        return next(error)
      })
  })
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      if (user) {
        return res.render("auth/newpassword", {
          path: "/newPassword",
          errorMessage: req.flash("error"),
          pageTitle: "New Password",
          userId: user._id.toString(),
          token: token
        })
      } else {
        res.redirect("/reset")
      }
    })
    .catch(err => {
      // console.log(err)
      let error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })
}

exports.postNewPassword = (req, res, next) => {
  const id = req.body.userId;
  const password = req.body.password;
  const resetToken = req.body.resetToken;
  User.findOne({ _id: id, resetToken, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      if (!user) {
        return res.redirect("/reset")
      }
      bcrypt.hash(password, 12).then(hashed => {
        user.password = hashed;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        return user.save()
      })
        .then(user => {
          req.flash("resetMessage","Password has been updated successfully!")
          return res.redirect("/login")
        })
    })
    .catch(err => {
      // console.log(err)
      let error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })
}