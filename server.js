const express = require("express");
const bcrypt = require("bcryptjs");
const app = express();
const path = require("path");

var session = require("express-session");
var nodemailer = require("nodemailer");
var os = require("os");

const apiPort = process.env.PORT || 5002;

var cookieParser = require("cookie-parser");
const cors = require("cors");
var questionsFile = require("./questions/all_questions.json");
require("dotenv").config({ path: "./config.env" });
app.use(cookieParser());

const isLocal = os.hostname().indexOf("local") > -1;

if (!isLocal) {
  app.set("trust proxy", 1);
}

// const transporter = nodemailer.createTransport({
//   port: 465, // true for 465, false for other ports
//   host: "smtp.gmail.com",
//   auth: {
//     user: "mathkidsz@gmail.com",
//   },
//   secure: true,
// });

app.use(
  session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 60, secure: !isLocal },
    resave: false,
  })
);

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
// app.use(require("./routes/routes"));
// get driver connection
const dbo = require("./db/conn");

app.get("/test", (req, res) => {
  console.log("existing test is", req.session.test);
  req.session.test = req.query.test;
  res.send("succcess");
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

  let email = req.session.email;
  if (!email) {
    res.send({
      success: false,
      message: "Error submitting quiz (current user not found)",
    });
    return;
  }
  console.log("updaing quiz for user", email);
  db_connect
    .collection("users")
    .updateOne(
      { email },
      { $set: { responses: req.body.responses } },
      (err, _) => {
        if (err) {
          res.send({ success: false, message: "Error submitting quiz" });
        } else {
          res.send({ success: true });
        }
      }
    );
});

app.get("/myresponses", async (req, res) => {
  console.log("i am ", req.session.email);
  let db_connect = dbo.getDb();
  let me = await db_connect
    .collection("users")
    .findOne({ email: req.session.email });
  console.log(me);
  res.send({ hasTakenQuiz: !!me?.responses, responses: me?.responses });
});

const saltRounds = 10;

app.post("/users/add", (req, res) => {
  let db_connect = dbo.getDb();
  bcrypt.genSalt(saltRounds, function (saltError, salt) {
    if (saltError) {
      throw saltError;
    } else {
      bcrypt.hash(req.body.userInfo.password, salt, function (hashError, hash) {
        if (hashError) {
          throw hashError;
        } else {
          db_connect
            .collection("users")
            .insertOne(
              { ...req.body.userInfo, password: hash },
              (err, res2) => {
                if (err) {
                  res.send({
                    success: false,
                    message:
                      "You have already signed up with this email. Sign in instead!",
                  });
                } else {
                  console.log("added document to users!");
                  req.session.email = req.body.userInfo.email;
                  res.send({ success: true, message: "Added user!" });
                }
              }
            );
        }
      });
    }
  });
});

app.get("/login", async (req, res) => {
  let db_connect = dbo.getDb();
  console.log("LOGIN CALLED, db is", db_connect);
  let user = await db_connect
    .collection("users")
    .find({ email: req.query.email })
    .toArray();
  console.log("users are");
  if (user.length > 0) {
    user = user[0];
    console.log(user);
    bcrypt.compare(
      req.query.password,
      user.password,
      function (error, isMatch) {
        if (error) {
          throw error;
        } else if (!isMatch) {
          res.send({
            success: false,
            message: "Incorrect username or password.",
          });
        } else {
          console.log("setting session email to ", req.query.email);
          req.session.email = req.query.email;
          res.send({ success: true, user: user });
        }
      }
    );
  } else {
    res.send({ success: false, message: "Incorrect username or password." });
  }
});

let surveySimilarity = (r1, r2) => {
  let nopref = "Partner No Preference";
  let total_similarity = 0;
  let total_weight = 0;
  for (let question_id in r1.responses) {
    if (!(question_id in r2.responses)) {
      continue;
    }
    normalizedResponser1 =
      r1.responses[question_id] && "value" in r1.responses[question_id]
        ? { [r1.responses[question_id]["value"]]: 10 }
        : r1.responses[question_id];
    normalizedResponser2 =
      r2.responses[question_id] && "value" in r2.responses[question_id]
        ? { [r2.responses[question_id]["value"]]: 10 }
        : r2.responses[question_id];
    if (
      nopref in normalizedResponser2.responses[question_id] &&
      !isNaN(normalizedResponser2.responses[question_id][nopref])
    ) {
      continue;
    }
    let weight = questionsFile.questions.find(
      (q) => q.id == question_id
    ).weight;
    total_weight += weight;
    let prod = 0;
    let len1 = 0;
    let len2 = 0;
    for (let answer_choice in normalizedResponser1) {
      if (!isNaN(normalizedResponser1[answer_choice])) {
        len1 += Math.pow(normalizedResponser1[answer_choice], 2);
      }
    }
    for (let answer_choice in normalizedResponser2) {
      if (!isNaN(normalizedResponser2[answer_choice])) {
        len2 += Math.pow(normalizedResponser2[answer_choice], 2);
      }
    }
    for (let answer_choice in normalizedResponser1) {
      if (
        question_id in r2.responses &&
        answer_choice in normalizedResponser2
      ) {
        if (
          !isNaN(normalizedResponser1[answer_choice]) &&
          !isNaN(normalizedResponser2[answer_choice])
        ) {
          prod +=
            normalizedResponser1[answer_choice] *
            normalizedResponser2[answer_choice];
        }
      }
    }
    console.log(question_id, prod, len1, len2, weight);
    if (isNaN(prod) || isNaN(len1) || isNaN(len2) || isNaN(weight)) {
      console.log("NAN FOUND");
    }
    if (len1 != 0 && len2 != 0) {
      total_similarity += (prod / Math.sqrt(len1 * len2)) * weight;
    } else {
      console.log(
        r1.firstName,
        r2.firstName,
        question_id,
        normalizedResponser1,
        normalizedResponser2
      );
    }
  }
  total_similarity /= total_weight;
  console.log("total similarity", total_similarity);
  return total_similarity;
};

app.get("/allSimilarities", async (req, res) => {
  let db_connect = dbo.getDb();
  let participants = await db_connect
    .collection("users")
    .find({
      isMatched: { $in: [null, false, true] },
      type: { $in: ["participant"] },
      responses: { $exists: true },
    })
    .toArray();

  let partners = await db_connect
    .collection("users")
    .find({
      isMatched: { $in: [null, false, true] },
      type: { $in: ["partner"] },
      responses: { $exists: true },
    })
    .toArray();

  let matches = await db_connect.collection("matches").find({}).toArray();

  similarities = [];
  for (let r1 of participants) {
    for (let r2 of partners) {
      similarities.push({
        participant: r1.email,
        partner: r2.email,
        similarity: surveySimilarity(r1, r2),
        isMatched:
          matches.filter(
            (match) =>
              match.participant == r1.email && match.partner == r2.email
          ).length > 0,
      });
    }
  }

  let abridged = (users) =>
    users.map((user) => ({
      email: user.email,
      first: user.firstName,
      last: user.lastName,
    }));

  res.send({
    participants: abridged(participants),
    partners: abridged(partners),
    similarities,
  });
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

app.get("/matchedResponses", async (req, res) => {
  let db_connect = dbo.getDb();
  let partner = await db_connect
    .collection("users")
    .findOne({ email: req.query.partner });

  let participant = await db_connect
    .collection("users")
    .findOne({ email: req.query.participant });

  let isMatched = await db_connect.collection("users").findOne({
    participant: req.query.participant,
    partner: req.query.partner,
  });

  res.send({
    partner: partner,
    participant: participant,
    isMatched: !!isMatched,
  });
});

app.get("/singleResponse", async (req, res) => {
  let db_connect = dbo.getDb();
  let user = await db_connect
    .collection("users")
    .findOne({ email: req.query.user });
  res.send(user);
});

app.post("/match", async (req, res) => {
  let db_connect = dbo.getDb();
  await db_connect.collection("matches").insertOne({
    partner: req.body.partner,
    participant: req.body.participant,
  });
  res.send({ success: true });
});

app.post("/removeMatch", async (req, res) => {
  let db_connect = dbo.getDb();
  await db_connect.collection("matches").deleteMany({
    partner: req.body.partner,
    participant: req.body.participant,
  });
  res.send({ success: true });
});

app.use(express.static("client/build"));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

app.listen(apiPort, () => {
  // perform a database connection when server starts
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
  });
  console.log(`Server running on port ${apiPort}`);
});
