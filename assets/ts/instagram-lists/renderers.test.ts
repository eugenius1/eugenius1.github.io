import { describe, expect, it } from 'vitest';
import {
  buttonForBoolean,
  hasStory,
  iconForBoolean,
  igTimestamp,
  storyViewStatus,
  StoryViewStatus,
  username,
} from './renderers';

const user = { id: '1', username: 'a', profile_pic_url: 'https://example.com/a.jpg' };

describe('username', () => {
  it('links to the profile when displayed', () => {
    const html = username('a', 'display', user);
    expect(html).toContain('href="https://www.instagram.com/a/"');
    expect(html).toContain('src="https://example.com/a.jpg"');
  });
});

describe('igTimestamp', () => {
  it('formats seconds as a date for display', () => {
    expect(igTimestamp(1600000000, 'display')).toContain('2020');
  });

  it('is blank without a timestamp and zero for sorting', () => {
    expect(igTimestamp(null, 'display')).toBe('');
    expect(igTimestamp(null, 'sort')).toBe(0);
  });
});

describe('storyViewStatus', () => {
  it('describes each status', () => {
    expect(storyViewStatus(StoryViewStatus.NONE)).toBe('Not viewed');
    expect(storyViewStatus(StoryViewStatus.PARTIAL)).toBe('Partly viewed');
    expect(storyViewStatus(StoryViewStatus.ALL)).toBe('Finished');
    expect(storyViewStatus(StoryViewStatus.NA)).toBe('');
  });
});

describe('hasStory', () => {
  it('picks the icon from the view status', () => {
    const row = { ...user, story_view_status: StoryViewStatus.NONE };
    expect(hasStory(true, 'display', row)).toContain('fa-circle ig-story-not-viewed');
  });

  it('is text only for screen readers when there is no story', () => {
    expect(hasStory(false, 'display', user)).toBe('<span class="sr-only">False</span>');
  });
});

describe('iconForBoolean', () => {
  it('shows the icon when true', () => {
    expect(iconForBoolean('fa fa-lock', true)).toContain('fa fa-lock');
  });

  it('is unknown for private accounts the viewer does not follow', () => {
    const row = { ...user, is_private: true, followed_by_viewer: false };
    expect(iconForBoolean('x', false, row)).toContain('Unknown');
  });

  it('is false when the data is known', () => {
    const row = { ...user, is_private: false };
    expect(iconForBoolean('x', false, row)).toContain('False');
  });
});

describe('buttonForBoolean', () => {
  it('shows a disabled button when true', () => {
    expect(buttonForBoolean('Following', true)).toContain('Following');
  });
});
