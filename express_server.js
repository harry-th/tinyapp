const express = require("express");
const app = express();
let cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080

app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {
  '52qUKt': {
    id: "52qUKt",
    username:'johnny',
    email: "a@a.com",
    password: "a",
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

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userId: req.cookies["user_id"],
    users: users,
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userId: req.cookies["user_id"],
    users: users,
  };
  res.render("urls_new", templateVars);
});
app.get("/urls/register", (req,res)=>{
  const templateVars = {
    urls: urlDatabase,
    userId: req.cookies["user_id"],
    users: users,
    taken : null
  };
  res.render("urls_register", templateVars);
});
app.post("/register",(req,res)=>{
  const templateVars = {
    urls: urlDatabase,
    userId: req.cookies["user_id"],
    users: users,
    taken :'that email is taken'
  };
  let {username, email, password} = req.body;
  let id = makeId();
  for (const user in users) {
    if (users[user].email === email) {
      res.status(400).render("urls_register",templateVars);
    }
    users[id] = {id, username, email, password};

  }
  res.cookie('user_id', id);
  res.redirect("/urls");
});
app.post('/urls',(req,res)=>{
  let id = makeId();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});
app.get('/urls/login',(req,res)=>{
  const templateVars = {
    urls: urlDatabase,
    userId: req.cookies["user_id"],
    users: users,
    taken : null
  };
  res.render("urls_login", templateVars);
});
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userId: req.cookies["user_id"],
    users: users,
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});
app.post("/urls/:id",(req,res)=>{
  urlDatabase[req.params.id] = req.body.longUrlName;
  res.redirect('/urls');
});
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});
app.post("/urls/:id/delete", (req,res)=> {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});
app.post('/login',(req, res)=>{
  // const templateVars  = {
  //
  // };
  let {userInfo, password} = req.body;
  for (const user in users) {
    if ((users[user].email === userInfo || users[user].username === userInfo) && users[user].password === password) {
      res.cookie('user_id',user);
      res.redirect('/urls');
    }
  }
  let templateVars = {
    taken: 'incorrect login information',
    userId: req.cookies["user_id"],
    users: users,
  };
  res.status(400).render('urls_login', templateVars);
});
app.post('/logout',(req, res)=>{
  res.clearCookie('user_id');
  res.redirect('/urls');
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});