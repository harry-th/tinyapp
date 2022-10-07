const { assert } = require('chai');
const bcrypt = require('bcryptjs');
const checkUserInfo  = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur",10)

  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk",10)
  }
};

describe('getUserByEmail', function() {
  it('should return the id if email and password is correct', function() {
    assert.equal(checkUserInfo(testUsers,{email: "user2@example.com",
      password: "dishwasher-funk"},['email','password']), 'user2RandomID');
  });
  it('should return false if the email is incorrect', function() {
    assert.isFalse(checkUserInfo(testUsers,{email: "user2@examples.com",
      password: "dishwasher-funk"},['email','password']), 'user2RandomID');
  });
  it('should return false if password is incorrect', function() {
    assert.isFalse(checkUserInfo(testUsers,{email: "user2@example.com",
      password: "dishwasher-funk-purple"},['email','password']), 'user2RandomID');
  });
});