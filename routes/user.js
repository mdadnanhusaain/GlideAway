// Packages
const express = require("express");
const router = express.Router();
const passport = require("passport");

// Custom Objects
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const User = require("../models/user.js");
const { saveRedirectUrl } = require("../middleware/middlewares.js");

// 1. SignUp Route
router.get("/signup", (req, res) => {
  // res.send("form");
  res.render("users/signup.ejs");
});

// 2. Create Route
router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });
      let registeredUser = await User.register(newUser, password);
      console.log(registeredUser);
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", `Hi ${username}!  Welcome to Wanderlust`);
        res.redirect("/listings");
      });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/signup");
    }
  })
);

// 3. Login Route
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

// 4. Login Validation Route
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  wrapAsync(async (req, res) => {
    let { username } = req.body;
    req.flash(
      "success",
      `Welcome to Wanderlust! You are logged in as @${username}`
    );
    if (res.locals.redirectUrl) res.locals.redirectUrl = res.locals.redirectUrl;
    else res.locals.redirectUrl = "/listings";
    res.redirect(res.locals.redirectUrl);
  })
);

// 5. Logout Route
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
});

module.exports = router;
