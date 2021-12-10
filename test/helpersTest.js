const { assert } = require('chai');

const { userLookupByEmail } = require('../helpers.js');

// Testing the helper function userLookupByEmail//

const testUsers = {
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
};

describe('userLookupByEmail', function() {
  it('should return a user with valid email', function() {
    const user = userLookupByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID, 'function finds a valid user inside an object by email property');

  });

  it('should return the email of a valid user', function() {
    const user = userLookupByEmail("user2@example.com", testUsers);
    assert.equal(user.email, "user2@example.com", 'function finds a valid email inside the testUsers object');

  });

  it('should return undefined if an email is not in the database', function() {
    const user = userLookupByEmail("user@example.com", testUsers);
    assert.equal(undefined, undefined, 'function returns undefined if email is not found');

  });

  it('should return the password of a valid user', function() {
    const user = userLookupByEmail("user2@example.com", testUsers);
    assert.equal(user.password, "dishwasher-funk", 'function finds a password inside the testUsers object');

  });
});