---
layout: post
title: Social logins!
subtitle: See what you give away when you login using Facebook or Google
share-img: "http://eusebius.tech/raw/img/branding/github-eugenius1/original.png"
js:
  - "/js/funcs/specialName.js"
---

<div class="alert alert-warning" role="alert">This article is a work in progress.</div>

<noscript><div class="alert alert-danger" role="alert"><strong>Oh no!</strong> JavaScript has not been detected so these demonstrations will not work. Please use an up-to-date modern web browser or turn JavaScript back on if it's turned off.</div></noscript>

Try out the two social login demos below! Powered by client-side JavaScript (more on this below), which means the information you will see will <strong>not</strong> be stored by or on Eusebius.Tech.

<script type="text/javascript">
<!--
  // This is called with the results from from FB.getLoginStatus().
  function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      testAPI();
    } else if (response.status === 'not_authorized') {
      // The person is logged into Facebook, but not your app.
      var alertDiv = document.getElementById('facebook-thanks-name');
      alertDiv.className = 'alert alert-danger';
      alertDiv.innerHTML = 'Please authorise Eusebius.Tech with your Facebook';
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.
      var alertDiv = document.getElementById('facebook-thanks-name');
      alertDiv.className = 'alert alert-danger';
      alertDiv.innerHTML = 'Please log into Facebook.';
    }
  }

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  function FacebookCheckLoginState() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }

  window.fbAsyncInit = function() {
  FB.init({
    appId      : '1009749102479073',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.7' // use graph api version
  });

  // Now that we've initialized the JavaScript SDK, we call 
  // FB.getLoginStatus().  This function gets the state of the
  // person visiting this page and can return one of three states to
  // the callback you provide.  They can be:
  //
  // 1. Logged into your app ('connected')
  // 2. Logged into Facebook, but not your app ('not_authorized')
  // 3. Not logged into Facebook and can't tell if they are logged into
  //    your app or not.
  //
  // These three cases are handled in the callback function.

  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });

  };

  // Load the SDK asynchronously
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src="https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  }

  // Here we run a very simple test of the Graph API after login is
  // successful.  See statusChangeCallback() for when this call is made.
  function testAPI() {   
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', {fields: 'cover,name,first_name,last_name,age_range,gender,locale,picture,timezone,updated_time,verified'}, function(response) {
      console.log('Successful Facebook login for: ' + response.name);
      var alertDiv = document.getElementById('facebook-thanks-name')

      alertDiv.innerHTML = 'Thanks, ' + specialName(response.name, response.first_name);
      alertDiv.className = 'alert alert-success';
      // document.getElementById('facebook-card-title').innerHTML = response.name;
      document.getElementById('facebook-cover').innerHTML = '<div class="big-img intro-header" style="background-image: url(&quot;' + response.cover.source + '&quot;);"><div class="page-heading"><h2>' + response.name + '</h2></div></div>';

      document.getElementById('facebook-picture').innerHTML =
        '<img src="https://graph.facebook.com/v2.7/' + response.id + '/picture?type=large" alt="Your Facebook Profile Picture" title="You!">';
      document.getElementById('facebook-gender').innerHTML = response.gender.capitalizeFirstLetter();
      document.getElementById('facebook-firstname').innerHTML = response.first_name;
      document.getElementById('facebook-lastname').innerHTML = response.last_name;
      
      age_min = response.age_range.min;
      age_max = response.age_range.max;
      if( age_min === undefined && age_max === undefined) age_range = '';
      else if( age_min === undefined) age_range = '&le;' + age_max;
      else if( age_max === undefined) age_range = '&ge;' + age_min;
      else age_range = age_min + '-' + age_max;
      document.getElementById('facebook-agerange').innerHTML = age_range;
      document.getElementById('facebook-email').innerHTML = response.email;
      document.getElementById('facebook-locale').innerHTML = 
        '<a href="http://lh.2xlibre.net/locale/' + response.locale + '/">' + response.locale + '</a>';
      
      timezone = response.timezone
      if(timezone >= 0) timezone = '+' + timezone;
      timezone = 'UTC' + timezone;
      document.getElementById('facebook-timezone').innerHTML = '<a href="https://en.wikipedia.org/wiki/' + timezone + '">' + timezone + '</a>';
      document.getElementById('facebook-verified').innerHTML = 
      '<i class="fa fa-' + (response.verified? 'check':'times') + '" aria-hidden="true"></span><span class="sr-only">' + response.verified + '</span>';
      document.getElementById('facebook-lastupdated').innerHTML = new Date(response.updated_time);
      console.log(response);

    });
  }
//->
</script>

<fb:login-button scope="public_profile,email" onlogin="FacebookCheckLoginState();">
</fb:login-button>

<div class="alert alert-info" role="alert" id="facebook-thanks-name">Login with Facebook to see your details below.</div>

<div class="row">
  <div class="jumbotron col-sm-10 col-sm-offset-1" id="facebook-card">
    <h2 class="text-center" id="facebook-card-title">Facebook's bare minimum</h2>
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
      <div class="col-sm-4">Email: </div><strong>
      <div class="col-sm-8" id="facebook-email"></div></strong>
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
      <div class="col-sm-4">Verified? </div><strong>
      <div class="col-sm-8" id="facebook-verified"></div></strong>
    </div>
    <div class="row">
      <div class="col-sm-4">Last updated: </div><strong>
      <div class="col-sm-8" id="facebook-lastupdated"></div></strong>
    </div>
  </div>
</div>

All permissions [here](https://developers.facebook.com/docs/facebook-login/permissions).

<script src="https://apis.google.com/js/platform.js" async defer></script>
<script type="text/javascript">
<!--
function GoogleOnSignIn(googleUser) {
  // https://developers.google.com/identity/sign-in/web/reference#googleusergetbasicprofile
  var profile = googleUser.getBasicProfile();
  var response = {};
  response.id = profile.getId(); // Do not send to your backend! Use an ID token instead.
  response.name = profile.getName();
  response.picture = profile.getImageUrl();
  response.email = profile.getEmail(); // This is null if the 'email' scope is not present.
  response.first_name = profile.getGivenName();
  response.last_name = profile.getFamilyName();
  console.log('Successful Google login for: ' + response.name);

  // document.getElementById('google-thanks-name').innerHTML = 'Thanks, ' + specialName(response.name, response.first_name);
  document.getElementById('google-card-title').innerHTML = response.name;
  document.getElementById('google-picture').innerHTML =
    '<img src="' + response.picture + '" alt="Your Google Profile Picture" title="You!">';
  document.getElementById('google-firstname').innerHTML = response.first_name;
  document.getElementById('google-lastname').innerHTML = response.last_name;
  document.getElementById('google-email').innerHTML = response.email;
}
//->
</script>
<div class="g-signin2" data-onsuccess="GoogleOnSignIn"></div>

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

The code to gather and display your info only runs on your machine and never by a Eusebius.Tech server; your info goes directly from Facebook servers to your browser.

**Insert diagram**

I would have added a demo for Twitter login but Twitter's API has to be via OAuth, which restricts the action from being purely client-side. HTML with client-side JavaScript code for the logins above are on [GitHub](https://github.com/eugenius1/social-login-demos "social-login-demos").
