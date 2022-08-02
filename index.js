const express = require("express");
const mongoose = require("mongoose");
let AmazonCognitoIdentity = require("amazon-cognito-identity-js");
const Users = require("./models/Users");
const { CognitoJwtVerifier } = require("aws-jwt-verify");
let app_client = "7k476bbu2crl7m6p3k739icr57";
let pool_id = "us-west-2_chjZSxhTH";

const app = express();
app.use(
  express.json(),
  express.urlencoded({
    extended: true,
  })
);

mongoose.connect("mongodb://localhost:27017/cognito", (err, connect) => {
  if (err) return err;
  console.log("Mongodb connected");
});

async function verify(req, res, next) {
  const verifier = CognitoJwtVerifier.create({
    userPoolId: pool_id,
    tokenUse: "access",
    clientId: app_client,
  });
  try {
    const payload = await verifier.verify(req.body.accessToken);
    res.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "401" });
  }
}

app.post("/signup", async (req, res) => {
  const { email, password, hackerone, family_name, birthday } = req?.body;
  if (!email || !password || !hackerone || !family_name || !birthday) {
    for (const key in req.body) {
      if (req.body[key] == "") {
        return res.json({ error: `${key} is required` });
      }
    }
  }
  const userPool = new AmazonCognitoIdentity.CognitoUserPool({
    UserPoolId: pool_id,
    ClientId: app_client,
  });
  let attributeList = [];
  let email_data = {
    Name: "email",
    Value: email.toLowerCase(),
  };
  let hackerone_data = {
    Name: "custom:hackerone",
    Value: hackerone,
  };
  let family_name_data = {
    Name: "family_name",
    Value: family_name,
  };
  let attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(
    email_data
  );
  let attributeHackerone = new AmazonCognitoIdentity.CognitoUserAttribute(
    hackerone_data
  );
  let attributefamilyname = new AmazonCognitoIdentity.CognitoUserAttribute(
    family_name_data
  );
  attributeList.push(attributeEmail);
  attributeList.push(attributeHackerone);
  attributeList.push(attributefamilyname);
  userPool.signUp(
    email.toLowerCase(),
    password,
    attributeList,
    null,
    async (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: err });
      }
      const user_data = await new Users({
        email: email.toLowerCase(),
        secret: `Secret_${result.user.username}`,
      });
      await user_data.save((err) => {
        if (err) {
          console.log(err);
        } else {
          console.log(JSON.stringify(result));
          res.status(201).json(result.codeDeliveryDetails);
        }
      });
    }
  );
});

app.post("/verify", (req, res) => {
  const { user_name, confirm } = req.body;
  const userPool = new AmazonCognitoIdentity.CognitoUserPool({
    UserPoolId: pool_id,
    ClientId: app_client,
  });
  const UserData = {
    Username: user_name,
    Pool: userPool,
  };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(UserData);
  cognitoUser.confirmRegistration(confirm, true, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: err });
    }
    console.log(JSON.stringify(result));
    res.status(201).json(result);
  });
});

app.post("/login", async (req, res) => {
  const userPool = new AmazonCognitoIdentity.CognitoUserPool({
    UserPoolId: pool_id,
    ClientId: app_client,
  });
  const { email, password } = req.body;
  const authenticationData = {
    Username: email,
    Password: password,
  };
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    authenticationData
  );
  const userData = {
    Username: email,
    Pool: userPool,
  };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  console.log(cognitoUser);
  cognitoUser.authenticateUser(authenticationDetails, {
    async onSuccess(result) {
      console.log(result);
      let data = {
        refreshToken: result.getRefreshToken().getToken(),
        accessToken: result.getAccessToken().getJwtToken(),
        accessTokenExpiresAt: result.getAccessToken().getExpiration(),
        idToken: result.getIdToken().getJwtToken(),
        idTokenExpiresAt: result.getAccessToken().getExpiration(),
      };

      const data_base = await Users.findOne({
        email: result.getIdToken().payload.email.toLowerCase(),
      });

      return res.json({
        email: data_base,
        data,
      });
    },
    onFailure(err) {
      console.log(err);
      return res.json(err);
    },
  });
});

app.post("/getdata", verify, async (req, res) => {
  res.json(res.user);
});

app.listen(5000, (err) => {
  if (err) {
    console.log("Error", err);
  }
  console.log("Running on port 5000");
});
