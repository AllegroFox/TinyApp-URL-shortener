

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


//stores urls and the associated shortURLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//all routing functions below

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


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



app.get("/urls", (req, res) => {
  let templateVars = { user: users[req.cookies["userID"]], urls: urlDatabase };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});


app.get("/login", (req, res) => {
  res.render("login");
});


app.post("/login", (req, res) => {
  //let userID = users[req.cookies["userID"]];

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
  let templateVars = { user: users[req.cookies["userID"]], shortURL: req.params.id, fullURL: urlDatabase[req.params.id] };
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



