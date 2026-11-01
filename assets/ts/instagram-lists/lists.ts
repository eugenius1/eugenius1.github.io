export interface User {
  id: string;
  username: string;
  followed_by_viewer?: boolean;
  follows_viewer?: boolean;
  url?: string;
  [key: string]: unknown;
}

export const ListSelections = {
  ALL_FOLLOWERS: 'all_wers',
  ALL_FOLLOWINGS: 'all_wings',
  ONE_WAY_FOLLOWERS: '1_way_wers',
  ONE_WAY_FOLLOWINGS: '1_way_wings',
  FRIENDS: 'friends', // a friend is both a follower and a following
  ALL: 'all',
} as const;

export function profileUrl(username: string): string {
  return `https://www.instagram.com/${username}/`;
}

function ids(users: User[]): Set<string> {
  return new Set(users.map((user) => user.id));
}

// Add properties follows_viewer and url to the first selected list
export function addInfo(selectedList: User[], followers: User[]): void {
  const followerIds = ids(followers);
  for (const user of selectedList) {
    // add the URL in case a CSV is needed
    user.url = profileUrl(user.username);
    // use the list of followers to populate property `follows_viewer`
    user.follows_viewer = followerIds.has(user.id);
  }
}

export function oneWayFollowers(followers: User[]): User[] {
  // making use of followed_by_viewer which means viewer follows the account in question
  return followers.filter((user) => !user.followed_by_viewer);
}

// Order of input parameters matters
// return (first - second)
export function arrayDifference(first: User[], second: User[]): User[] {
  const secondIds = ids(second);
  return first.filter((user) => !secondIds.has(user.id));
}

// Order of input parameters is irrelevant
export function arrayIntersection(first: User[], second: User[]): User[] {
  const firstIds = ids(first);
  return second.filter((user) => firstIds.has(user.id));
}

// Order of input parameters is irrelevant
export function arrayUnion(first: User[], second: User[]): User[] {
  return [...first, ...arrayDifference(second, first)];
}

// Returns null when no list has been chosen
export function selectList(
  selection: string,
  followers: User[],
  followings: User[],
): User[] | null {
  switch (selection) {
    case ListSelections.ALL_FOLLOWERS:
      return followers;
    case ListSelections.ALL_FOLLOWINGS:
      return followings;
    case ListSelections.ONE_WAY_FOLLOWERS:
      return oneWayFollowers(followers);
    case ListSelections.ONE_WAY_FOLLOWINGS:
      return arrayDifference(followings, followers);
    case ListSelections.FRIENDS:
      return arrayIntersection(followers, followings);
    case ListSelections.ALL:
      return arrayUnion(followers, followings);
    default:
      return null;
  }
}
