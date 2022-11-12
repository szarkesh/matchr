const express = require("express");
const app = express();

var session = require("express-session");
var nodemailer = require("nodemailer");

var cookieParser = require("cookie-parser");
const cors = require("cors");
var questionsFile = require("./questions/all_questions.json");
require("dotenv").config({ path: "./config.env" });
app.use(cookieParser());

const transporter = nodemailer.createTransport({
  port: 465, // true for 465, false for other ports
  host: "smtp.gmail.com",
  auth: {
    user: "mathkidsz@gmail.com",
    pass: "Supdawgs5",
  },
  secure: true,
});

app.use(
  session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 60, secure: false },
    resave: false,
  })
);

const port = process.env.PORT || 5001;
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
// app.use(require("./routes/routes"));
// get driver connection
const dbo = require("./db/conn");

app.get("/", (req, res) => {
  res.send("Api is running.");
});

app.get("/questions", (req, res) => {
  console.log(req.session);
  if (!true) {
    res.json({ error: true, message: "Must be logged in to view questions!" });
  } else {
    res.json(questionsFile);
  }
});

app.post("/responses/add", async (req, res) => {
  let db_connect = dbo.getDb();
  console.log("req.session.email", req.session.email);
  db_connect
    .collection("users")
    .updateOne(
      { email: req.session.email },
      { $set: { responses: req.body.responses } },
      (err, res) => {
        if (err) throw err;
        console.log("added document to responses");
      }
    );
});

app.post("/users/add", (req, res) => {
  let db_connect = dbo.getDb();
  db_connect.collection("users").insertOne(req.body.userInfo, (err, res2) => {
    if (err) {
      res.send({
        success: false,
        message: "You have already signed up with this email. Sign in instead!",
      });
    } else {
      console.log("added document to users!");
      req.session.user = req.body.userInfo.email;
      res.send({ success: true, message: "Added user!" });
    }
  });
});

app.get("/login", async (req, res) => {
  let db_connect = dbo.getDb();
  console.log("LOGIN CALLED");
  let user = await db_connect
    .collection("users")
    .find({ email: req.query.email })
    .toArray();
  console.log("users are");
  if (user.length > 0) {
    user = user[0];
    console.log(user);
    if (user.password == req.query.password) {
      console.log("setting session email to ", req.query.email);
      req.session.email = req.query.email;
      console.log("session email is ", req.session.email);
      res.send({ success: true, user: user });
    } else {
      res.send({ success: false, message: "Incorrect username or password." });
    }
  } else {
    res.send({ success: false, message: "Incorrect username or password." });
  }
});

app.get("/currentUser", async (req, res) => {
  console.log(req.session);
  res.send({ email: req.session.email });
});

let surveySimilarity = (r1, r2) => {
  console.log("r1", r1, "r2", r2);
  let total_similarity = 0;
  for (let question_id in r1.responses) {
    let question_similarity = 0;
    for (let answer_choice in r1.responses[question_id]) {
      if (answer_choice in r2.responses[question_id]) {
        prod =
          r1.responses[question_id][answer_choice] *
          r2.responses[question_id][answer_choice];
        if (!isNaN(prod)) {
          question_similarity += prod / 100;
        }
      }
    }
    console.log("question similalriyt is", question_similarity);

    total_similarity += question_similarity;
  }
  total_similarity /= Object.keys(r1.responses).length;
  return total_similarity;
};

app.get("/allSimilarities", async (req, res) => {
  let db_connect = dbo.getDb();
  let participant_responses = await db_connect
    .collection("responses")
    .find({
      isMatched: { $in: [null, false, true] },
      isPartner: { $in: [null, false] },
    })
    .toArray();

  let partner_responses = await db_connect
    .collection("responses")
    .find({
      isMatched: { $in: [null, false, true] },
      isPartner: true,
    })
    .toArray();

  let participants = participant_responses.map((response) => response.user_id);
  let partners = partner_responses.map((response) => response.user_id);

  similarities = [];
  for (let r1 of participant_responses) {
    for (let r2 of partner_responses) {
      similarities.push({
        participant_user: r1.user_id,
        partner_user: r2.user_id,
        similarity: surveySimilarity(r1, r2),
      });
    }
  }

  res.send({ participants, partners, similarities });
});

app.get("/createMatches", async (req, res) => {
  let db_connect = dbo.getDb();
  let participant_responses = await db_connect
    .collection("responses")
    .find({
      isMatched: { $in: [null, false, true] },
      isPartner: { $in: [null, false] },
    })
    .toArray();

  let partner_responses = await db_connect
    .collection("responses")
    .find({
      isMatched: { $in: [null, false, true] },
      isPartner: true,
    })
    .toArray();

  let min_similarity_threshold =
    parseFloat(req.query.min_similarity_threshold) || 0;

  let matches = [];
  if (partner_responses.length == 0) {
    res.send("No matches could be found as there were no partner responses.");
  } else if (participant_responses.length == 0) {
    res.send(
      "No matches could be found as there were no participant responses."
    );
  } else {
    while (partner_responses.length > 0 && participant_responses.length > 0) {
      let max_similarity = min_similarity_threshold;
      let partner_match = null;
      let participant_match = null;
      let partner_id = null;
      let participant_id = null;
      for (let r1 of partner_responses) {
        for (let r2 of participant_responses) {
          console.log(r1.responses);

          console.log("total_similarity is", total_similarity);
          if (total_similarity > max_similarity) {
            partner_match = r1.user_id;
            participant_match = r2.user_id;
            partner_id = r1._id;
            participant_id = r2._id;
            max_similarity = total_similarity;
            console.log("setting max similarity");
          }
        }
      }
      if (partner_match && participant_match) {
        console.log("matching partner", partner_match, participant_match);
        matches.push([partner_match, participant_match, max_similarity]);
        await db_connect
          .collection("responses")
          .updateOne(
            { _id: { $in: [partner_id, participant_id] } },
            { $set: { isMatched: true } }
          );
        await db_connect.collection("matches").insertMany(
          matches.map((match) => ({
            partner_userid: match[0],
            participant_userid: match[1],
            similarity: match[2],
            emailSent: false,
          }))
        );
        partner_responses = partner_responses.filter(
          (p) => p.user_id != partner_match
        );
        participant_responses = participant_responses.filter(
          (p) => p.user_id != participant_match
        );
      } else {
        break;
      }
    }
    res.send(matches);
  }
});

app.get("/sendNewMatchesEmails", async (req, res) => {
  let db_connect = dbo.getDb();
  let newMatches = await db_connect
    .collection("matches")
    .find({ emailSent: { $in: [null, false] } })
    .toArray();
  const data = JSON.stringify({
    Messages: [
      {
        From: { Email: "mathkidsz@gmail.com", Name: "Shaya Zarkesh" },
        To: [{ Email: newMatches[0], Name: name }],
        Subject: subject,
        TextPart: message,
      },
    ],
  });

  const config = {
    method: "post",
    url: "https://api.mailjet.com/v3.1/send",
    data: data,
    headers: { "Content-Type": "application/json" },
    auth: {
      username: "08b5f8fe281fc757cbcba27d3a920156",
      password: "adf6415a0cf9bf392c2c77ba213c2f51",
    },
  };

  console.log(newMatches[0]);

  res.send(newMatches);

  // res.send("sent emails to the following matches");
  // transporter.sendMail(mailOptions, function (err, info) {
  //   if (err) console.log(err);
  //   else console.log(info);
  // });
});

app.listen(port, () => {
  // perform a database connection when server starts
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
  });
  console.log(`Server is running on port: ${port}`);
});
