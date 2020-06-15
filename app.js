
/* ********************************* */
/* ------ NodeJs Server --------------*/
/* ********************************* */

const express = require("express");
const app = express();
const port = 3100;
const bodyParser = require("body-parser");
const fs = require("fs");
var cors = require("cors");

const dataPath = "./script/data.json";

// parse application/x-www-form-urlencoded
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const writeFile = (
  fileData,
  callback,
  filePath = dataPath,
  encoding = "utf8"
) => {
  fs.writeFile(filePath, fileData, encoding, (err) => {
    if (err) {
      throw err;
    }
    callback();
  });
};

const readFile = (
  callback,
  returnJson = false,
  filePath = dataPath,
  encoding = "utf8"
) => {
  fs.readFile(filePath, encoding, (err, data) => {
    if (err) {
      throw err;
    }
    callback(JSON.parse(data));
  });
};

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Hello World" });
});

app.post("/email", (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    readFile((data) => {
      const emailExist = data[`${email}`];
      if (emailExist) {
        if (emailExist.password === password) {
          return res.send(emailExist);
        } else {
          return res.status(200).json({ status: 404, message: "Password not match" });
        }
      } else {
        req.body = {
          email,
          password: password,
          history: [],
        };
        data[`${email}`] = req.body;
        writeFile(JSON.stringify(data, null, 2), () => {
          return res.status(200).json({ message: "New user added", history: [] });
        });
      }
    });
  }
});

app.post("/update-history", (req, res) => {
  const { email, totalMove } = req.body;
  readFile((data) => {
    let userData = data[`${email}`];
    if (userData) {
      const newHistoryArray = [
        ...data[`${email}`].history,
        {
          timeStamp: new Date(),
          totalMove: totalMove,
        },
      ];
      data[`${email}`] = {
        ...userData,
        history: newHistoryArray,
        card: [],
        resumeGame: false,
        totalMove: 0
      };
    }
    writeFile(JSON.stringify(data, null, 2), () => {
      return res.status(200).json({ message: "History Updated !" });
    });
  });
});

app.post("/save-game", (req, res) => {
  const { email, cards, isConfirm, totalMove } = req.body;
  readFile((data) => {
    let userData = data[`${email}`];
    if (userData) {
      data[`${email}`] = {
        ...userData,
        cards: isConfirm === "Yes" ? cards : [],
        resumeGame: isConfirm === "Yes" ? true : false,
        totalMove
      };
    }
    writeFile(JSON.stringify(data, null, 2), () => {
      return res.status(200).json({ message: "History Updated !" });
    });
  });
});

app.listen(port, () =>
  console.log(`Node Server listening on port ${port}!\n\n`)
);
