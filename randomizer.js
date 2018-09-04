//randomizer.js

const generateRandomString = function() {

  let randomString = "";

  randomString += Math.random().toString(36).substring(2, 8);

  console.log(randomString);
  return randomString;
}

generateRandomString();