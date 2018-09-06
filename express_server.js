

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
    userID: "foxyOverlord"
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "foxyOverlord"
  }
};


//all routing functions below

app.get("/", (req, res) => {

  let templateVars = { user: users[req.cookies["userID"]]};
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

    users[randomID] = {id: randomID, email: req.body["email"], password: req.body["password"]};
    res.cookie('userID', randomID);
    //console.log(users);// debug statement to see updated user object
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
    let currentPassword = checkPass(req.body["password"]);
    console.log(currentID, currentPassword)

      if (currentPassword === req.body["password"]) {

        res.cookie('userID', currentID );

        res.redirect(302,"/");

      } else {
        res.status(403).send("Invalid email or password.");
      }

  } else {

    res.redirect(302,"/login");

  }

});

app.post("/logout", (req, res) => {
  res.clearCookie('userID');
  res.redirect(302, "/");
});




//create, view, modify or delete URLS

app.get("/urls", (req, res) => {
  let templateVars = { user: users[req.cookies["userID"]], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body["longURL"], userID: req.cookies["userID"]}
  res.redirect(302,`http://localhost:8080/urls/${shortURL}`);// Redirect to the page for the new short URL
});

//deletes a url from the database
app.post("/urls/:id/delete", (req, res) => {

  if (req.cookies["userID"] === urlDatabase[req.params.id]["userID"]) {

    delete urlDatabase[req.params.id];
    res.redirect(302, "/urls");
  } else {
    res.status(403).send("You don't have permission to delete that.")
  }
});


app.get("/urls/new", (req, res) => {
  let user = users[req.cookies["userID"]];
  let templateVars = { user: users[req.cookies["userID"]]}
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect(302, "/login");
  }

});


app.get("/urls/:id", (req, res) => {

  let shortURL = req.params.id;
  let templateVars = { user: users[req.cookies["userID"]], shortURL: req.params.id, fullURL: urlDatabase[shortURL]["longURL"]};
  res.render("urls_show", templateVars);
});


app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;

  if (req.cookies["userID"] === urlDatabase[req.params.id]["userID"]) {

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
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(302, longURL);
});




//console message at startup

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });
