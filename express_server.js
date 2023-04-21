const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());


const generateRandomId = () => { //generates shortURL id
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (const character of characters) {
    if (id.length !== 6) {
      id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  } return id;
};

const getUserByEmail = (email, users) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

function getUser(req) {
  const userId = req.cookies.user_id;
  return users[userId] || null;
}

const urlDatabase = { //where URL and shortenedURL is stored 
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/login", (req, res) => {
  // const email = req.body.email;
  // const password = req.body.password;
  const user = getUser(req);
  const templateVars = { user: user };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  res.redirect("/urls");
  //const user = getUserByEmail(email, users);
  // if (user && bcrypt.compareSync(password, user.password)) {
  //   res.cookie('user_id', user.id);
  //   res.redirect("/urls");
  // } else {
  //   res.status(403).send("Incorrect email or password.");
  // }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const user = getUser(req);
  const templateVars = {
    user: user,
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomId();
  const email = req.body.email;
  const password = req.body.password;

  // Check for empty email or password
  if (!email || !password) {
    res.status(400).send("E-mail and password are required.");
  }

  // Check if email is already in use
  const existingUser = getUserByEmail(email, users);
  if (existingUser) {
    res.status(400).send("E-mail already in use.");
  }

  const newUser = { id: id, email: email, password: password };
  users[id] = newUser;

  res.cookie('user_id', newUser.id);
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  // const userId = req.cookies["user_id"];
  // const user = users[userId];
  const user = getUser(req);
  const templateVars = {
    urls: urlDatabase,
    user: user ? user : null,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = getUser(req);
  const templateVars = {
    user: user ? user : null,
  };
  res.render("urls_new", templateVars);
});


app.post("/urls", (req, res) => {
  const id = generateRandomId();
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  if (!longURL) {
    res.status(404).send("Short URL not found");
  } else {
    res.redirect(longURL);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.get("/urls/:id/edit", (req, res) => {
  const user = getUser(req);
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id: id, longURL: longURL, user: user };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

