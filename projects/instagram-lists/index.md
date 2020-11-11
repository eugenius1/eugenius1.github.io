---
layout: page
title: Instagram Lists
subtitle: Detailed lists of your Instagram followers and followings
comments: true
ext-css:
  - https://cdn.datatables.net/1.10.22/css/dataTables.bootstrap.min.css
ext-js:
  - https://code.jquery.com/jquery-3.5.1.js
  - https://cdn.datatables.net/1.10.22/js/jquery.dataTables.min.js
  - https://cdn.datatables.net/1.10.22/js/dataTables.bootstrap.min.js
js:
  - index.js
---

{% comment %} TODO: add share-img above {% endcomment %}

<noscript><div class="alert alert-danger" role="alert"><strong>Oh no!</strong> JavaScript has not been detected so this will not work for you. Please use a full web browser or turn JavaScript back on if it's turned off.</div></noscript>

- TOC
{:toc}

## Notes

### Limitations

This info will not be available for a private account you're not following:

- last_post_timestamp
- story_highlights_count

### Warning

Due to the possible many requests, the Instagram app might ask you to verify your identity via email or phone number.

## Let's go

<form class="form-inline" id="username-form">
  <div class="form-group">
    <label for="username">Username:</label>
    <input type="text" class="form-control" id="username" placeholder="username" required>
  </div>
  <button type="submit" class="btn btn-primary">Open new tab</button>
  <small id="ig-username-fallback" style="display:none">Didn't work? Link: <a id="ig-username-fallback-link"></a></small>
</form>

In the new instagram.com tab, open the browser console (normally `Ctrl`+`Shift`+`J` on Windows/Linux or `Command`+`Option`+`J` on Mac)

Copy the code below into the console and press enter. This will set up all the needed functions.

<div class="pre-scrollable" id="main-code-to-copy">
{% highlight javascript %}
{% raw %}
var lists = {};
var copyFunc = copy;
async function getLists() {
  let configs = [
    { name: 'followers', user_edge: 'edge_followed_by', query_hash: 'c76146de99bb02f6415203be841dd25a' },
    { name: 'followings', user_edge: 'edge_follow', query_hash: 'd04b0a864b4b54837c0d870b0e77e076' }
  ];
  var userId = JSON.parse(document.getElementsByTagName('body')[0].innerText).graphql.user.id
  for (var i = 0; i < configs.length; ++i) {
    let config = configs[i], after = null, hasNext = true, thisList = [];
    console.info(`Fetching ${config.name}...`);
    while (hasNext) {
      await fetch(`https://www.instagram.com/graphql/query/?query_hash=${config.query_hash}&variables=` + encodeURIComponent(JSON.stringify({
        id: userId,
        include_reel: true,
        fetch_mutual: true,
        first: 50,
        after: after
      }))).then(res => res.json()).then(res => {
        hasNext = res.data.user[config.user_edge].page_info.has_next_page
        after = res.data.user[config.user_edge].page_info.end_cursor
        thisList = thisList.concat(res.data.user[config.user_edge].edges.map(({ node }) => {
          return {
            id: node.id,
            username: node.username,
            full_name: node.full_name,
            profile_pic_url: node.profile_pic_url,
            followed_by_viewer: node.followed_by_viewer,
            requested_by_viewer: node.requested_by_viewer,
            is_private: node.is_private,
            is_verified: node.is_verified,
            has_story: (node.reel.latest_reel_media !== 0)
          };
        }));
      });
    }
    console.info(`${thisList.length} ${config.name} fetched.`);
    lists[config.name] = thisList;
  }
  console.log(lists);
  copyFunc(lists);
  console.info('*** Done! The result is now copied to the clipboard. To copy again, run:\n copy(lists)');
}
{% endraw %}
{% endhighlight %}
</div>

<form class="form-horizontal" id="input-lists-form">
  <div class="form-group">
    <label for="inputLists">Lists:</label>
{% highlight javascript %}
{% raw %}
getLists()
{% endraw %}
{% endhighlight %}
      When done, the result that will be automatically copied. Paste it below. If not copied, run:
{% highlight javascript %}
{% raw %}
copy(lists)
{% endraw %}
{% endhighlight %}
    <textarea class="form-control" rows="3" id="inputLists" placeholder='[{"followers": [], "followings": []}]' required></textarea>
  </div>
  <div class="form-group">
  I want to see:
    <div class="radio">
      <label>
        <input type="radio" name="prunedListRadios" id="prunedListRadio1" value="1_way_wers" required>
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
        <input type="radio" name="prunedListRadios" id="prunedListRadio5" value="friends">
        Friends (we follow each other)
      </label>
    </div>
    <div class="radio">
      <label>
        <input type="radio" name="prunedListRadios" id="prunedListRadio6" value="all">
        All followers + all followings (without duplicates)
      </label>
    </div>
  </div>
  <button type="submit" class="btn btn-primary">Compute list</button>
</form>

<div class="row">
  <div class="col-sm-6">Number of users: <span id="first-list-size"></span></div>
  <div class="col-sm-6"><button type="button" id="first-csv-button" class="btn btn-primary pull-right">Get CSV (spreadsheet)</button></div>
</div>
<div class="pre-scrollable" id="first-csv" style="display: none">
  You can copy this to a spreadsheet in software like Excel or <a href="https://docs.google.com/spreadsheets/">Google Sheets</a>.
{% highlight text %}
Preparing data...
{% endhighlight %}
</div>

<p>Estimated time needed for more details: <span id="first-time-estimate"></span></p>

Below you can unselect users in order to reduce time needed to get more details. You will see the new time estimate below the table.

<div class="container-fluid">
  <table id="first-table" class="table table-striped table-bordered" style="width:100%">
    <thead>
      <tr>
        <th>Username</th>
        <th>Full name</th>
        <th>Private</th>
        <th>Verified</th>
        <th>Story</th>
        <th>I am following</th>
        <th>I requested to follow</th>
      </tr>
      </thead>
      <tbody>
      </tbody>
      <tfoot>
      <tr>
        <th>Username</th>
        <th>Full name</th>
        <th>Private</th>
        <th>Verified</th>
        <th>Story</th>
        <th>I am following</th>
        <th>I requested to follow</th>
      </tr>
    </tfoot>
  </table>
</div>

<strong>TODO: Do I need this button?</strong><br>
<button class="btn btn-primary">Refresh time estimate</button>

<p>New estimated time needed for more details: <span id="second-time-estimate"></span></p>

<button class="btn btn-primary">Get selected list</button>

<div class="pre-scrollable">
{% highlight javascript %}
/* Code to copy will appear here after clicking the button above */
// prunedUsernameList =
{% endhighlight %}
</div>

Run this:

```js
getMoreDetails();
```

<strong>TODO: Button to clear localStorage</strong><br>