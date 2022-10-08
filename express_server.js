const express = require("express");
let cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');
const app = express();

const checkUserInfo = require('./helpers.js');
const PORT = 8080; // default port 8080

app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['hello']
}));
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
const users = {
  'aJ48lW': {
    id: "aJ48lW",
    username: 'johnny',
    email: "a@a.com",
    password: bcrypt.hashSync("a", 10),
  }
};
//stackoverflow random string function slightly altered
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
let authorized = (redirect) => {
  return (req, res, next) => {
    if (req.session.userId) {
      next();
    } else {
      if (!redirect) res.end("you aren't authorized to do that");
      res.redirect(redirect);
    }
  };
};
let authorizedAction = (req, res, next) => {
  if (!urlDatabase[req.params.id]) res.end('this url doesn\'t exist');
  if (req.session.userId === urlDatabase[req.params.id].userID) {
    next();
  } else {
    res.send('you are not authorized to do that');
  }
};
let unAuthorized = (req, res, next) => {
  if (!req.session.userId) {
    next();
  } else {
    res.redirect('/urls');
  }
};
const urlsForUser = (id) => {
  let urls = {};
  for (const link in urlDatabase) {
    if (urlDatabase[link].userID === id) {
      urls[link] = urlDatabase[link];
    }
  }
  return urls;
};
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  if (!req.session.userId) res.redirect('/urls/login');
  res.redirect('/urls');
});
app.get("/urls", (req, res) => {
  let urls = urlsForUser(req.session.userId);
  const templateVars = {
    urls: urls,
    userId: req.session.userId,
    users: users,
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", authorized('/urls/login'), (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userId: req.session.userId,
    users: users,
  };
  res.render("urls_new", templateVars);
});
app.get("/urls/register", unAuthorized, (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userId: req.session.userId,
    users: users,
    taken: null
  };
  res.render("urls_register", templateVars);
});
app.post("/register", unAuthorized, (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userId: req.session.userId,
    users: users,
    taken: 'that email is taken'
  };
  let { username, email, password } = req.body;
  if (checkUserInfo(users, { email: email }, ['email'])) {
    return res.status(400).render("urls_register", templateVars);
  }
  let id = makeId();
  password = bcrypt.hashSync(password, 10);
  users[id] = { id, username, email, password };
  req.session.userId = id;
  res.redirect("/urls");
});
app.post('/urls', authorized(), (req, res) => {
  let id = makeId();
  const { longURL } = req.body;
  urlDatabase[id] = { longURL, userID: req.session.userId };
  res.redirect(`/urls/${id}`);
});
app.get('/urls/login', unAuthorized, (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userId: req.session.userId,
    users: users,
    taken: null
  };
  res.render("urls_login", templateVars);
});
app.get("/urls/:id", authorizedAction, (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userId: req.session.userId,
    users: users,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});
app.put("/urls/:id", authorizedAction, (req, res) => {
  let { longURL } = req.body;
  urlDatabase[req.params.id] = { longURL, userID: req.session.userId };
  res.redirect('/urls');
});
app.delete("/urls/:id/delete", authorizedAction, (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});
app.get("/u/:id", (req, res) => {
  let url = urlDatabase[req.params.id];
  if (!url) res.end('there\'s nothing here...');
  res.redirect(url.longURL);
});
app.post('/login', unAuthorized, (req, res) => {
  let {email, password} = req.body;
  if (!email || !password) res.send('fields must be filled out');
  let check = checkUserInfo(users, req.body, ['email', 'password']);
  if (check) {
    req.session.userId = check;
    return res.redirect('/urls');
  }
  let templateVars = {
    taken: 'incorrect login information',
    userId: req.session.userId,
    users: users,
  };
  res.status(400).render('urls_login', templateVars);
});
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});
app.get('*', (req, res) => {
  res.send("there's nothing here...");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
