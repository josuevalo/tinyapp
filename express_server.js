const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const { generateRandomString, userLookupByEmail, urlsForUser } = require("./helpers.js")

const { users, urlDatabase } = require("./database.js")
// const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');

// app.use(cookieParser())
app.use(cookieSession({
  name: 'session',
  keys: ["Secret, Secret, so many secrets", "key"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");


// const userRandomIDPassword = "purple-monkey-dinosaur"
// const aJ48lWPassword = "dishwasher-funk"
// // Because default users are hardcoded, passwords are also included. In order to prevent the passwords from being stored in the users object as plain text, they are put into variables and then stored as hashes in the users object.

// // All of new users' passwords are stored as hashes.

// const users = {
//   "userRandomID": {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: bcrypt.hashSync(userRandomIDPassword, 10)
//   },
//   "aJ48lW": {
//     id: "aJ48lW",
//     email: "user2@example.com",
//     password: bcrypt.hashSync(aJ48lWPassword, 10)
//   }
// }
// const urlDatabase = {
//   b6UTxQ: {
//     longURL: "https://www.tsn.ca",
//     userID: "aJ48lB"
//   },
//   i3BoGr: {
//     longURL: "https://www.google.ca",
//     userID: "aJ48lW"
//   }
// };

// const generateRandomString = function () {
//   let characters = "abcdefghijklmnopqrstuvwxyz1234567890";
//   let random = "";
//   for (let i = 0; i < 6; i++) {
//     random += characters[Math.floor(Math.random() * characters.length)];
//   }
//   return random;
// };

// const userLookupByEmail = (email, database) => {
//   for (const userId in database) {
//     const user = database[userId];
//     if (user.email === email) {
//       return user;
//     }
//   }
//   return null;
// }

// const urlsForUser = function (id) {
//   if (!id) {
//     return {}
//   }
//   let newObject = {}
//   for (let urls in urlDatabase) {
//     const check = urlDatabase[urls]
//     if (id === check.userID) {
//       newObject[urls] = check
//     }
//   }
//   return newObject
// }

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
    return
  }
  const cookie = req.session.user_id
  const user = users[cookie]
  const templateVars = {
    user: user
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const user = req.session.user_id
  if (!user) {
    // If the user is not logged in, send an error
    return res.status(401).send("Error: you must be logged in to access.");
  }
  console.log(req.body);
  const newUrl = generateRandomString();
  const url = {
    longURL: req.body.longURL,
    userID: user
  }
  urlDatabase[newUrl] = url;
  console.log("after", urlDatabase)
  res.redirect(`/urls/${newUrl}`);
});


app.get("/urls", (req, res) => {
  const cookie = req.session.user_id
  const user = users[cookie];
  // if (!cookie) {
  //   // If the user is not logged in, send an error
  //     return res.status(400).send("Error: you must be logged in to access.");
  // }

  const compareActiveUser = urlsForUser(cookie);
  const templateVars = {
    urls: compareActiveUser,
    user: user
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
  const cookie = req.session.user_id
  const user = users[cookie]
  const userId = urlDatabase[req.params.shortURL] ? urlDatabase[req.params.shortURL].userID : undefined
  let loggedIn = false
  if (userId === cookie) {
    loggedIn = true
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


app.post("/urls/:shortURL/delete", (req, res) => {
  const user = req.session.user_id
  if (!user) {
    // If the user is not logged in, send an error
    return res.status(403).send("Error: you must be logged in to access.");
  }
  console.log("Deleted:", req.params.shortURL, urlDatabase[req.params.shortURL]);
  delete urlDatabase[req.params.shortURL]
  res.redirect('/urls');
});

// if (!email || !password) {
//   return res.status(400).send("email and password cannot be blank");
// }
// res.cookie('user_id', user.id);
// res.redirect('/secrets')
// })
app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const user = userLookupByEmail(email, users)
  
  if (!user) {
    return res.status(403).send("Sorry! User email does not exist")
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('Error. Oops! Something went wrong.')
  }
  req.session.user_id = user.id;
  console.log(`User ${email} is logged in.`)
  res.redirect('/urls');
});

// This is editing a URL
app.post("/urls/:id", (req, res) => {
  const user = req.session.user_id
  if (!user) {
    // If the user is not logged in, send an error
    return res.status(401).send("Error: you must be logged in to access.");
  }
  const id = req.params.id;
  console.log("req.body--->", req.body)
  const updatedUrl = req.body.newUrl
  urlDatabase[id].longURL = updatedUrl;
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  req.session = null
  console.log("User logged out")
  res.redirect('/urls');
});

/// Registration

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls')
  }
  const cookie = req.session.user_id
  const user = users[cookie]
  const templateVars = {
    user: user,
    users: users
  }
  res.render("urls_registration", templateVars)
});


app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  // const password = req.body.password
  if (!email || !hashedPassword) {
    return res.status(403).send("Oops! Email and password fields cannot be blank.")
  }

  const userId = userLookupByEmail(email, users);
  console.log('user--->', userId);
  if (userId) {
    return res.status(403).send("Oops! The email seems to already exist")
  }

  const user = {
    id: id,
    email: email,
    password: hashedPassword
  }
  console.log("USER USER USER USER", user)
  users[id] = user

  req.session.user_id = user.id;
  console.log(`User ${user.email} is logged in.`);
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls')
  }
  const cookie = req.session.user_id
  const user = users[cookie]
  const templateVars = {
    user: user,
    users: users
  }

  res.render('urls_login', templateVars);
})


///
/// Listen - open port
///

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
