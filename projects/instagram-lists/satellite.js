// Inspired by StackOverflow: https://stackoverflow.com/q/32407851
var lists = {};
var prunedUsernameList = [];
var moreDetails = [];
var doAbort = false;
var copyFunc = copy;
const GRAPHQL_MAX_PER_PAGE = 50;
const StoryViewStatus = Object.freeze({ NA: 0, NONE: 1, PARTIAL: 2, ALL: 3 });
const HttpStatus = Object.freeze({ TOO_MANY_REQUESTS: 429 });
const timer = ms => new Promise(res => setTimeout(res, ms));
function getTime() {
  return new Date().toLocaleTimeString();
}
function abort() {
  doAbort = true;
  console.info('Abort has been triggered.');
}
function handleResult(result, variableName) {
  console.log(result);
  copyFunc(result);
  console.info(`******************************\n Done! The result is now copied to the clipboard. To copy again, run:\n\t copy(${variableName})`);
}
function minPagesNeeded(total) {
  return Math.ceil(total / GRAPHQL_MAX_PER_PAGE);
}
function limitConfigs(configs, pageLimit) {
  let result = configs.slice(0, 1);
  let resultPages = minPagesNeeded(configs[0].total_count);
  for (let i = 1; i < configs.length; ++i) {
    let c = configs[i];
    let thisPages = minPagesNeeded(c.total_count);
    if ((resultPages + thisPages) <= pageLimit) {
      result.push(c);
      resultPages += thisPages;
    } else {
      console.info(`Ignoring the ${c.total_count.toLocaleString()} ${c.name}.`);
    }
  }
  return result;
}

async function getLists() {
  let pageLimits = { withoutWaiting: 200, withWaiting: 370 };
  let pageLimit = pageLimits.withoutWaiting;
  let baseInfo = null;
  try {
    baseInfo = JSON.parse(document.getElementsByTagName('body')[0].innerText);
  } catch (error) {
    console.error('You may not be on the right page, normally it should be like "https://www.instagram.com/username/?__a=1"', error);
    return;
  }

  var userId = baseInfo.graphql.user.id;
  var followersCount = baseInfo.graphql.user.edge_followed_by.count;
  var followingsCount = baseInfo.graphql.user.edge_follow.count;
  let configs = [
    { name: 'followings', user_edge: 'edge_follow', query_hash: 'd04b0a864b4b54837c0d870b0e77e076', total_count: followingsCount },
    { name: 'followers', user_edge: 'edge_followed_by', query_hash: 'c76146de99bb02f6415203be841dd25a', total_count: followersCount }
  ];
  configs = limitConfigs(configs, pageLimit);
  
  let pageCount = 1;
  for (let i = 0; (i < configs.length) && !doAbort; ++i) {
    let config = configs[i], after = null, hasNext = true, thisList = [];
    let doWait = (pageLimit === pageLimits.withWaiting);
    console.info(`Fetching ${config.name}...`);
    for (; hasNext && (pageCount <= pageLimit) && !doAbort; ++pageCount) {
      if (doWait && (pageCount !== 1)) {
        // 200 pages every 15 mins assuming 400 ms latency => 4.1 s interval between pages
        await timer((15 * 60 * 1000 / 200) - 400);
      }
      try {
        let response = await fetch(`https://www.instagram.com/graphql/query/?query_hash=${config.query_hash}&variables=` + encodeURIComponent(JSON.stringify({
          id: userId, include_reel: true, fetch_mutual: true, first: GRAPHQL_MAX_PER_PAGE, after: after
        })));
        if (!response.ok) {
          console.warn(`Failed at page number ${pageCount.toLocaleString()} (during ${config.name} list). HTTP status ${response.status}: ${response.statusText}.`);
          if (response.status === HttpStatus.TOO_MANY_REQUESTS) {
            doAbort = true;
          } // else don't abort and continue to next list (next config)
          break; // no next page
        }
        try {
          response = await response.json();
        } catch (error) {
          console.error(`Detected that you may need to verify your account. Stopping. Failed at page number ${pageCount.toLocaleString()} (during ${config.name} list).`, error);
          doAbort = true;
          break;
        }
        hasNext = response.data.user[config.user_edge].page_info.has_next_page
        after = response.data.user[config.user_edge].page_info.end_cursor
        thisList = thisList.concat(response.data.user[config.user_edge].edges.map(({ node }) => {
          let has_story = Boolean(node.reel.latest_reel_media);
          let story_view_status = StoryViewStatus.NA;
          if (has_story) {
            let seen = node.reel.seen;
            if (seen === null) {
              story_view_status = StoryViewStatus.NONE;
            } else if (seen === node.reel.latest_reel_media) {
              story_view_status = StoryViewStatus.ALL;
            } else {
              story_view_status = StoryViewStatus.PARTIAL;
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
      } catch (error) {
        console.warn(`Error at page number ${pageCount.toLocaleString()} (during ${config.name} list):`, error);
      }
      console.log(`[${getTime()}] ${thisList.length.toLocaleString()} of ${config.total_count.toLocaleString()} ${config.name} fetched so far`);
    }
    console.info(`${thisList.length.toLocaleString()} ${config.name} fetched.`);
    lists[config.name] = thisList;
  }
  doAbort = false;
  handleResult(lists, 'lists');
}

async function getMoreDetails(startingIndex = 0, interval = 36000) {
  let failures = [];
  for (let i = startingIndex; (i < prunedUsernameList.length) && !doAbort; ++i) {
    let username = prunedUsernameList[i];
    console.log(`[${getTime()}] ${(i + 1).toLocaleString()} of ${prunedUsernameList.length.toLocaleString()}: ${username}`);
    if (i !== 0) {
      await timer(interval);
    }
    try {
      let response = await fetch(`https://www.instagram.com/${username}/?__a=1`);
      if (!response.ok) {
        console.warn(`Failed at index ${i.toLocaleString()} (${username}). HTTP status ${response.status}: ${response.statusText}.`);
        if (response.status === HttpStatus.TOO_MANY_REQUESTS) {
          let totalWaitMins = 30;
          let pollingMs = 200;
          let totalPolls = totalWaitMins * 60 * 1000 / pollingMs;
          console.warn(`Pausing for ${totalWaitMins} minutes. To abort and get the data already fetched (${moreDetails.length.toLocaleString()} users), run:\n abort()`);
          for (let pollingCount = 0; (pollingCount < totalPolls) && !doAbort; ++pollingCount) {
            await timer(pollingMs);
          }
          // retry this index
          --i;
        } else {
          // other statuses won't trigger a retry but will be recorded
          failures.push({ index: i, username: username, http_status: response.status });
        }
        continue;
      }
      try {
        response = await response.json();
      } catch (error) {
        console.error(`Detected that you may need to verify your account. Stopping. Failed at index ${i.toLocaleString()} (${username}).`, error);
        failures.push({ index: i, username: username, error: error });
        break;
      }
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
    } catch (error) {
      console.log(error);
      failures.push({ index: i, username: username, error: error });
    }
  }
  doAbort = false;
  if (failures.length) {
    console.warn(`${failures.length.toLocaleString()} failure(s): `, failures);
  }
  handleResult(moreDetails, 'moreDetails');
}
