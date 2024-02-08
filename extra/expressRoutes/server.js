const express = require("express");
const app = express();
const path = require("path");

const users = require("./routes/user.js");
const posts = require("./routes/post.js");

// const cookieParser = require("cookie-parser");

// app.use(cookieParser("adnan"));

// app.get("/getsignedcookie", (req, res) => {
//   res.cookie("made in", "india", { signed: true });
//   res.send("Signed cookie sent");
// });

// app.get("/verify", (req, res) => {
//   console.log("Cookies : ", req.cookies);
//   console.log("Signed Cookies : ", req.signedCookies);
//   res.send("Verified");
// });

// app.get("/greet", (req, res) => {
//   let { name = "user" } = req.cookies;
//   res.send(`Hi! ${name}`);
// });

// app.get("/getcookies", (req, res) => {
//   res.cookie("greet", "hello");
//   res.cookie("madeInIndia", "Assalam Alaikum");
//   res.send("Sent you some cookies");
// });

// app.get("/", (req, res) => {
//   console.dir(req.cookies);
//   res.send("Hi! I'm root");
// });

// // USERS
// app.use("/users", users);

// // POSTS
// app.use("/posts", posts);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const session = require("express-session");
const flash = require("connect-flash");

const sessionOptions = {
  secret: "mdadnanhusaain",
  resave: false,
  saveUninitialized: true,
};

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  next();
});

app.get("/register", (req, res) => {
  let { name = "anonymous" } = req.query;
  // console.log(req.session);
  req.session.name = name;
  // console.log(req.session.name);
  if (name === "anonymous") {
    req.flash("error", "user not registered");
  } else {
    req.flash("success", "user registered successfully!");
  }
  // res.send(name);
  res.redirect("/hello");
});

app.get("/hello", (req, res) => {
  // res.send(`Hello ${req.session.name}`);
  // console.log(req.flash("success"));
  // res.render("page.ejs", { name: req.session.name, msg: req.flash("success") });
  // res.locals.msg = req.flash("success");
  // res.locals.successMsg = req.flash("success");
  // res.locals.errorMsg = req.flash("error");

  res.render("page.ejs", { name: req.session.name });
});

// app.get("/reqcount", (req, res) => {
//   if (req.session.count) {
//     req.session.count++;
//   } else {
//     req.session.count = 1;
//   }
//   res.send(`You sent a request ${req.session.count} times`);
// });

// app.get("/test", (req, res) => {
//   res.send("test successful");
// });

app.listen(3000, () => {
  console.log("Server is listening to http://localhost:3000");
});
