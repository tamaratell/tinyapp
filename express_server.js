const express = require("express");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$TcSQxUasCB8AT1UuGMq4jeIEsYGLxnfVTcUu5EFBjqN4e8IHHNatm",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$TcSQxUasCB8AT1UuGMq4jeIEsYGLxnfVTcUu5EFBjqN4e8IHHNatm",
  },
};

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

const urlsForUser = function(id) {
  const userURLs = {};
  for (const urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === id) {
      userURLs[urlID] = {
        longURL: urlDatabase[urlID].longURL,
        shortURL: urlID
      };
    }
  }
  return userURLs;
};


app.get("/", (req, res) => {
  res.send("Hello! Our homepage is located at /urls");
});

// beginning of user login and registration endpoint code
app.get("/login", (req, res) => {
  const user = getUser(req);
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = { user: user };
  res.render("urls_login", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(403).send("User with that email not found");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect password");
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const user = getUser(req);
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: user,
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomId();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Check for empty email or password
  if (!email || !password) {
    res.status(400).send("E-mail and password are required.");
  }

  // Check if email is already in use
  const existingUser = getUserByEmail(email, users);
  if (existingUser) {
    res.status(400).send("E-mail already in use.");
  }

  const newUser = { id: id, email: email, password: hashedPassword };
  users[id] = newUser;

  res.cookie('user_id', newUser.id);
  res.redirect("/urls");
});

//end of user login/registration code

//homepage (myUrls) route code
app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  if (!user) {
    return res.send("Must log in to view urls");
  };
  const urls = urlsForUser(user.id);
  console.log(urls);
  const templateVars = {
    urls: urls,
    user
  };
  res.render("urls_index", templateVars);
});

//create a new url route
app.get("/urls/new", (req, res) => {
  const user = getUser(req);
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: user ? user : null,
  };
  res.render("urls_new", templateVars);
});

//send new url back to myURLs
app.post("/urls", (req, res) => {
  const user = getUser(req);
  if (!user) {
    return res.status(401).send("You must be logged in to shorten URLs.");
  }
  const id = generateRandomId();
  const longURL = req.body.longURL;
  urlDatabase[id] = { longURL: longURL, userID: user.id };
  res.redirect(`/urls/${id}`);
});

//go to the page of the shortURL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]?.longURL;
  if (!longURL) {
    res.status(404).send("Short URL not found");
  } else {
    res.redirect(longURL);
  }
});

//delete the shortURL from homepage
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.get("/urls/:id/edit", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  if (!user) {
    return res.send("Only user can view URLS");
  };
  const id = req.params.id;
  const longURL = urlDatabase[id]?.longURL;
  const templateVars = { id: id, longURL: longURL, user: user };
  res.render("urls_show", templateVars);
});

//post the edits to the shorturl (redirects back to urls page after submit)
app.post("/urls/:id", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  if (!user) {
    return res.send("Only user can edit URLS");
  };
  const id = req.params.id;
  const url = urlDatabase[id];
  const updatedLongURL = req.body.longURL;
  url.longURL = updatedLongURL;
  console.log("updated long URL", url.longURL);

  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

