const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

const users = require("./routes/user.js");
const posts = require("./routes/post.js");

app.use(cookieParser("adnan"));

app.get("/getsignedcookie", (req, res) => {
  res.cookie("made in", "india", { signed: true });
  res.send("Signed cookie sent");
});

app.get("/verify", (req, res) => {
  console.log("Cookies : ", req.cookies);
  console.log("Signed Cookies : ", req.signedCookies);
  res.send("Verified");
});

app.get("/greet", (req, res) => {
  let { name = "user" } = req.cookies;
  res.send(`Hi! ${name}`);
});

app.get("/getcookies", (req, res) => {
  res.cookie("greet", "hello");
  res.cookie("madeInIndia", "Assalam Alaikum");
  res.send("Sent you some cookies");
});

app.get("/", (req, res) => {
  console.dir(req.cookies);
  res.send("Hi! I'm root");
});

// USERS
app.use("/users", users);

// POSTS
app.use("/posts", posts);

app.listen(3000, () => {
  console.log("Server is listening to http://localhost:3000");
});
