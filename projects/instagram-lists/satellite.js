// Inspired by StackOverflow: https://stackoverflow.com/q/32407851
var lists = {};
var prunedUsernameList = [];
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
            has_story: (node.reel.latest_reel_media !== 0) // NB: not available in ?__a=1
          };
        }));
      });
    }
    console.info(`${thisList.length} ${config.name} fetched.`);
    lists[config.name] = thisList;
  }
  console.log(lists);
  copyFunc(lists);
  console.info('*** Done! The result is now copied to the clipboard. To copy again, run:\ncopy(lists)');
}
