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

const getUser = (req) => {
  const userId = req.session.user_id;
  return users[userId] || null;
};

const urlsForUser = (id, urlDatabase) => {
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

module.exports = {
  urlsForUser,
  getUser,
  getUserByEmail,
  generateRandomId
};