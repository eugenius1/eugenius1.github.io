import { profileUrl, type User } from './lists';

// also in assets/js/instagram-lists/satellite.js
export const StoryViewStatus = { NA: 0, NONE: 1, PARTIAL: 2, ALL: 3 } as const;

const STORY_STATUSES: Record<number, { label: string; icon: string }> = {
  [StoryViewStatus.NONE]: { label: 'Not viewed', icon: 'fa-circle ig-story-not-viewed' },
  [StoryViewStatus.PARTIAL]: {
    label: 'Partly viewed',
    icon: 'fa-circle-thin ig-story-partly-viewed',
  },
  [StoryViewStatus.ALL]: { label: 'Finished', icon: 'fa-circle-thin ig-story-finished' },
};

function srOnly(text: string): string {
  return `<span class="sr-only">${text}</span>`;
}

function trueIcon(iconClass: string): string {
  return `<i class="${iconClass}" aria-hidden="true"></i>${srOnly('True')}`;
}

// These take the display form only, as render: { display: fn }. DataTables then
// sorts and searches on the raw value. igTimestamp is the exception.
export function username(data: string, _type: string, row: User): string {
  return `<a role="button" target="_blank" href="${profileUrl(data)}"><img src="${row['profile_pic_url']}" class="ig-profile-pic" loading="lazy" aria-hidden="true">&nbsp;&nbsp;${data}</a>`;
}

export function igTimestamp(data: number | null, type: string): string | number {
  if (type !== 'display' && type !== 'filter') {
    return data ?? 0;
  }
  if (!data) {
    return '';
  }
  const month = type === 'display' ? 'short' : 'long';
  // data is in seconds, transform to ms
  return new Date(data * 1000).toLocaleDateString(undefined, {
    day: 'numeric',
    month,
    year: 'numeric',
  });
}

export function storyViewStatus(data: number): string {
  return STORY_STATUSES[data]?.label ?? '';
}

export function hasStory(data: boolean, _type: string, row: User): string {
  if (data !== true) {
    return srOnly('False');
  }
  const icon = STORY_STATUSES[row['story_view_status'] as number]?.icon ?? '';
  return trueIcon(`fa ig-story ${icon}`);
}

// only provide row to check if data is known or not, i.e. user is public or followed by viewer
export function iconForBoolean(iconClass: string, data: boolean, row?: User): string {
  if (data === true) {
    return trueIcon(iconClass);
  }
  const known = row && (!row['is_private'] || row.followed_by_viewer);
  return srOnly(known ? 'False' : 'Unknown');
}

export function buttonForBoolean(trueText: string, data: boolean): string {
  if (data !== true) {
    return srOnly('False');
  }
  // tabindex="-1" disables keyboard focus (via TAB key)
  return `<button class="btn disabled" tabindex="-1">${trueText}</button>`;
}
