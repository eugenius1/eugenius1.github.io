---
layout: page
title: Instagram Lists
subtitle: Detailed, sortable lists of your Instagram followers and followings
comments: true
ext-css:
  - https://cdn.datatables.net/v/bs/dt-1.10.22/fc-3.3.1/datatables.min.css
css:
  - index.css
ext-js:
  - https://code.jquery.com/jquery-3.5.1.js
  - https://cdn.datatables.net/v/bs/dt-1.10.22/fc-3.3.1/datatables.min.js
js:
  - /js/utils/utils.js
  - /js/utils/storage.js
  - index.js
---

{% comment %} TODO: add share-img above {% endcomment %}

<noscript><div class="alert alert-danger" role="alert"><strong>Oh no!</strong> JavaScript has not been detected so this will not work for you. Please use a full web browser or turn JavaScript back on if it's turned off.</div></noscript>

<div class="alert alert-warning" role="alert"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i>&nbsp;<strong>Work in progress!</strong></div>

- TOC
{:toc}

## Notes

### Limitations

This info will not be available for a private account you're not following:

- last_post_timestamp
- story_highlights_count

### Warning

Due to the possibly large number of requests, the Instagram app might ask you to verify your identity via email or phone number.

## Let's go

<form class="form-inline" id="username-form">
  <div class="form-group">
    <label for="username">Username:</label>
    <input type="text" class="form-control" id="username" placeholder="username" required>
  </div>
  <button type="submit" class="btn btn-primary">Open new tab</button>
  <div id="ig-username-fallback" class="small" style="display:none">Didn't work? Link: <a id="ig-username-fallback-link"></a></div>
</form>

In the new instagram.com tab, open the browser console (normally `Ctrl`+`Shift`+`J` on Windows/Linux or `Command`+`Option`+`J` on Mac)

Copy the code below into the console and press `Enter`. This will set up all the needed functions.

```js
var lists = {};
var prunedUsernameList = [];
var moreDetails = [];
var doAbort = false;
var copyFunc = copy;
function abort() {
  console.info('Abort has been triggered.')
  doAbort = true;
}
function handleResult(result, variableName, aborted = false) {
  console.log(result);
  copyFunc(result);
  console.info(`*** ${aborted ? 'Aborted' : 'Done'}! The result is now copied to the clipboard. To copy again, run:\n copy(${variableName})`);
}
async function getLists() {
  let configs = [
    { name: 'followers', user_edge: 'edge_followed_by', query_hash: 'c76146de99bb02f6415203be841dd25a' },
    { name: 'followings', user_edge: 'edge_follow', query_hash: 'd04b0a864b4b54837c0d870b0e77e076' }
  ];
  var userId = JSON.parse(document.getElementsByTagName('body')[0].innerText).graphql.user.id
  for (let i = 0; i < configs.length; ++i) {
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
            has_story: Boolean(node.reel.latest_reel_media) // NB: not available in ?__a=1
          };
        }));
      });
    }
    console.info(`${thisList.length} ${config.name} fetched.`);
    lists[config.name] = thisList;
  }
  handleResult(lists, 'lists');
}
const timer = ms => new Promise(res => setTimeout(res, ms));
async function getMoreDetails(startingIndex = 0, interval = 36000) {
  let failures = [];
  for (let i = startingIndex; i < prunedUsernameList.length; ++i) {
    let username = prunedUsernameList[i];
    console.log(`[${new Date().toLocaleTimeString()}] ${i + 1}/${prunedUsernameList.length}: ${username}`);
    if (i !== 0) {
      await timer(interval);
    }
    let response = await fetch(`https://www.instagram.com/${username}/?__a=1`);
    if (!response.ok) {
      console.warn(`Failed at index ${i} (${username}). HTTP status ${response.status}.`);
      if (response.status === 429) {
        let totalWaitMins = 30;
        let pollingMs = 200;
        doAbort = false;
        console.warn(`Reason is Too Many Requests. Pausing for ${totalWaitMins} minutes. To abort and get the data already fetched (${moreDetails.length} users), run:\n abort()`);
        for (let pollingCount = 0; pollingCount < (totalWaitMins * 60 * 1000 / pollingMs); ++pollingCount) {
          if (doAbort) {
            handleResult(moreDetails, 'moreDetails', true);
            return;
          }
          await timer(pollingMs);
        }
        // retry this index
        --i;
      } else {
        // other statuses won't trigger a retry but will be recorded
        failures.push({ index: i, username: username, httpStatus: response.status })
      }
      continue;
    }
    response = await response.json();
    let user = response.graphql.user;
    let posts = user.edge_owner_to_timeline_media.edges;
    let last_post_timestamp = null;
    if (posts.length > 0) {
      last_post_timestamp = posts[0].node.taken_at_timestamp;
    }
    moreDetails.push({
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      profile_pic_url: user.profile_pic_url,
      profile_pic_url_hd: user.profile_pic_url_hd,
      follows_viewer: user.follows_viewer,
      followed_by_viewer: user.followed_by_viewer,
      requested_by_viewer: user.requested_by_viewer,
      follow_count: user.edge_follow.count,
      followed_by_count: user.edge_followed_by.count,
      mutual_followed_by_count: user.edge_mutual_followed_by.count,
      posts_count: user.edge_owner_to_timeline_media.count,
      is_private: user.is_private,
      last_post_timestamp: last_post_timestamp,
      story_highlights_count: user.highlight_reel_count,
      has_igtv: user.has_channel,
      has_reel_clips: user.has_clips,
      has_ar_effects: user.has_ar_effects,
      has_guides: user.has_guides,
      is_joined_recently: user.is_joined_recently,
      is_verified: user.is_verified,
      is_business_account: user.is_business_account,
      business_category_name: user.business_category_name,
      overall_category_name: user.overall_category_name
    });
  }
  if (failures.length) {
    console.warn(`${failures.length} failures: `, failures);
  }
  handleResult(moreDetails, 'moreDetails');
}
```
{:.pre-scrollable}
{: #main-code-to-copy}

<div>
{% highlight javascript %}
getLists()
{% endhighlight %}
When you get a "Done" message at the bottom of your console, the result will be automatically copied. Paste it below. If not copied, run:
{% highlight javascript %}
copy(lists)
{% endhighlight %}
</div>

<form class="form-horizontal" id="input-lists-form">
  <div class="form-group">
    <textarea class="form-control" rows="7" name="inputLists" placeholder='[{"followers": [], "followings": []}]' required></textarea>
  </div>
  <div class="form-group">
  I want to see:
    <div class="radio">
      <label>
        <input type="radio" name="listSelectionRadios" id="listSelectionRadio1" value="1_way_wers" required>
        Followers I'm not following back
      </label>
    </div>
    <div class="radio">
      <label>
        <input type="radio" name="listSelectionRadios" id="listSelectionRadio2" value="all_wers">
        All followers
      </label>
    </div>
    <div class="radio">
      <label>
        <input type="radio" name="listSelectionRadios" id="listSelectionRadio3" value="1_way_wings">
        Followings that don't follow me back
      </label>
    </div>
    <div class="radio">
      <label>
        <input type="radio" name="listSelectionRadios" id="listSelectionRadio4" value="all_wings">
        All followings
      </label>
    </div>
    <div class="radio">
      <label>
        <input type="radio" name="listSelectionRadios" id="listSelectionRadio5" value="friends">
        Friends (we follow each other)
      </label>
    </div>
    <div class="radio">
      <label>
        <input type="radio" name="listSelectionRadios" id="listSelectionRadio6" value="all">
        All followers + all followings (without duplicates)
      </label>
    </div>
  </div>
  <button type="submit" class="btn btn-primary">Compute list</button>
</form>

<div class="row">
  <div class="col-sm-6">Number of accounts: <span id="first-list-size"></span></div>
  <div class="col-sm-6"><button type="button" id="first-csv-button" class="btn btn-primary pull-right">Get CSV (spreadsheet)</button></div>
</div>
<div class="pre-scrollable" id="first-csv" style="display: none">
  You can copy this to a spreadsheet in software like Excel or <a href="https://docs.google.com/spreadsheets/">Google Sheets</a>.
{% highlight text %}
Preparing data...
{% endhighlight %}
</div>

<p>Estimated time needed for more details: <span id="first-time-estimate"></span></p>

Below you can unselect accounts in order to reduce time needed to get more details. You will see the new time estimate below the table.

<div class="container" class="md-screen-width">
  <table id="first-table" class="table table-bordered">
    <thead>
      <tr>
        <th><span class="sr-only">Selected?</span></th>
        <th>Username</th>
        <th>Full name</th>
        <th class="small text-center">Private?</th>
        <th class="small text-center">Verified?</th>
        <th class="small text-center">Story?</th>
        <th class="small text-center">I am following?</th>
        <th class="small text-center">I requested to follow?</th>
      </tr>
      </thead>
      <tbody>
      </tbody>
      <tfoot>
      <tr>
        <th><span class="sr-only">Selected?</span></th>
        <th>Username</th>
        <th>Full name</th>
        <th class="small text-center">Private?</th>
        <th class="small text-center">Verified?</th>
        <th class="small text-center">Story?</th>
        <th class="small text-center">I am following?</th>
        <th class="small text-center">I requested to follow?</th>
      </tr>
    </tfoot>
  </table>
</div>

<button type="submit" id="submit-pruned-list" class="btn btn-primary">Refresh time estimate</button>

<div>Number of accounts: <span id="pruned-list-size"></span></div>
<div>New estimated time needed for more details: <span id="second-time-estimate"></span></div>

<div id="pruned-username-list" class="pre-scrollable">
{% highlight javascript %}
/* Code to copy will appear here after clicking the button above */
// prunedUsernameList =
{% endhighlight %}
</div>

Run this:

{% highlight javascript %}
getMoreDetails()
{% endhighlight %}
When you get a "Done" message at the bottom of your console, the result will be automatically copied. Paste it below. If not copied, run:
{% highlight javascript %}
copy(moreDetails)
{% endhighlight %}

<form class="form-horizontal" id="more-details-form">
  <div class="form-group">
    <textarea class="form-control" rows="7" name="moreDetails" placeholder='[{}]' required></textarea>
  </div>
  <button type="submit" class="btn btn-primary">Show</button>
</form>

<strong>TODO: explain:</strong>

- *I requested to follow*:
- Mutual followers
- AR effects
- Guides

<div class="container" class="full-screen-width">
  <table id="second-table" class="table table-bordered">
    <thead>
      <tr>
        <th>Username</th>
        <th>Full name</th>
        <th class="small text-center">Private?</th>
        <th class="small text-center">Follows me?</th>
        <th class="small text-center">I am following?</th>
        <th class="small text-center">I requested to follow?</th>
        <th class="small text-center">Followings</th>
        <th class="small text-center">Followers</th>
        <th class="small text-center">Mutual followers</th>
        <th class="small text-center">Joined recently?</th>
        <th class="small text-center">Verified?</th>
        <th class="small text-center">Business account?</th>
        <th class="small text-center">Business category</th>
        <th class="small text-center">Posts</th>
        <th class="small text-center">Last post date</th>
        <th class="small text-center">Story highlights</th>
        <th class="small text-center">IGTV?</th>
        <th class="small text-center">Reels?</th>
        <th class="small text-center">AR effects?</th>
        <th class="small text-center">Guides?</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
    <tfoot>
      <tr>
        <th>Username</th>
        <th>Full name</th>
        <th class="small text-center">Private?</th>
        <th class="small text-center">Follows me?</th>
        <th class="small text-center">I am following?</th>
        <th class="small text-center">I requested to follow?</th>
        <th class="small text-center">Followings</th>
        <th class="small text-center">Followers</th>
        <th class="small text-center">Mutual followers</th>
        <th class="small text-center">Joined recently?</th>
        <th class="small text-center">Verified?</th>
        <th class="small text-center">Business account?</th>
        <th class="small text-center">Business category</th>
        <th class="small text-center">Posts</th>
        <th class="small text-center">Last post date</th>
        <th class="small text-center">Story highlights</th>
        <th class="small text-center">IGTV?</th>
        <th class="small text-center">Reels?</th>
        <th class="small text-center">AR effects?</th>
        <th class="small text-center">Guides?</th>
      </tr>
    </tfoot>
  </table>
</div>

<button type="button" id="clear-storage" class="btn btn-danger">Clear this page</button>
