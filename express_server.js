const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

let cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');

const {checkUserInfo, makeId, urlsForUser} = require('./helpers.js');
const {authorized, authorizedAction, unAuthorized} = require('./middleware/authorization');
const {users, urlDatabase} = require('./db/pseudoDB');

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['hello']
}));


//main pages
app.get('/', (req, res) => {
  if (!req.session.userId) res.redirect('/urls/login');
  else
    res.redirect('/urls');
});
app.get("/urls", (req, res) => {
  let urls = urlsForUser(req.session.userId, urlDatabase);
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
//login and out
app.get('/urls/login', unAuthorized, (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userId: req.session.userId,
    users: users,
    taken: null
  };
  res.render("urls_login", templateVars);
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

//register
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

//urls making deleting viewing and redirecting
app.post('/urls', authorized(), (req, res) => {
  let id = makeId();
  const { longURL } = req.body;
  urlDatabase[id] = { longURL, userID: req.session.userId };
  res.redirect(`/urls/${id}`);
});
app.get("/urls/:id", authorizedAction(urlDatabase), (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userId: req.session.userId,
    users: users,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});
app.put("/urls/:id", authorizedAction(urlDatabase), (req, res) => {
  let { longURL } = req.body;
  urlDatabase[req.params.id] = { longURL, userID: req.session.userId };
  res.redirect('/urls');
});
app.delete("/urls/:id/delete", authorizedAction(urlDatabase), (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});
app.get("/u/:id", (req, res) => {
  let url = urlDatabase[req.params.id];
  if (!url) res.end('there\'s nothing here...');
  else
    res.redirect(url.longURL);
});


//not found
app.use((req,res)=>{
  res.status(404).send('nothing here...');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
