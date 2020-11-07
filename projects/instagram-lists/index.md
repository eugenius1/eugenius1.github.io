---
layout: page
title: Instagram Lists
subtitle: Detailed lists of your Instagram followers and followings
comments: true
js: index.js
---

{% comment %} TODO: add share-img above {% endcomment %}

<noscript><div class="alert alert-danger" role="alert"><strong>Oh no!</strong> JavaScript has not been detected so this will not work for you. Please use a full web browser or turn JavaScript back on if it's turned off.</div></noscript>

- TOC
{:toc}

## Notes

### Limitations

This info will not be available for a private account you're not following:

- last_post_timestamp
- highlight_reel_count

### Warning

Due to the possible many requests, the Instagram app might ask you to verify your identity via email or phone number.

## Let's go

<form class="form-inline" onSubmit="return onSubmitUsername(this)">
  <div class="form-group">
    <label for="username">Username:</label>
    <input type="text" class="form-control" id="username" placeholder="username">
  </div>
  <button type="submit" class="btn btn-primary">Open new tab</button>
  <small id="ig-username-fallback" style="display:none">Didn't work? Link: <a id="ig-username-fallback-link"></a></small>
</form>

In the new instagram.com tab, open the browser console (normally `Ctrl`+`Shift`+`J` on Windows/Linux or `Command`+`Option`+`J` on Mac)

Copy the code below into the console and press enter. This will set up all the needed functions.

<div class="pre-scrollable" id="main-code-to-copy">
{% highlight javascript %}
{% raw %}
var user_id = JSON.parse($('body').textContent).graphql.user.id
{% endraw %}
{% endhighlight %}
</div>

<form class="form-horizontal" onSubmit="return onSubmitInputLists(this)">
  <div class="form-group">
    <div class="col-sm-6">
      <label for="followers_json">Followers:</label>
{% highlight javascript %}
{% raw %}
var followers = getFollowers();
{% endraw %}
{% endhighlight %}
      Paste below the result that will be automatically copied. If not copied, run:
{% highlight javascript %}
{% raw %}
copy(followers)
{% endraw %}
{% endhighlight %}
      <textarea class="form-control" rows="3" id="followers_json" placeholder="[{}]"></textarea>
    </div>
    <div class="col-sm-6">
      <label for="followings_json">Followings:</label>
{% highlight javascript %}
{% raw %}
var followings = getFollowings();
{% endraw %}
{% endhighlight %}
      Paste below the result that will be automatically copied. If not copied, run:
{% highlight javascript %}
{% raw %}
copy(followings)
{% endraw %}
{% endhighlight %}
      <textarea class="form-control" rows="3" id="followings_json" placeholder="[{}]"></textarea>
    </div>
  </div>
  <div>
  I want to see:
    <div class="radio">
      <label>
        <input type="radio" name="prunedListRadios" id="prunedListRadio1" value="1_way_wers">
        Followers I'm not following back
      </label>
    </div>
    <div class="radio">
      <label>
        <input type="radio" name="prunedListRadios" id="prunedListRadio2" value="all_wers">
        All followers
      </label>
    </div>
    <div class="radio">
      <label>
        <input type="radio" name="prunedListRadios" id="prunedListRadio3" value="1_way_wings">
        Followings that don't follow me back
      </label>
    </div>
    <div class="radio">
      <label>
        <input type="radio" name="prunedListRadios" id="prunedListRadio4" value="all_wings">
        All followings
      </label>
    </div>
    <div class="radio">
      <label>
        <input type="radio" name="prunedListRadios" id="prunedListRadio4" value="all">
        All followers + all followings combined
      </label>
    </div>
  </div>
  <button type="submit" class="btn btn-primary">Compute list</button>
</form>

<p>Estimated time needed: <span id="first_time_estimate"></span></p>

Below you can unselect users in order to reduce time needed. You will see the new time estimate below the table.

<strong>TODO: Table here</strong>

<button class="btn btn-primary">Refresh time estimate</button>

<p>New estimated time needed: <span id="first_time_estimate"></span></p>

<button class="btn btn-primary">Get selected list</button>

```js
/* Code to copy will appear here after clicking the button above */
// prunedUserList =
```

Run this:

```js
var moreDetails = getMoreDetails();
```
