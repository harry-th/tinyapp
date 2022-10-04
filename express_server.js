const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.post('/urls',(req,res)=>{
  let id = makeId();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
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
  
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});