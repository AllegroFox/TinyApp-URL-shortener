

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


//generates a 6 character alphanumeric string
const generateRandomString = function() {

  let randomString = "";
  randomString += Math.random().toString(36).substring(2, 8);

  return randomString;
}



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

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
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
})


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, fullURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {

  // console.log(req.body.newURL); // debugging form input
  // console.log(req.params);

  urlDatabase[req.params.id] = req.body.newURL
  res.redirect(302, `${req.params.id}`);
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



