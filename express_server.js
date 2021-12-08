const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const generateRandomString = function () {
  let characters = "abcdefghijklmnopqrstuvwxyz1234567890";
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += characters[Math.floor(Math.random() * characters.length)];
  }
  return random;
};


app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies.username 
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  const newUrl = generateRandomString();
  urlDatabase[newUrl] = req.body.longURL;
  res.redirect(`/urls/${newUrl}`);
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase, 
    username: req.cookies.username 
  };
  res.render("urls_index", templateVars);
});


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
    username: req.cookies.username 
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const redirectNewUrl = urlDatabase[req.params.shortURL];
  res.redirect(redirectNewUrl);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("Deleted:", req.params.shortURL, urlDatabase[req.params.shortURL]);
  delete urlDatabase[req.params.shortURL]
  res.redirect('/urls');
});


app.post("/login", (req, res) => {
  const user = req.body.login
  res.cookie('username', user)
  console.log(`User ${user} is logged in.`)
  res.redirect('/urls');
});


app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  console.log("req.body--->", req.body)
  const updatedUrl = req.body.newUrl
  urlDatabase[id] = updatedUrl;
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  console.log("User logged out")
  res.redirect('/urls');
});

///
/// Registration
///
app.get("/register", (req, res) => {
  const templateVars = { 
    username: req.cookies.username,
    users: users
  }
    res.render("urls_registration", templateVars)
});


app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email
  const password = req.body.password
  const user = {
    id: id,
    email: email,
    password: password
  }
 users[id] = user
  res.cookie('user_id', id);
  console.log("USERS!!", users)
  console.log(`User ${user.id} is logged in.`);
  res.redirect('/urls');
});

///
/// Listen - open port
///

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});