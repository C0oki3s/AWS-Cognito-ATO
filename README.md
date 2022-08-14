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
      console.log(err)
      return res.status(500).json({ error: err })
    }
    const user_data = await new Users({
      email: email.toLowerCase(),
      secret: `Secret_${result.user.username}` //[challenge: Attacker have to get this Secret]
    })
    await user_data.save(err => {
      if (err) {
        console.log(err)
      } else {
        console.log(JSON.stringify(result))
        res.status(201).json(result.codeDeliveryDetails)
      }
    })
  }
)
```

Then an verification code will recive to your Email [victim@gmail.com] verify it.

Attcker First creates his account with his mail ex: [attacker@gmail.com] and verify's it.

Then, Attacker Login with his mail and gets access_token and use AWS API to directly update mail to VicTim@gmail.com

`aws cognito-idp update-user-attributes --region us-west-2 --access-token [token] --user-attributes Name=email,Value=[victim@mail]`

Login functionality:

```js
cognitoUser.authenticateUser(authenticationDetails, {
  async onSuccess (result) {
    let data = {
      refreshToken: result.getRefreshToken().getToken(),
      accessToken: result.getAccessToken().getJwtToken(),
      accessTokenExpiresAt: result.getAccessToken().getExpiration(),
      idToken: result.getIdToken().getJwtToken(),
      idTokenExpiresAt: result.getAccessToken().getExpiration()
    }

    const data_base = await Users.findOne({
      email: result.getIdToken().payload.email.toLowerCase() // Due to the developer normalisation access_token email parameter to lowerCase, causes the vulnerability.
      //Ex: [Attacker Eamil in Cognito is VicTim@gmail.com But this line of code normalize it to victim@gmail.com and returns victim (secret or User_data)]
    })

    return res.json({
      email: data_base,
      data
    })
  },
  onFailure (err) {
    console.log(err)
    return res.json(err)
  }
})
```

Mitigation There are various Ways to mitigate This Bug

1. Don't normalize email parameter but if you need to normalize email check if email is verified or not using Lamda functions.
2. Enable case insensitivity for username input so Attcker cannot create account with UpperCase.
3. Stroing (sub or Username[66525ee0-e9f7-40a6-b458-bbc5ddeab79f]) in database instead of email will also mitigate this Bug.


Even yet, if a developer doesn't normalise the email parameter, logical errors will still occur.

1. If A developer uses access_token as verifier on the server level and use [username field or sub(91afae62-93d8-49c9-a0ee-6cd1c05dd437)] in the primary database and always verify with sub(or)username parameter. This will leads to Two accounts Merged Into One.

Attacker signup uses k_rothih+1@gmail.com(his own mail) -> server [pre-process] -> stores in the database with sub field being main indentifier for verification factor on the authentication and authorization. Example qurey

>1a) SELECT \* FROM users WHERE sub=${sub_field_striped_from_access_token}<br/>
>2a) Users.findOne({sub:${sub_field_striped_from_access_token}})

Victim who doesn't signup (or) have an account in certain orgnization. Example [k_rothih+2@gmail.com]
Here Attacker changes mail to k_rothih+2@gmail.com[victim_mail] Using Cognito API. Where the server dont know about updation of email in Cognito and still validates sub field to authenticate.

Attacker now uses k_rothih+2@gmail.com email to login and token sent to backend where server strips sub[sub:91afae62-93d8-49c9-a0ee-6cd1c05dd437] field to query Database fetches k_rohith+1 data. If attacker still use k_rohith+1 it will throw error(user account not found) cause we changed email.

> Impact:

```text
    So here +2[victim] cannot able to signup again because its already exists in Cognito UserPool.
    But Devs Database doesnt even have idea of changing mail in Cognito. Where an attacker restricts victim on signup functionality.

```

> Behind the scene In Cognito:

```text
a) k_rothih+1@gmail.com[attacker] will signup through server -> stores data in database/ Cognito -> Cognito sends verification code to email.
       1a) Before email confirms The ACCOUNT STATUS=UNCONFIRMED, email_verified=false
       2a) After email confirms The ACCOUNT STATUS=CONFIRMED, email_verified=true

 b) After updating his email to k_rohith+2@gmail.com through Cognito API directly
       1b) After email confirms The ACCOUNT STATUS=CONFIRMED, email_verified=false
       2b) it works as Manual Confirming account in UserPool. an user still Gets access_token if a account is confirmed
```

    
<img src="/images/falseandconfim.png">


2. If A developer uses ID as verifier on the server level and use [email field] in the primary database and always verify with email parameter. Then the account cannot be found in the database when login.

Cause The Server dont Doesn't have an idea of a change of mail in Cognito.

firstly, attacker +1[attacker] will signup using server logic afterwards will change mail to +2[victim] but +1 still remains in database. When querying database it passes +2 mail cause that what ID token contains after attacker updating mail through Cognito API. When victim trys to create account using +2 mail then it will Throw error User already exists.

>1a) SELECT \* FROM users WHERE email=${email_field_striped_from_ID_token}<br/>
>2a) Users.findOne({email:${email_field_striped_from_ID_token}})


Either way, if an Attacker changes his Email through CLI the account will still remain Confirmed. the AWS Cognito Pool Only checks if the account Is confirmed or Not. but doesn't check whether email is verified or not. which leads to this Logical Errors
