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

This tool helped me cleanup 151 of the 1079 accounts I used to follow on Instagram.
I could sort my followings by details like when they last posted.

This would not be possible with Instagram's official APIs so here we use their **unofficial, internal APIs**.
We are using something that wasn't designed for us to easily use.
As you will see, it's a _hack_ but you will be guided step-by-step.

You can only do this on **desktop**.
We need to use the developer tools built-in to modern browsers like Chrome, Firefox and the new Edge.
For Safari, you have to enable it under [Preferences > Advanced](https://support.apple.com/en-gb/guide/safari/sfri20948/mac).
Everything is happening in your browser (client-side) and none of your data is sent to a server.

Currently, this tool won't work if your combined number of followers and followings exceeds **10,000**.

<noscript><div class="alert alert-danger" role="alert"><strong>Oh no!</strong> JavaScript has not been detected so this will not work for you. Please use a full web browser or turn JavaScript back on if it's turned off.</div></noscript>

- TOC
{:toc}

## Overview

There are two stages:

1. Get the lists of all followers and all followings.

2. _Optional_: Get details about each account. This can run for **hours** as we're limited to 100 accounts/hour.
    - You will get details including:
      - number of posts, followers and followings
      - number of their followers that you follow
      - date of their last post
      - are they a business account?
      - are they verified?
      - have they joined recently?
    - **Warning**: Due to the possibly large number of requests, the Instagram app might ask you to verify your identity via email or phone number.

### Legal disclaimer

> The software is provided "as is", without warranty of any kind, express or
implied, including but not limited to the warranties of merchantability,
fitness for a particular purpose and noninfringement. In no event shall the
authors or copyright holders be liable for any claim, damages or other
liability, whether in an action of contract, tort or otherwise, arising from,
out of or in connection with the software or the use or other dealings in the
software.

## Let's go!  

<div class="alert alert-info" role="alert">
<i class="fa fa-info-circle" aria-hidden="true"></i> This is in <strong>beta</strong> so please send me a message or leave a comment with any feedback or if something doesn't work as expected.
</div>

### 1. Setup

Make sure you're **logged in** on [instagram.com](https://www.instagram.com/).

<br>
<br>

<form class="form-inline" id="username-form">
  <div class="form-group">
    <label for="username">Your username:</label>
    <input type="text" class="form-control" id="username" placeholder="username" required>
  </div>
  <button type="submit" class="btn btn-primary">Open starting point <i class="fa fa-external-link" aria-hidden="true"></i><span class="sr-only">in a new tab</span></button>
  <div id="ig-username-fallback" class="small" style="display:none">Didn't work? Link: <a id="ig-username-fallback-link"></a></div>
</form>

In the new instagram.com tab, open the browser console (normally `Ctrl`+`Shift`+`J` on Windows/Linux or `⌘`+`Option`+`J` on Mac).

Copy the code below into the console and press `Enter`. This will set up all the needed functions.

```js
var lists = {};
var prunedUsernameList = [];
var moreDetails = [];
var doAbort = false;
var copyFunc = copy;
const StoryViewStatus = Object.freeze({ na: 0, none: 1, partial: 2, all: 3 });
function abort() {
  doAbort = true;
  console.info('Abort has been triggered.');
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
          let has_story = Boolean(node.reel.latest_reel_media);
          let story_view_status = StoryViewStatus.na;
          if (has_story) {
            let seen = node.reel.seen;
            if (seen === null) {
              story_view_status = StoryViewStatus.none;
            } else if (seen === node.reel.latest_reel_media) {
              story_view_status = StoryViewStatus.all;
            } else {
              story_view_status = StoryViewStatus.partial;
            }
          }
          return {
            id: node.id,
            username: node.username,
            full_name: node.full_name,
            profile_pic_url: node.profile_pic_url,
            followed_by_viewer: node.followed_by_viewer,
            requested_by_viewer: node.requested_by_viewer,
            is_private: node.is_private,
            is_verified: node.is_verified,
            has_story: has_story,
            story_view_status: story_view_status
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
        failures.push({ index: i, username: username, http_status: response.status })
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

<br>

### 2. Get lists

Copy the code below into the console and press `Enter`:

```js
getLists()
```

When you get a "Done" message at the bottom of your console, the result will be automatically copied. Paste it below. If not copied, run:

```js
copy(lists)
```

<form class="form-horizontal" id="input-lists-form">
  <div class="form-group">
    <textarea class="form-control" rows="7" name="inputLists" placeholder='{"followers": [], "followings": []}' required></textarea>
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

<br>

<div class="row">
  <div class="col-sm-6">Number of accounts: <span id="first-list-size"></span></div>
  <div class="col-sm-6"><button type="button" id="first-csv-button" class="btn btn-primary pull-right">Optional: Get CSV (spreadsheet)</button></div>
</div>
<div class="pre-scrollable" id="first-csv" style="display: none">
  You can copy this to a spreadsheet in software like Excel or <a href="https://docs.google.com/spreadsheets/">Google Sheets</a>.
{% highlight text %}
Preparing data...
{% endhighlight %}
</div>

<p>Estimated time needed for more details: <span id="first-time-estimate"></span></p>

Below you can unselect accounts in order to reduce time needed to get more details. You will see the new time estimate below the table.
Clicking on a user link will open their profile in a **new tab**.
*I requested to follow* means it's a private account you requested to follow and they haven't approved yet.

<div class="text-center">
  <div class="btn-group" role="group" style="margin-bottom: 5px" aria-label="Start with all users selected or unselected?">
    <button type="button" class="btn btn-default" id="first-select-all">Select all</button>
    <button type="button" class="btn btn-default" id="first-unselect-all">Unselect all</button>
  </div>
</div>

<div class="container" class="lg-screen-width">
  <table id="first-table" class="table table-bordered">
    <thead>
      <tr>
        <th><span class="sr-only">Selected?</span></th>
        <th class="small">Username</th>
        <th class="small">Full name</th>
        <th class="small">Private?</th>
        <th class="small">Verified?</th>
        <th class="small">Has story?</th>
        <th class="small">I viewed their story?</th>
        <th class="small">Follows me?</th>
        <th class="small">I am following?</th>
        <th class="small">I requested to follow?</th>
      </tr>
      </thead>
      <tbody>
      </tbody>
      <tfoot>
      <tr>
        <th><span class="sr-only">Selected?</span></th>
        <th class="small">Username</th>
        <th class="small">Full name</th>
        <th class="small">Private?</th>
        <th class="small">Verified?</th>
        <th class="small">Has story?</th>
        <th class="small">I viewed their story?</th>
        <th class="small">Follows me?</th>
        <th class="small">I am following?</th>
        <th class="small">I requested to follow?</th>
      </tr>
    </tfoot>
  </table>
</div>

### 3. Optional: Get more details

<button type="submit" id="submit-pruned-list" class="btn btn-primary">Refresh time estimate</button>

<div>Number of accounts: <span id="pruned-list-size"></span></div>
<div>New estimated time needed for more details: <strong><span id="second-time-estimate"></span></strong></div>

Copy the code below into the console and press `Enter`:

```js
/* Code to copy will appear here after clicking the button above */
// prunedUsernameList =
```
{:.pre-scrollable}
{: #pruned-username-list}

When you get a "Done" message at the bottom of your console, the result will be automatically copied. Paste it below. If not copied, run:

```js
copy(moreDetails)
```

<form class="form-horizontal" id="more-details-form">
  <div class="form-group">
    <textarea class="form-control" rows="7" name="moreDetails" placeholder='[{}]' required></textarea>
  </div>
  <button type="submit" class="btn btn-primary">Show in table</button>
</form>

Bear in mind that if an account is private and you're not following them, you will only see the public details.
Explanation of some of the columns:

- _Mutual followers_: how many of their followers you follow
- _AR effects_: Story effects or filters created by that account
- _Guides_: [what are they?](https://about.instagram.com/blog/announcements/supporting-well-being-with-instagram-guides)

<div class="container" class="full-screen-width">
  <table id="second-table" class="table table-bordered">
    <thead>
      <tr>
        <th class="small">Username</th>
        <th class="small">Full name</th>
        <th class="small">Private?</th>
        <th class="small">Follows me?</th>
        <th class="small">I am following?</th>
        <th class="small">I requested to follow?</th>
        <th class="small">Followings</th>
        <th class="small">Followers</th>
        <th class="small">Mutual followers</th>
        <th class="small">Joined recently?</th>
        <th class="small">Verified?</th>
        <th class="small">Business account?</th>
        <th class="small">Business category</th>
        <th class="small">Posts</th>
        <th class="small">Last post date</th>
        <th class="small">Story highlights</th>
        <th class="small">IGTV?</th>
        <th class="small">Reels?</th>
        <th class="small">AR effects?</th>
        <th class="small">Guides?</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
    <tfoot>
      <tr>
        <th class="small">Username</th>
        <th class="small">Full name</th>
        <th class="small">Private?</th>
        <th class="small">Follows me?</th>
        <th class="small">I am following?</th>
        <th class="small">I requested to follow?</th>
        <th class="small">Followings</th>
        <th class="small">Followers</th>
        <th class="small">Mutual followers</th>
        <th class="small">Joined recently?</th>
        <th class="small">Verified?</th>
        <th class="small">Business account?</th>
        <th class="small">Business category</th>
        <th class="small">Posts</th>
        <th class="small">Last post date</th>
        <th class="small">Story highlights</th>
        <th class="small">IGTV?</th>
        <th class="small">Reels?</th>
        <th class="small">AR effects?</th>
        <th class="small">Guides?</th>
      </tr>
    </tfoot>
  </table>
</div>

## Ending notes

Your data is stored in this browser tab, even after refreshing, until the tab is closed. You can also manually clear this local storage:

<button type="button" id="clear-storage" class="btn btn-danger"><i class="fa fa-trash-o" aria-hidden="true"></i> Clear this page</button>

I'd love to know what you think of this tool. You can leave a comment below or [contact me](/contact).
