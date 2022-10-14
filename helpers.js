let bcrypt = require('bcryptjs');

let checkUserInfo = (users, body, requirements) => {
  for (let required of requirements) {
    if (!body[required]) return false;
  }
  userloop:
  for (let user in users) {
    for (let input in body) {
      if (input === 'password') {
        if (!bcrypt.compareSync(body[input], users[user][input])) {
          continue userloop;
        }
      } else if (users[user][input] !== body[input]) {
        continue userloop;
      }
    }
    return user;
  }
  return false;
};

const makeId = function() {
  let result = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let i = 0;
  while (i < 6) {
    result += chars.charAt(Math.floor(Math.random() *
      chars.length));
    i++;
  }
  return result;
};
const urlsForUser = (id, urlDatabase) => {
  let urls = {};
  for (const link in urlDatabase) {
    if (urlDatabase[link].userID === id) {
      urls[link] = urlDatabase[link];
    }
  }
  return urls;
};
module.exports = {checkUserInfo, makeId, urlsForUser};
