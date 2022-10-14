const bcrypt = require('bcryptjs');

const urlDatabase = {
};
const users = {
  'aJ48lW': {
    id: "aJ48lW",
    username: 'johnny',
    email: "a@a.com",
    password: bcrypt.hashSync("a", 10),
  }
};

module.exports = {urlDatabase, users};