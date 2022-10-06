const express = require("express");
const app = express();
let cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080

app.use(cookieParser());

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
let authorized = (redirect) => {
  return (req,res,next) => {
    if (req.cookies["user_id"]) {
      next();
    } else {
      if (!redirect) res.end("you aren't authorized to do that");
      res.redirect(redirect);
    }
  };
};
let authorizedAction = (req,res,next) => {
  if (req.cookies['user_id'] === urlDatabase[req.params.id].userID) {
    next();
  } else {
    res.send('you are not authorized to do that');
  }
};
let unAuthorized = (req,res,next) => {
  if (!req.cookies["user_id"]) {
    next();
  } else {
    res.redirect('/urls');
  }
};

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/urls", (req, res) => {
  let urls = {};
  for (const link in urlDatabase) {
    if (urlDatabase[link].userID === req.cookies["user_id"]) {
      urls[link] = urlDatabase[link];
    }
  }
  const templateVars = {
    urls: urls,
    userId: req.cookies["user_id"],
    users: users,
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/new",authorized('/urls/login'), (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userId: req.cookies["user_id"],
    users: users,
  };
  res.render("urls_new", templateVars);
});
app.get("/urls/register",unAuthorized, (req,res)=>{
  const templateVars = {
    urls: urlDatabase,
    userId: req.cookies["user_id"],
    users: users,
    taken : null
  };
  res.render("urls_register", templateVars);
});
app.post("/register",unAuthorized, (req,res)=>{
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
app.post('/urls',authorized(),(req,res)=>{
  let id = makeId();
  const {longURL} = req.body;
  urlDatabase[id] = {longURL, userID:req.cookies['user_id']};
  res.redirect(`/urls/${id}`);
});
app.get('/urls/login',unAuthorized,(req,res)=>{
  const templateVars = {
    urls: urlDatabase,
    userId: req.cookies["user_id"],
    users: users,
    taken : null
  };
  res.render("urls_login", templateVars);
});
app.get("/urls/:id",authorizedAction, (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userId: req.cookies["user_id"],
    users: users,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});
app.post("/urls/:id",authorizedAction,(req,res)=>{
  let {longURL} = req.body;
  urlDatabase[req.params.id] = {longURL,userID:req.cookies["user_id"]};
  res.redirect('/urls');
});
app.get("/u/:id", (req, res) => {
  console.log(urlDatabase,[req.params.id]);
  let url = urlDatabase[req.params.id].longURL;
  // console.log(url);
  if (!url) res.end('there\'s nothing here...');
  res.redirect(url);
});
app.post("/urls/:id/delete",authorizedAction, (req,res)=> {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});
app.post('/login',unAuthorized,(req, res)=>{
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
app.get('*',(req,res)=>{
  res.send("there's nothing here...");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
