---
layout: post
title: Social logins!
subtitle: An interactive look at what you give away when you sign up to a site using Facebook or Google
share-img: "http://eusebius.tech/raw/img/branding/github-eugenius1/original.png"
js:
  - "/js/funcs/specialName.min.js"
  - "/js/blog/2017/social-logins.min.js"
---

**Try out the two social login demos below!** They're powered by client-side JavaScript (more on this below), which means the information you will see will **not** be stored by or on Eusebius.Tech.

The scenario: You go to sign up to a website and they ask you to create an account using an email and a password. If you make up a new password then you will most likely forget it, and if you reuse an old one then it's a security risk. Luckily, this website offers logging in with social networks like Facebook and Google.

<noscript><div class="alert alert-danger" role="alert"><strong>Oh no!</strong> JavaScript has not been detected so these demonstrations will not work for you. Please use a full web browser or turn JavaScript back on if it's turned off.</div></noscript>

# Facebook

<fb:login-button scope="public_profile,email,user_friends" onlogin="facebookCheckLoginState();">
</fb:login-button>

<div class="alert alert-info" role="alert" id="facebook-thanks-name">Login with Facebook to see your details below.</div>

<div class="row">
  <div class="jumbotron col-sm-10 col-sm-offset-1" id="facebook-card">
    <h2 class="text-center" id="facebook-card-title">Facebook's minimum</h2>
    <div class="row" id="facebook-cover"></div>
    <div class="row" id="facebook-picture"></div>
    <div class="row">
      <div class="col-sm-4">Gender: </div><strong>
      <div class="col-sm-8" id="facebook-gender"></div></strong>
    </div>
    <div class="row">
      <div class="col-sm-4">First name: </div><strong>
      <div class="col-sm-8" id="facebook-firstname"></div></strong>
    </div>
    <div class="row">
      <div class="col-sm-4">Last name: </div><strong>
      <div class="col-sm-8" id="facebook-lastname"></div></strong>
    </div>
    <div class="row">
      <div class="col-sm-4">Age range: </div><strong>
      <div class="col-sm-8" id="facebook-agerange"></div></strong>
    </div>
    <div class="row">
      <div class="col-sm-4">Locale: </div><strong>
      <div class="col-sm-8" id="facebook-locale"></div></strong>
    </div>
    <div class="row">
      <div class="col-sm-4">Timezone: </div><strong>
      <div class="col-sm-8" id="facebook-timezone"></div></strong>
    </div>
    <div class="row">
      <div class="col-sm-4">
        <abbr title="Someone is considered verified if they take any of the following actions:
    Register for mobile,
    Confirm their account via SMS,
    Enter a valid credit card">Verified</abbr>? </div><strong>
      <div class="col-sm-8" id="facebook-verified"></div></strong>
    </div>
    <div class="row">
      <div class="col-sm-4">Last updated: </div><strong>
      <div class="col-sm-8" id="facebook-lastupdated"></div></strong>
    </div>
    <hr>
    <div class="row">
      <div class="col-sm-4">Email: </div><strong>
      <div class="col-sm-8" id="facebook-email"></div></strong>
    </div>
    <div class="row">
      <div class="col-sm-4">Number of friends: </div><strong>
      <div class="col-sm-8" id="facebook-friend-count"></div></strong>
    </div>
    <br>
    <div class="row">
      <div class="col-xs-12" id="facebook-friends"></div>
    </div>
  </div>
</div>

By default, Facebook gives the permission `public_profile`. Optionally, an app's developer can ask for `email` and `user_friends`, friends who also use the app. A developer can expand to have more permissions available by making a request to Facebook. This [request](https://developers.facebook.com/docs/facebook-login/review/what-is-login-review "Login Review") needs to include why the extra information they would get is vital to the app's functions and user experience. 
All Facebook login permissions are listed [here](https://developers.facebook.com/docs/facebook-login/permissions), from date of birth to relationship status and spouse.

Note that the basic permissions don't give the exact age in years but instead where the age falls with respect to 18 and 21 (`age_range`). For example, the API might just give that you have a minimum age of 13 and maximum of 17. Even with the `user_birthday` permission, only the day and month from your date of birth are guaranteed; the year of birth depends on your privacy setting.

# Google

<script src="https://apis.google.com/js/platform.js" async defer></script>
<div class="g-signin2" data-onsuccess="GoogleOnSignIn"></div>

<div class="alert alert-warning" role="alert" id="google-thanks-name">If you have issues with signing in with Google on a mobile device,<br>
  <div class="text-muted small">open this page in your phone or tablet's native browser, not that inside another app. Check out this <a href="/raw/img/blog/2017/open-in-chrome-android.png">screenshot</a>. This is due to a <a href="https://developers.googleblog.com/2016/08/modernizing-oauth-interactions-in-native-apps.html?m=1">limitation</a> by Google.</div>
</div>

<div class="row">
  <div class="jumbotron col-sm-10 col-sm-offset-1" id="google-card">
    <h2 class="text-center" id="google-card-title">Google's bare minimum</h2>
    <div class="row" id="google-picture"></div>
    <div class="row">
      <div class="col-sm-4">First name: </div><strong>
      <div class="col-sm-8" id="google-firstname"></div></strong>
    </div>
    <div class="row">
      <div class="col-sm-4">Last name: </div><strong>
      <div class="col-sm-8" id="google-lastname"></div></strong>
    </div>
    <div class="row">
      <div class="col-sm-4">Email: </div><strong>
      <div class="col-sm-8" id="google-email"></div></strong>
    </div>
  </div>
</div>

By default, Google makes the scopes [`openid`](https://developers.google.com/identity/protocols/OpenIDConnect), `userinfo.profile` and `userinfo.email` available for a developer to request. A developer can quickly and easily [extend to the Google Plus API](https://developers.google.com/+/web/signin/#enable_the_google_api), which adds the scopes `plus.login` and `plus.me`. This basically includes everything (public) on your Google Plus profile page, from your occupation to the places you have lived. The full list is available [here](https://developers.google.com/+/web/api/rest/latest/people#resource).

# Data flow

The code to gather and display your info on this page only runs on your machine and never by a Eusebius.Tech server; your info goes directly from Facebook or Google servers to your browser.

[![Flow diagram of social login shows Eusebius.Tech servers giving JavaScript code to the user followed by the user's side requesting user details from a social network server](/raw/img/blog/2017/client-side-social-login-flow.png)](/raw/img/blog/2017/client-side-social-login-flow.png)

My experience with social logins has come from doing web development at a startup during my last holiday. When a user logins in for the first time, say using Facebook, a new user is created on the database using the basic details fetched from Facebook. This user doesn't have a password and instead, logging in with Facebook is the only way of authentication. Like in most other development work, always embrace frameworks, for example [*python-social-auth*](http://python-social-auth-docs.readthedocs.io/en/latest/).

I would have added a demo for Twitter login but [Twitter's API](https://dev.twitter.com/web/sign-in/implementing) requires OAuth authentication with every API request. This requires the use of the API secret key, which restricts the action from being purely client-side. 
Facebook and Google on the other hand, provide web-login JavaScript <abbr title="Software Development Kits">SDKs</abbr> that can be perfomed only on the client. 
HTML with client-side JavaScript code for the two logins above are on [GitHub](https://github.com/eugenius1/social-login-demos "social-login-demos").

Thanks for reading and, as always, please let me know if you spot something broken.