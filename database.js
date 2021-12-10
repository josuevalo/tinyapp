const bcrypt = require('bcryptjs');

const userRandomIDPassword = "purple-monkey-dinosaur";
const aJ48lWPassword = "dishwasher-funk";
/// Because default users are hardcoded, passwords are also included. In order to prevent the passwords from being stored in the users object as plain text, they are put into variables and then stored as hashes in the users object. ///

/// All of new users' passwords are stored as hashes. ///

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync(userRandomIDPassword, 10)
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "user2@example.com",
    password: bcrypt.hashSync(aJ48lWPassword, 10)
  }
};

// Default URL database for testing purposes ///

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lB"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

module.exports = { users, urlDatabase };