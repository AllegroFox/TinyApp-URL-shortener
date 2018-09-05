

const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");


//generates a 6 character alphanumeric string
const generateRandomString = function() {

  let randomString = "";
  randomString += Math.random().toString(36).substring(2, 8);

  return randomString;
};


//stores user information
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },

  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },

  "foxyOverlord": {
    id: "foxyOverlord",
    email: "emily@example.com",
    password: "correct-horse-battery-staple"
  }
};



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/register", (req, res) => {
  res.render("urls_register");
});


app.post("/register", (req, res) => {
  let randomID = generateRandomString();
  users[randomID] = {id: randomID, email: req.body["email"], password: req.body["password"]};

  res.cookie('userID', randomID);
  // console.log(users);// debug statement to see updated user object
  res.redirect(302,"/urls");
});


app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});


app.post("/login", (req, res) => {
  //console.log(req.body["username"]);
  res.cookie('username', req.body["username"]);
  //console.log('Cookies: ', req.cookies);
  res.redirect(302, "/urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect(302, "/urls");
})


app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body["longURL"];

  // console.log(req.body["longURL"]);
  // console.log(urlDatabase);// debug statement to see POST parameters
  res.redirect(302,`http://localhost:8080/urls/${shortURL}`);// Redirect to the page for the new short URL
});

//deletes a url from the database
app.post("/urls/:id/delete", (req, res) => {

  //console.log(req.params.id); debug statements to verify the delete operator
  delete urlDatabase[req.params.id];
  //console.log(urlDatabase);

  res.redirect(302, "/urls");
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls/:id", (req, res) => {
  let templateVars = { username: req.cookies["username"], shortURL: req.params.id, fullURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});


app.post("/urls/:id", (req, res) => {

  // console.log(req.body.newURL); // debugging form input
  // console.log(req.params);

  urlDatabase[req.params.id] = req.body.newURL
  res.redirect(302, `${req.params.id}`);
});


app.post("/urls/:id/edit", (req, res) => {
  res.redirect(302,`http://localhost:8080/urls/${shortURL}`);
});


app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(302, longURL);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



