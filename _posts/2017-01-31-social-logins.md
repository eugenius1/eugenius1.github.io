---
layout: post
title: Social logins
subtitle: See what you give away when you login using Facebook
---

<div class="alert alert-warning" role="alert">This article is a work in progress.</div>

<noscript><div class="alert alert-danger" role="alert"><strong>Oh no!</strong> JavaScript has not been detected so these demonstrations will not work. Please use an up-to-date modern web browser or turn JavaScript back on if it's turned off.</div></noscript>

Social login demo. Try it! Powered by client-side JavaScript. More on this below. The information you will see will <strong>not</strong> be stored by or on Eusebius.Tech.

<script>
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
      document.getElementById('status').innerHTML = 'Please log ' +
        'into this app.';
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into Facebook.';
    }
  }

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  function checkLoginState() {
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

  // Here we run a very simple test of the Graph API after login is
  // successful.  See statusChangeCallback() for when this call is made.
  function testAPI() {
    function specialName(fullname, firstname) {
      if (fullname.startsWith('Eusebius Ngem')) return 'but not thanks, ' + firstname;
      if (fullname.startsWith('Abdou Ne')) return 'Abs ;)';
      if (fullname.startsWith('Hope Ka')) return 'Mama!';
      if (fullname.startsWith('Kunal Pat')) return 'Benchod!';
      if (fullname.startsWith('Kunal Raj')) return 'Chodu!';
      if (fullname.startsWith('Ahmed Ib')) return 'Ed!';
      if (fullname.startsWith('Mattin M')) return 'Mattin! The Iranians have been informed.';
      if (fullname.startsWith('Sautrik Ba')) return 'Snaketrik!';
      if (fullname.endsWith('va Ginger')) return 'Ketchup :P';
      return firstname + '!';
    }
    
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', {fields: 'name,first_name,last_name,age_range,email,locale,timezone,picture'}, function(response) {
      console.log('Successful Facebook login for: ' + response.name);
      console.log(response);
      document.getElementById('facebook-thanks-name').innerHTML = 'Thanks, ' + specialName(response.name, response.first_name);
      document.getElementById('facebook-picture').innerHTML =
        '<img src="https://graph.facebook.com/v2.7/' + response.id + '/picture?type=large" alt="Your Facebook Profile Picture" title="You!">';
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
    });
  }
//->
</script>

<fb:login-button scope="public_profile,email" onlogin="checkLoginState();">
</fb:login-button><span id="facebook-thanks-name">Login with Facebook to see your details below.</span>

<div class="jumbotron" id="facebook-card">
  <h1>Facebook's bare minimum</h1>
  <div id="facebook-picture"></div>
  <div>First name: <strong><span id="facebook-firstname"></span></strong></div>
  <div>Last name: <strong><span id="facebook-lastname"></span></strong></div>
  <div>Age range: <strong><span id="facebook-agerange"></span></strong></div>
  <div>Email: <strong><span id="facebook-email"></span></strong></div>
  <div>Locale: <strong><span id="facebook-locale"></span></strong></div>
  <div>Timezone: <strong><span id="facebook-timezone"></span></strong></div>

  <div id="facebook-info"></div>
</div>

The code to gather and display your info only runs on your machine and never by a Eusebius.Tech server; your info goes directly from Facebook servers to your browser.

Client-side JavaScript code for the Facebook login is included in this GitHub repo. I would have added a Twitter login demo but OAuth restricts this from being purely client-side.