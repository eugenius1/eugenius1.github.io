import { isStorageAvailable, ScopedStorage } from '../storage';
import { objectArrayToCsv, secondsToString } from '../utils';
import { addInfo, profileUrl, selectList, type User } from './lists';
import {
  buttonForBoolean,
  hasStory,
  iconForBoolean,
  igTimestamp,
  storyViewStatus,
  username,
} from './renderers';

const storage = isStorageAvailable() ? new ScopedStorage('project-instagram-lists/') : null;

const StorageKeys = {
  inputListsTextArea: 'inputListsTextArea',
  listSelectionRadios: 'listSelectionRadios',
  firstSelectedList: 'firstSelectedList',
  moreDetails: 'moreDetails',
} as const;

let firstSelectedList: User[] = [];

function byId<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function firstCode(parent: HTMLElement): HTMLElement {
  return parent.getElementsByTagName('code')[0] as HTMLElement;
}

interface InputListsControls extends HTMLFormControlsCollection {
  inputLists: HTMLTextAreaElement;
  listSelectionRadios: RadioNodeList;
}

interface MoreDetailsControls extends HTMLFormControlsCollection {
  moreDetails: HTMLTextAreaElement;
}

const usernameInput = byId<HTMLInputElement>('username');
const igUsernameFallbackLink = byId<HTMLAnchorElement>('ig-username-fallback-link');
const inputListsForm = byId<HTMLFormElement>('input-lists-form');
const inputControls = inputListsForm.elements as InputListsControls;
const inputListsTextArea = inputControls.inputLists;
const listSelectionRadios = inputControls.listSelectionRadios;

const firstCsvParent = byId('first-csv');
const firstCsvCode = firstCode(firstCsvParent);
const firstListSizeSpan = byId('first-list-size');
const firstTimeEstimateSpan = byId('first-time-estimate');

const prunedUsernameListCode = firstCode(byId('pruned-username-list'));
const prunedListSizeSpan = byId('pruned-list-size');
const secondTimeEstimateSpan = byId('second-time-estimate');

const moreDetailsForm = byId<HTMLFormElement>('more-details-form');
const moreDetailsTextArea = (moreDetailsForm.elements as MoreDetailsControls).moreDetails;

const USERNAME_COLUMN_WIDTH = 230; // 30-character username fits

// https://github.com/DataTables/Plugins
// Sort based on the checked state of checkboxes in a column
$.fn.dataTable.ext.order['dom-checkbox'] = function (this: DataTableContext, _settings, col) {
  return this.api()
    .column(col, { order: 'index' })
    .nodes()
    .map((td: HTMLElement) => ($('input', td).prop('checked') ? '1' : '0'));
};

// useRow tells apart false from unknown for fields hidden on private accounts
function icon(data: string, className: string, useRow = false) {
  return {
    data,
    searchable: false,
    className: 'dt-body-center',
    render: {
      display: (value: boolean, _type: string, row: User) =>
        iconForBoolean(className, value, useRow ? row : undefined),
    },
  };
}

function button(data: string, text: string, className = 'dt-body-center') {
  return {
    data,
    searchable: false,
    className,
    render: { display: (value: boolean) => buttonForBoolean(text, value) },
  };
}

function number(data: string) {
  return {
    data,
    className: 'dt-body-right small',
    render: $.fn.dataTable.render.number(',', '.'),
  };
}

const usernameColumn = {
  data: 'username',
  width: USERNAME_COLUMN_WIDTH,
  render: { display: username },
};
const fullNameColumn = { data: 'full_name', className: 'small' };
const isPrivateColumn = icon('is_private', 'fa fa-lock');
const isVerifiedColumn = icon('is_verified', 'fa fa-certificate ig-verified');
const followsViewerColumn = icon('follows_viewer', 'fa fa-check');

const firstDataTable = $('#first-table').DataTable({
  columns: [
    {
      className: 'dt-body-center',
      orderDataType: 'dom-checkbox',
      render: (_data: unknown, type: string, row: User) => {
        if (type === 'display') {
          return `<label><input type="checkbox" name="${row.username}" checked></label>`;
        }
        return true;
      },
    },
    usernameColumn,
    fullNameColumn,
    isPrivateColumn,
    isVerifiedColumn,
    {
      data: 'has_story',
      searchable: false,
      className: 'dt-body-center',
      render: { display: hasStory },
    },
    {
      data: 'story_view_status',
      searchable: false,
      className: 'small',
      render: { display: storyViewStatus },
    },
    followsViewerColumn,
    button('followed_by_viewer', 'Following'),
    button('requested_by_viewer', 'Requested'),
  ],
});

const secondDataTable = $('#second-table').DataTable({
  scrollX: true,
  deferRender: true, // not on the first table, which reads checkboxes from every row
  fixedColumns: { leftColumns: 2 },
  columns: [
    usernameColumn,
    fullNameColumn,
    isPrivateColumn,
    followsViewerColumn,
    button('followed_by_viewer', 'Following', 'dt-body-center small'),
    button('requested_by_viewer', 'Requested', 'dt-body-center small'),
    number('follow_count'),
    number('followed_by_count'),
    number('mutual_followed_by_count'),
    icon('is_joined_recently', 'fa fa-check'),
    isVerifiedColumn,
    icon('is_business_account', 'fa fa-briefcase'),
    { data: 'business_category_name', className: 'small' },
    number('posts_count'),
    { data: 'last_post_timestamp', className: 'dt-body-right small', render: igTimestamp },
    number('story_highlights_count'),
    icon('has_igtv', 'fa fa-television', true),
    icon('has_reel_clips', 'fa fa-youtube-play', true),
    icon('has_ar_effects', 'fa fa-smile-o', true),
    icon('has_guides', 'fa fa-newspaper-o', true),
  ],
});

function handleError(error: unknown): void {
  console.error(error);
  alert(
    `Sorry, an error occurred. Re-paste any data you recently pasted and retry. If it still doesn't work then please leave a comment with or send me this:\n${error}`,
  );
}

function setDataInTable(dataTable: DataTableApi, data: User[]): void {
  dataTable.clear();
  dataTable.rows.add(data).draw();
}

function updateDisplayedListInfo(
  length: number,
  listSizeEl: HTMLElement,
  timeEstimateEl: HTMLElement,
): void {
  listSizeEl.textContent = String(length);

  // (interval + response time)
  const estimatedTime = (36 + 2) * length;
  timeEstimateEl.textContent = secondsToString(estimatedTime);
}

function onSubmitUsername(event: Event): void {
  const link = `${profileUrl(usernameInput.value)}?__a=1&__d=dis`;

  window.open(link, '_blank');
  window.focus();

  igUsernameFallbackLink.href = link;
  igUsernameFallbackLink.textContent = link;
  byId('ig-username-fallback').style.display = 'block';

  event.preventDefault();
}

function onSubmitInputLists(event: Event): void {
  event.preventDefault();
  try {
    const inputLists = JSON.parse(inputListsTextArea.value);
    const followers: User[] = inputLists.followers || [];
    const followings: User[] = inputLists.followings || [];

    const selected = selectList(listSelectionRadios.value, followers, followings);
    if (selected === null) {
      alert('Missing choice of list');
    } else {
      firstSelectedList = selected;
    }

    addInfo(firstSelectedList, followers);
    updateDisplayedListInfo(firstSelectedList.length, firstListSizeSpan, firstTimeEstimateSpan);
    setDataInTable(firstDataTable, firstSelectedList);
  } catch (error) {
    handleError(error);
  }
  storage?.setItem(StorageKeys.inputListsTextArea, inputListsTextArea.value);
  storage?.setItem(StorageKeys.firstSelectedList, firstSelectedList);
  storage?.setItem(StorageKeys.listSelectionRadios, listSelectionRadios.value);
}

function onClickGetFirstCsv(): void {
  // Display first the loading message in case the formatting takes some time
  firstCsvParent.style.display = 'block';
  firstCsvCode.textContent = objectArrayToCsv(firstSelectedList);
}

function onClickSetAllCheckboxesAs(checked: boolean) {
  return function () {
    firstDataTable.$(':checkbox').prop('checked', checked);
  };
}

function onClickSubmitPrunedList(): void {
  const selectedCheckboxes = firstDataTable.$(':checkbox').serializeArray();
  const prunedUsernameList = selectedCheckboxes.map((checkbox) => checkbox.name);
  updateDisplayedListInfo(prunedUsernameList.length, prunedListSizeSpan, secondTimeEstimateSpan);
  prunedUsernameListCode.textContent =
    `prunedUsernameList = ${JSON.stringify(prunedUsernameList)};\n` + 'getMoreDetails()';
}

function onSubmitMoreDetails(event: Event): void {
  event.preventDefault();
  try {
    const moreDetails: User[] = JSON.parse(moreDetailsTextArea.value);
    setDataInTable(secondDataTable, moreDetails);
    storage?.setItem(StorageKeys.moreDetails, moreDetails);
  } catch (error) {
    handleError(error);
  }
}

function restoreTable(key: string, dataTable: DataTableApi): User[] {
  const stored = storage?.getItem<User[]>(key) ?? [];
  // try-catch in case the stored data is incompatible with the recent table
  try {
    if (stored.length > 0) {
      setDataInTable(dataTable, stored);
    }
  } catch (e) {
    console.error(e);
  }
  return stored;
}

function loadFromStorageIfAvailable(): void {
  inputListsTextArea.value =
    storage?.getItem(StorageKeys.inputListsTextArea) ?? inputListsTextArea.value;
  listSelectionRadios.value =
    storage?.getItem(StorageKeys.listSelectionRadios) ?? listSelectionRadios.value;
  firstSelectedList = restoreTable(StorageKeys.firstSelectedList, firstDataTable);
  restoreTable(StorageKeys.moreDetails, secondDataTable);
}

function onClickClearStorage(): void {
  storage?.clear();

  usernameInput.value = '';
  inputListsTextArea.value = '';
  listSelectionRadios.value = '';
  firstCsvCode.textContent = '';
  firstListSizeSpan.textContent = '';
  firstTimeEstimateSpan.textContent = '';
  prunedUsernameListCode.textContent = '';
  prunedListSizeSpan.textContent = '';
  secondTimeEstimateSpan.textContent = '';

  setDataInTable(firstDataTable, []);
  setDataInTable(secondDataTable, []);

  firstSelectedList = [];
}

byId<HTMLFormElement>('username-form').onsubmit = onSubmitUsername;
inputListsForm.onsubmit = onSubmitInputLists;
byId('first-csv-button').onclick = onClickGetFirstCsv;
byId('first-select-all').onclick = onClickSetAllCheckboxesAs(true);
byId('first-unselect-all').onclick = onClickSetAllCheckboxesAs(false);
moreDetailsForm.onsubmit = onSubmitMoreDetails;
byId('submit-pruned-list').onclick = onClickSubmitPrunedList;
byId('clear-storage').onclick = onClickClearStorage;

secondDataTable.on('length.dt', function () {
  // Using FixedColumns means having to redraw when the page length changes, otherwise misalignment
  secondDataTable.draw();
});

loadFromStorageIfAvailable();
