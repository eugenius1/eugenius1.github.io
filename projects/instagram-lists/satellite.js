// Inspired by StackOverflow: https://stackoverflow.com/q/32407851
var lists = {};
var prunedUsernameList = [];
var moreDetails = [];
var doAbort = false;
var copyFunc = copy;
const StoryViewStatus = Object.freeze({ na: 0, none: 1, partial: 2, all: 3 });
const HttpStatus = Object.freeze({ tooManyRequests: 429 });
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
    { name: 'followings', user_edge: 'edge_follow', query_hash: 'd04b0a864b4b54837c0d870b0e77e076' },
    { name: 'followers', user_edge: 'edge_followed_by', query_hash: 'c76146de99bb02f6415203be841dd25a' },
  ];
  var userId = JSON.parse(document.getElementsByTagName('body')[0].innerText).graphql.user.id;
  let pageLimit = 200; // = 10,000 / 50
  let pageCount = 1;
  for (let i = 0; i < configs.length; ++i) {
    let config = configs[i], after = null, hasNext = true, thisList = [];
    console.info(`Fetching ${config.name}...`);
    for (; hasNext && (pageCount <= pageLimit); ++pageCount) {
      let response = await fetch(`https://www.instagram.com/graphql/query/?query_hash=${config.query_hash}&variables=` + encodeURIComponent(JSON.stringify({
        id: userId,
        include_reel: true,
        fetch_mutual: true,
        first: 50,
        after: after
      })));
      if (!response.ok) {
        console.warn(`Failed at page number ${pageCount} (during ${config.name} list). HTTP status ${response.status}: ${response.statusText}.`);
        if (response.status === HttpStatus.tooManyRequests) {
          // stop all by ending outer for-loop
          i = configs.length;
        }
        break;
      }
      response = await response.json();
      hasNext = response.data.user[config.user_edge].page_info.has_next_page
      after = response.data.user[config.user_edge].page_info.end_cursor
      thisList = thisList.concat(response.data.user[config.user_edge].edges.map(({ node }) => {
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
      console.log(thisList.length);
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
      console.warn(`Failed at index ${i} (${username}). HTTP status ${response.status}: ${response.statusText}.`);
      if (response.status === HttpStatus.tooManyRequests) {
        let totalWaitMins = 30;
        let pollingMs = 200;
        doAbort = false;
        console.warn(`Pausing for ${totalWaitMins} minutes. To abort and get the data already fetched (${moreDetails.length} users), run:\n abort()`);
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
