// const server = require("/express_server.js")
const { users, urlDatabase } = require("./database.js")

const generateRandomString = function () {
  let characters = "abcdefghijklmnopqrstuvwxyz1234567890";
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += characters[Math.floor(Math.random() * characters.length)];
  }
  return random;
};


const userLookupByEmail = (email, database) => {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

const urlsForUser = function (id) {
  if (!id) {
    return {}
  }
  let newObject = {}
  for (let urls in urlDatabase) {
    const check = urlDatabase[urls]
    if (id === check.userID) {
      newObject[urls] = check
    }
  }
  return newObject
}

module.exports = { generateRandomString, userLookupByEmail, urlsForUser }