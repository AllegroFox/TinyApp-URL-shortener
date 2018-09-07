

const express = require("express");
const app = express();
const methodOverride = require('method-override')
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const PORT = 8080; // default port 8080

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['kuuq38yab']
}));
app.set("view engine", "ejs");


//generates a 6 character alphanumeric string
const generateRandomString = function() {

  let randomString = "";
  randomString += Math.random().toString(36).substring(2, 8);

  return randomString;
};

//associates email with ID
function findID(email) {
 for(var id in users){
   if(email === users[id].email){
    return users[id].id;
   }
 }
 return false
};

//associates ID with password
function checkPass(password) {
 for(var id in users){
   if(password === users[id].password){
    return users[id].password;
   }
 }
 return false
};

//filters URLS to show only URLS associated with the user
function urlsForUser(id) {
  const userList = {}
  for (let url in urlDatabase){
    if (id === urlDatabase[url]["userID"])
      userList[url] = urlDatabase[url];
  }
    return userList;
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
    password: "asdf"
  }
};


//stores shortURLs, the associated longURLs and the associated userID
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "foxyOverlord"
  }
};


//all routing functions below

app.get("/", (req, res) => {

  let templateVars = { user: users[req.session.userID]};
  res.render("home", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});




//registration, login/logout

app.get("/register", (req, res) => {
  res.render("urls_register");
});

//verify that email & password fields are filled and email doesn't already exist
//if email is new & password field is full, register a new user
app.post("/register", (req, res) => {
  let randomID = generateRandomString();

  if (!req.body["email"] || !req.body["password"]) {

    res.status(400).send("Please fill out the email and password fields.");

  } else if (Object.values(users).map(user => user.email).includes(req.body["email"])) {

    res.status(400).send("Someone has already used that email. Please choose another!")

  } else {

    let password = req.body["password"];
    users[randomID] = {id: randomID, email: req.body["email"], password: bcrypt.hashSync(password, 10)};
    req.session.userID = randomID;

    res.redirect(302,"/urls");

  }

});


app.get("/login", (req, res) => {
  res.render("login");
});


app.post("/login", (req, res) => {

  if (!req.body["email"] || !req.body["password"]) {

    res.status(400).send("Please fill out the email and password fields.");

  } else if (!Object.values(users).map(user => user.email).includes(req.body["email"])) {

    res.status(403).send("Invaild email or password.");

  } else if (Object.values(users).map(user => user.email).includes(req.body["email"]))  {

    let currentID = findID(req.body["email"]);
    let currentPassword = req.body["password"];
    let hashedPassword = bcrypt.hashSync(currentPassword, 10);

      if (bcrypt.compareSync(currentPassword, hashedPassword)) {

        req.session.userID = currentID;

        res.redirect(302,"/");

      } else {

        res.status(403).send("Invalid email or password.");

      }

  } else {

    res.redirect(302,"/login");

  }

});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(302, "/");
});




//create, view, modify or delete URLS

app.get("/urls", (req, res) => {
  let id = req.session.userID;
  let templateVars = { user: users[req.session.userID], urls: urlsForUser(id) };

  if (id) {
    res.render("urls_index", templateVars);
  } else {
    res.redirect(302, "/login");
  }

});


app.post("/urls", (req, res) => {
  let id = req.session.userID;

  if (id) {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {longURL: req.body["longURL"], userID: req.session.userID}
    res.redirect(302,`http://localhost:8080/urls/${shortURL}`);// Redirect to the page for the new short URL
  } else {
    res.redirect(302, "/login");
  }

});

//deletes a url from the database
app.delete("/urls/:id/delete", (req, res) => {

  if (req.session.userID === urlDatabase[req.params.id]["userID"]) {

    delete urlDatabase[req.params.id];
    res.redirect(302, "/urls");

  } else {
    res.status(403).send("You don't have permission to delete that.")
  }

});


app.get("/urls/new", (req, res) => {
  let user = users[req.session.userID];
  let templateVars = { user: users[req.session.userID]}

  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect(302, "/login");
  }

});


app.get("/urls/:id", (req, res) => {
  let user = users[req.session.userID];
  let shortURL = req.params.id;
  let templateVars = { user: users[req.session.userID], shortURL: req.params.id, fullURL: urlDatabase[shortURL]["longURL"]};

  if (req.session.userID === urlDatabase[req.params.id]["userID"]) {
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send("You don't have permission to view that.")
  }

});


app.put("/urls/:id", (req, res) => {
  let shortURL = req.params.id;

  if (req.session.userID === urlDatabase[req.params.id]["userID"]) {

    urlDatabase[shortURL]["longURL"] = req.body.newURL
    res.redirect(302, `${req.params.id}`);

  } else {
    res.status(403).send("You don't have permission to edit that.")
  }

});


app.post("/urls/:id/edit", (req, res) => {
  res.redirect(302,`http://localhost:8080/urls/${shortURL}`);
});


app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(302, longURL);
});




//console message at startup

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

