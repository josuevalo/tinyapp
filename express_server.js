const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

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

app.get("/register", (req, res) => {
  const templateVars = { 
    username: req.cookies.username 
  }
    res.render("urls_registration", templateVars)
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});