const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const { generateRandomString, userLookupByEmail, urlsForUser } = require("./helpers.js");

const { users, urlDatabase } = require("./database.js");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');


app.use(cookieSession({
  name: 'session',
  keys: ["Secret, Secret, so many secrets", "key"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");


app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
    return;
  }
  const cookie = req.session.user_id;
  const user = users[cookie];
  const templateVars = {
    user: user
  };
  res.render("urls_new", templateVars);
});

/// POST AND GET REQUESTS FOR /URLS ROUTE ///

app.post("/urls", (req, res) => {
  const user = req.session.user_id;
  if (!user) {
    // If the user is not logged in, send an error
    return res.status(401).send("Error: you must be logged in to access.");
  }
  const newUrl = generateRandomString();
  const url = {
    longURL: req.body.longURL,
    userID: user
  };
  urlDatabase[newUrl] = url;
  res.redirect(`/urls/${newUrl}`);
});

app.get("/urls", (req, res) => {
  const cookie = req.session.user_id;
  const user = users[cookie];

  const compareActiveUser = urlsForUser(cookie);
  const templateVars = {
    urls: compareActiveUser,
    user: user
  };
  res.render("urls_index", templateVars);
});

/// TEST ROUTES ///

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

/// GET ROUTES FOR SHORT URL ///

app.get("/urls/:shortURL", (req, res) => {
  const cookie = req.session.user_id;
  const user = users[cookie];
  const userId = urlDatabase[req.params.shortURL] ? urlDatabase[req.params.shortURL].userID : undefined;
  let loggedIn = false;
  if (userId === cookie) {
    loggedIn = true;
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL] ? urlDatabase[req.params.shortURL].longURL : undefined,
    user: user,
    loggedIn: loggedIn
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("Page does not exist");
  }
  const redirectNewUrl = urlDatabase[req.params.shortURL].longURL;
  res.redirect(redirectNewUrl);
});

/// POST ROUTE FOR DELETE URL ///

app.post("/urls/:shortURL/delete", (req, res) => {
  const user = req.session.user_id;
  if (!user) {
    // If the user is not logged in, send an error
    return res.status(403).send("Error: you must be logged in to access.");
  }
  console.log("Deleted:", req.params.shortURL, urlDatabase[req.params.shortURL]);
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

/// GET AND POST ROUTES FOR LOGIN ///

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const cookie = req.session.user_id;
  const user = users[cookie];
  const templateVars = {
    user: user,
    users: users
  };

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = userLookupByEmail(email, users);
  // error handling and checks //
  if (!user) {
    return res.status(403).send("Sorry! User email does not exist");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('Error. Oops! Something went wrong.');
  }
  req.session.user_id = user.id;
  console.log(`User ${email} is logged in.`);
  res.redirect('/urls');
});

/// POST ROUTE FOR EDITING A URL ///
app.post("/urls/:id", (req, res) => {
  const user = req.session.user_id;
  if (!user) {
    // If the user is not logged in, send an error //
    return res.status(401).send("Error: you must be logged in to access.");
  }
  const id = req.params.id;
  const updatedUrl = req.body.newUrl;
  urlDatabase[id].longURL = updatedUrl;
  res.redirect('/urls');
});

/// POST ROUTE FOR LOGGING OUT ///
app.post("/logout", (req, res) => {
  req.session = null;
  console.log("User logged out");
  res.redirect('/urls');
});

/// GET AND POST ROUTES FOR REGISTERING NEW USER ///

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const cookie = req.session.user_id;
  const user = users[cookie];
  const templateVars = {
    user: user,
    users: users
  };
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  // error handling and checks //
  if (!email || !hashedPassword) {
    return res.status(403).send("Oops! Email and password fields cannot be blank.");
  }
  const userId = userLookupByEmail(email, users);
  if (userId) {
    return res.status(403).send("Oops! The email seems to already exist");
  }
// creating new user object //
  const user = {
    id: id,
    email: email,
    password: hashedPassword
  };
  users[id] = user;

  req.session.user_id = user.id;
  console.log(`User ${user.email} is logged in.`);
  res.redirect('/urls');
});
  res.render('urls_login', templateVars);
});

/// LISTEN - OPEN PORT ///

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
