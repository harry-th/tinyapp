let bcrypt = require('bcryptjs');

let checkUserInfo = (users, body, requirements) => {
  for (let required of requirements) {
    if (!body[required]) return false;
  }
  userloop:
  for (let user in users) {
    for (let input in body) {
      console.log(users[user][input],body[input]);
      if (input === 'password') {
        if (!bcrypt.compareSync(body[input], users[user][input])) {
          console.log('jhello');
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
module.exports = checkUserInfo;
