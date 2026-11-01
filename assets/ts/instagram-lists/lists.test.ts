import { describe, expect, it } from 'vitest';
import {
  addInfo,
  arrayDifference,
  arrayIntersection,
  arrayUnion,
  ListSelections,
  oneWayFollowers,
  selectList,
  type User,
} from './lists';

const a: User = { id: '1', username: 'a', followed_by_viewer: true };
const b: User = { id: '2', username: 'b', followed_by_viewer: false };
const c: User = { id: '3', username: 'c', followed_by_viewer: true };

const followers = [a, b];
const followings = [a, c];

function names(users: User[] | null): string[] | undefined {
  return users?.map((user) => user.username);
}

describe('list operations', () => {
  it('finds followers the viewer does not follow back', () => {
    expect(names(oneWayFollowers(followers))).toEqual(['b']);
  });

  it('subtracts by id', () => {
    expect(names(arrayDifference(followings, followers))).toEqual(['c']);
  });

  it('intersects by id', () => {
    expect(names(arrayIntersection(followers, followings))).toEqual(['a']);
  });

  it('unions without duplicates and without changing its inputs', () => {
    const first = [...followers];
    expect(names(arrayUnion(first, followings))).toEqual(['a', 'b', 'c']);
    expect(first).toHaveLength(2);
  });
});

describe('addInfo', () => {
  it('adds the profile URL and whether the account follows the viewer', () => {
    const list: User[] = [{ ...a }, { ...c }];
    addInfo(list, followers);
    expect(list[0]).toMatchObject({
      url: 'https://www.instagram.com/a/',
      follows_viewer: true,
    });
    expect(list[1]?.follows_viewer).toBe(false);
  });
});

describe('selectList', () => {
  it.each([
    [ListSelections.ALL_FOLLOWERS, ['a', 'b']],
    [ListSelections.ALL_FOLLOWINGS, ['a', 'c']],
    [ListSelections.ONE_WAY_FOLLOWERS, ['b']],
    [ListSelections.ONE_WAY_FOLLOWINGS, ['c']],
    [ListSelections.FRIENDS, ['a']],
    [ListSelections.ALL, ['a', 'b', 'c']],
  ])('returns the %s list', (selection, expected) => {
    expect(names(selectList(selection, followers, followings))).toEqual(expected);
  });

  it('returns null with no selection', () => {
    expect(selectList('', followers, followings)).toBeNull();
  });
});
