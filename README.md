I built the AWS cognito Account Takeover vulnerbility in nodejs, and I'll be explaining it step by step and outlining mitigations.

Firstly, What is AWS cognito anyway?<br>
Well, Aws Cognito is a service that offers authentication API to make it simple to develop authentication systems. 

Answer from AWS:<br> 
Amazon Cognito lets you easily add user sign-up and authentication to your mobile and web apps. Amazon Cognito also enables you to authenticate users through an external identity provider and provides temporary security credentials to access your app's backend resources in AWS or any service behind Amazon API Gateway.

https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html

What is AWS cognito userPool?

Answer from AWS: 
A user pool is a user directory in Amazon Cognito. With a user pool, your users can sign in to your web or mobile app through Amazon Cognito. Your users can also sign in through social identity providers like Google, Facebook, Amazon, or Apple, and through SAML identity providers. Whether your users sign in directly or through a third party, all members of the user pool have a directory profile that you can access through a Software Development Kit (SDK).

https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html

Now we create our first userPool:

Enter a name for your Pool And in the next step set Username attributes to email 

<img src="/images/CreatingPool.png">

By default Aws sets Username attribute to username. change it to email and disable Enable case insensitivity for username input(uncheck the recommended).

<img src="/images/attribute_email.png">

Then go to app client and disable Generate secret key and review all setting once again and then click "Create Pool."

<img src="/images/appclient.png">

Now to the code: 

```js
userPool.signUp(
    email.toLowerCase(), //normalization of email to lowerCase so from Webserver API you cannot pass signup with UpperCase 
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
        secret: `Secret_${result.user.username}`, //[challenge: Attacker have to get this Secret] 
    });
    await user_data.save((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(JSON.stringify(result));
        res.status(201).json(result.codeDeliveryDetails);
        }
    });
});
```

Then an verification code will recive to your Email [victim@gmail.com] verify it.

Attcker First creates his account will his mail ex: [attacker@gmail.com] and verify's it.

Attacker Firstly, Login with his mail and gets access_token and use AWS API to directly update mail to VicTim@gmail.com

`aws cognito-idp update-user-attributes --region us-west-2 --access-token [token] --user-attributes Name=email,Value=[victim@mail]` 

```js
cognitoUser.authenticateUser(authenticationDetails, {
    async onSuccess(result) {
    let data = {
    refreshToken: result.getRefreshToken().getToken(),
    accessToken: result.getAccessToken().getJwtToken(),
    accessTokenExpiresAt: result.getAccessToken().getExpiration(),
    idToken: result.getIdToken().getJwtToken(),
    idTokenExpiresAt: result.getAccessToken().getExpiration(),
};

      const data_base = await Users.findOne({
        email: result.getIdToken().payload.email.toLowerCase(),// Due to the developer normalisation access_token email parameter to lowerCase, causes the vulnerability.
        //Ex: [Attacker Eamil in Cognito is VicTim@gmail.com But this line of code normalize it to victim@gmail.com and returns victim (secret or User_data)]
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
```

Mitigation There are various Ways to mitigate This Bug 
1) Don't normalize email parameter but if you need to normalize email check if email is verified or not using Lamda functions
2) Enable case insensitivity for username input so Attcker cannot create account with UpperCase
3) Stroing (sub or Username[66525ee0-e9f7-40a6-b458-bbc5ddeab79f]) in database instead of email will also mitigate this Bug
