/// <reference path="../../js/utils/utils.js" />
/// <reference path="../../js/utils/storage.js" />

// also in ./satellite.js
const StoryViewStatus = Object.freeze({ na: 0, none: 1, partial: 2, all: 3 });

const storageTypeUsed = storageTypes.sessionStorage;
const storageAvailable = isStorageAvailable(storageTypeUsed);
var storage = null;
if (storageAvailable) {
  storage = new ScopedStorage('project-instagram-lists/', storageTypeUsed);
}
const StorageKeys = Object.freeze({
  inputListsTextArea: 'inputListsTextArea',
  listSelectionRadios: 'listSelectionRadios',
  firstSelectedList: 'firstSelectedList',
  moreDetails: 'moreDetails'
});

const ListSelections = Object.freeze({
  all_followers: "all_wers",
  all_followings: "all_wings",
  one_way_followers: "1_way_wers",
  one_way_followings: "1_way_wings",
  friends: "friends", // a friend is both a follower and a following
  all: "all"
});

var followers = [];
var followings = [];
var firstSelectedList = [];
var prunedUsernameList = [];
var moreDetails = [];

const usernameForm = document.getElementById('username-form');
const igUsernameFallbackLink = document.getElementById('ig-username-fallback-link');
const igUsernameFallbackParent = document.getElementById('ig-username-fallback');
const inputListsForm = document.getElementById('input-lists-form');
const inputListsTextArea = inputListsForm.elements.inputLists;
const listSelectionRadios = inputListsForm.elements.listSelectionRadios;

const firstCsvButton = document.getElementById('first-csv-button');
const firstCsvParent = document.getElementById('first-csv');
const firstCsvCode = firstCsvParent.getElementsByTagName('code')[0];
const firstListSizeSpan = document.getElementById('first-list-size');
const firstTimeEstimateSpan = document.getElementById('first-time-estimate');
const firstTableSelectAllButton = document.getElementById('first-select-all');
const firstTableUnselectAllButton = document.getElementById('first-unselect-all');
const firstTable = $('#first-table'); // need to use jQuery for DataTable
var firstDataTable;

const submitPrunedListButton = $('#submit-pruned-list');
const prunedUsernameListCode = document.getElementById('pruned-username-list').getElementsByTagName('code')[0];
const prunedListSizeSpan = document.getElementById('pruned-list-size');
const secondTimeEstimateSpan = document.getElementById('second-time-estimate');

const moreDetailsForm = document.getElementById('more-details-form');
const moreDetailsTextArea = moreDetailsForm.elements.moreDetails;
const secondTable = $('#second-table');
var secondDataTable;

const clearStorageButton = document.getElementById('clear-storage');

const usernameColumnWidth = 230; // 30-character username fits

const renderers = {
  username: function (data, type, row) {
    if (type === 'display') {
      return `<a class="btn btn-default-outline ig-username" role="button" target="_blank" href="https://www.instagram.com/${data}/"><img src="${row.profile_pic_url}" class="img-circle ig-profile-pic" aria-hidden="true">&nbsp;&nbsp;${data}</a>`;
    }
    return data;
  },
  igTimestamp: function (data, type) {
    if (type === 'display' || type === 'filter') {
      if (data) {
        let monthFormat = (type === 'display' ? 'short' : 'long');
        // data is in seconds, transform to ms
        return new Date(data * 1000).toLocaleDateString(
          getUserLanguage(),
          { day: 'numeric', month: monthFormat, year: 'numeric' });
      } else {
        return '';
      }
    }
    return (data === null ? 0 : data);
  },
  storyViewStatus: function (data, type) {
    if (type === 'display') {
      let text = '';
      switch (data) {
        case StoryViewStatus.none:
          text = 'Not viewed';
          break;
        case StoryViewStatus.partial:
          text = 'Partly viewed';
          break;
        case StoryViewStatus.all:
          text = 'Finished';
          break;
        default:
          break;
      }
      return text;
    }
    return data;
  },
  hasStory: function (data, type, row) {
    if (type === 'display') {
      let result = ''
      let srText = '';
      if (data === true) {
        srText = 'True';
        let iconClass = 'fa ';

        switch (row.story_view_status) {
          case StoryViewStatus.none:
            iconClass += 'fa-circle ig-story-not-viewed';
            break;
          case StoryViewStatus.partial:
            iconClass += 'fa-circle-thin ig-story-partly-viewed';
            break;
          case StoryViewStatus.all:
            iconClass += 'fa-circle-thin ig-story-finished';
            break;
          default:
            break;
        }
        result += `<i class="${iconClass}" aria-hidden="true"></i>`;
      } else {
        srText = 'False';
      }
      result += `<span class="sr-only">${srText}</span>`;
      return result;
    }
    return data;
  },
  // only provide row to check if data is known or not, i.e. user is public or followed by viewer
  iconForBoolean: function (iconClass, data, type, row = null) {
    if (type === 'display') {
      let result = ''
      let srText = 'Unknown';
      if (data === true) {
        result += `<i class="${iconClass}" aria-hidden="true"></i>`;
        srText = 'True';
      } else if (row && (!row.is_private || row.followed_by_viewer)) {
        srText = 'False';
      }
      result += `<span class="sr-only">${srText}</span>`;
      return result;
    }
    return data;
  },
  buttonForBoolean: function (trueText, data, type) {
    if (type === 'display') {
      if (data === true) {
        // tabindex="-1" disables keyboard focus (via TAB key)
        return `<button class="btn btn-default disabled" tabindex="-1">${trueText}</button>`;
      }
      return '<span class="sr-only">False</span>';
    }
    return data;
  }
}

const firstDataTableArgs = {
  autoWidth: true,
  columns: [
    {
      className: 'body-center',
      render: function name(data, type, row) {
          return `<div class="checkbox"><label><input type="checkbox" name="${row.username}" checked></label></div>`;
        }
    },
    {
      data: 'username',
      width: usernameColumnWidth,
      render: renderers.username
    },
    {
      data: 'full_name',
      className: 'small'
    },
    {
      data: 'is_private',
      searchable: false,
      className: 'body-center',
      render: function (data, type) { return renderers.iconForBoolean('fa fa-lock', data, type); }
    },
    {
      data: 'is_verified',
      searchable: false,
      className: 'body-center',
      render: function (data, type) { return renderers.iconForBoolean('fa fa-certificate ig-verified', data, type); }
    },
    {
      data: 'has_story',
      searchable: false,
      className: 'body-center',
      render: renderers.hasStory
    },
    {
      data: 'story_view_status',
      searchable: false,
      className: 'body-left small',
      render: renderers.storyViewStatus
    },
    {
      data: 'follows_viewer',
      searchable: false,
      className: 'body-center',
      render: function (data, type) { return renderers.iconForBoolean('fa fa-check', data, type); }
    },
    {
      data: 'followed_by_viewer',
      searchable: false,
      className: 'body-center',
      render: function (data, type) { return renderers.buttonForBoolean('Following', data, type); }
    },
    {
      data: 'requested_by_viewer',
      searchable: false,
      className: 'body-center',
      render: function (data, type) { return renderers.buttonForBoolean('Requested', data, type); }
    }
  ]
}

const secondDataTableArgs = {
  autoWidth: true,
  scrollX: true,
  fixedColumns: {
    leftColumns: 2
  },
  columns: [
    {
      data: 'username',
      width: usernameColumnWidth,
      render: renderers.username
    },
    {
      data: 'full_name',
      className: 'small'
    },
    {
      data: 'is_private',
      searchable: false,
      className: 'body-center',
      render: function (data, type) { return renderers.iconForBoolean('fa fa-lock', data, type); }
    },
    {
      data: 'follows_viewer',
      searchable: false,
      className: 'body-center',
      render: function (data, type) { return renderers.iconForBoolean('fa fa-check', data, type); }
    },
    {
      data: 'followed_by_viewer',
      searchable: false,
      className: 'body-center small',
      render: function (data, type) { return renderers.buttonForBoolean('Following', data, type); }
    },
    {
      data: 'requested_by_viewer',
      searchable: false,
      className: 'body-center small',
      render: function (data, type) { return renderers.buttonForBoolean('Requested', data, type); }
    },
    {
      data: 'follow_count',
      className: 'body-right small',
      render: $.fn.dataTable.render.number(',', '.')
    },
    {
      data: 'followed_by_count',
      className: 'body-right small',
      render: $.fn.dataTable.render.number(',', '.')
    },
    {
      data: 'mutual_followed_by_count',
      className: 'body-right small',
      render: $.fn.dataTable.render.number(',', '.')
    },
    {
      data: 'is_joined_recently',
      searchable: false,
      className: 'body-center',
      render: function (data, type) { return renderers.iconForBoolean('fa fa-check', data, type); }
    },
    {
      data: 'is_verified',
      searchable: false,
      className: 'body-center',
      render: function (data, type) { return renderers.iconForBoolean('fa fa-certificate ig-verified', data, type); }
    },
    {
      data: 'is_business_account',
      searchable: false,
      className: 'body-center',
      render: function (data, type) { return renderers.iconForBoolean('fa fa-briefcase', data, type); }
    },
    {
      data: 'business_category_name',
      className: 'small'
    },
    {
      data: 'posts_count',
      className: 'body-right small',
      render: $.fn.dataTable.render.number(',', '.')
    },
    {
      data: 'last_post_timestamp',
      className: 'body-right small',
      render: renderers.igTimestamp
    },
    {
      data: 'story_highlights_count',
      className: 'body-right small',
      render: $.fn.dataTable.render.number(',', '.')
    },
    {
      data: 'has_igtv',
      searchable: false,
      className: 'body-center',
      render: function (data, type, row) { return renderers.iconForBoolean('fa fa-television', data, type, row); }
    },
    {
      data: 'has_reel_clips',
      searchable: false,
      className: 'body-center',
      render: function (data, type, row) { return renderers.iconForBoolean('fa fa-youtube-play', data, type, row); }
    },
    {
      data: 'has_ar_effects',
      searchable: false,
      className: 'body-center',
      render: function (data, type, row) { return renderers.iconForBoolean('fa fa-smile-o', data, type, row); }
    },
    {
      data: 'has_guides',
      searchable: false,
      className: 'body-center',
      render: function (data, type, row) { return renderers.iconForBoolean('fa fa-newspaper-o', data, type, row); }
    }
  ]
}

function handleError(error) {
  console.error(error);
  alert(`Sorry, an error occurred! Re-paste any data you recently pasted and retry. If it still doesn't work then please leave a comment with or send me this:\n${error}`);
}

function setDataInTable(dataTable, data) {
  dataTable.clear();
  dataTable.rows.add(data).draw();
}

function updateDisplayedListInfo(length, listSizeEl, timeEstimateEl) {
  listSizeEl.textContent = String(length);

  // (interval + response time)
  let estimatedTime = ((36 + 2) * length);
  timeEstimateEl.textContent = secondsToString(estimatedTime);
}

function onSubmitUsername(event) {
  let username = usernameForm.username.value;
  let link = `https://www.instagram.com/${username}/?__a=1`;

  window.open(link, '_blank');
  window.focus();

  igUsernameFallbackLink.href = link;
  igUsernameFallbackLink.textContent = link;
  igUsernameFallbackParent.style.display = 'block';

  event.preventDefault();
}

function onSubmitInputLists(event) {
  event.preventDefault();
  let inputLists = {};
  try {
    inputLists = JSON.parse(inputListsTextArea.value);
    followers = inputLists.followers;
    followings = inputLists.followings;

    switch (listSelectionRadios.value) {
      case ListSelections.all_followers:
        firstSelectedList = followers;
        break;
      case ListSelections.all_followings:
        firstSelectedList = followings;
        break;
      case ListSelections.one_way_followers:
        firstSelectedList = oneWayFollowers(followers);
        break;
      case ListSelections.one_way_followings:
        firstSelectedList = arrayDifference(followings, followers);
        break;
      case ListSelections.friends:
        firstSelectedList = arrayIntersection(followers, followings);
        break;
      case ListSelections.all:
        firstSelectedList = arrayUnion(followers, followings);
        break;
      default:
        alert('Missing choice of list')
    }

    addInfo(firstSelectedList, followers);

    updateDisplayedListInfo(firstSelectedList.length, firstListSizeSpan, firstTimeEstimateSpan);

    setDataInTable(firstDataTable, firstSelectedList);

  } catch (error) {
    handleError(error);
  }
  storeAfterSubmitInputLists();
}

function storeAfterSubmitInputLists() {
  if (storageAvailable) {
    storage.setItem(StorageKeys.inputListsTextArea, inputListsTextArea.value);
    storage.setItem(StorageKeys.firstSelectedList, firstSelectedList);
    storage.setItem(StorageKeys.listSelectionRadios, listSelectionRadios.value);
  }
}

// Add properties follows_viewer and url to the first selected list
function addInfo(selectedList, followers) {
  let followersIdSet = new Set();
  followers.forEach(user => followersIdSet.add(user.id));

  for (let i = 0; i < selectedList.length; ++i) {
    // add the URL in case a CSV is needed
    selectedList[i].url = `https://www.instagram.com/${selectedList[i].username}/`;

    // use the list of followers to populate property `follows_viewer`
    selectedList[i].follows_viewer = followersIdSet.has(selectedList[i].id);
  }
}

function oneWayFollowers(followers) {
  // making use of followed_by_viewer which means viewer follows the account in question
  return followers.filter(user => !user.followed_by_viewer);
}

// Order of input parameters matters
// return (first - second)
function arrayDifference(first, second) {
  let secondIdSet = new Set();
  second.forEach(user => secondIdSet.add(user.id));
  return first.filter(user => !secondIdSet.has(user.id));
}

// Order of input parameters is irrelevant
function arrayIntersection(first, second) {
  let result = [];
  let firstIdSet = new Set();
  first.forEach(user => firstIdSet.add(user.id));
  second.forEach(item => {
    if (firstIdSet.has(item.id)) {
      result.push(item);
    }
  });
  return result;
}

// Order of input parameters is irrelevant
function arrayUnion(first, second) {
  let result = [...first]; // deep copy
  let firstIdSet = new Set();
  first.forEach(user => firstIdSet.add(user.id));
  second.forEach(item => {
    if (!firstIdSet.has(item.id)) {
      result.push(item);
    }
  });
  return result;
}

function onClickGetFirstCsv() {
  // Display first the loading message in case the formatting takes some time
  firstCsvParent.style.display = 'block';
  firstCsvCode.textContent = objectArrayToCsv(firstSelectedList);
}

function onClickSetAllCheckboxesAs(bool) {
  return function () {
    $.each(firstDataTable.$(':checkbox'), (i, checkbox) => {
      $(checkbox).prop('checked', bool);
    });
  }
}

function onClickSubmitPrunedList() {
  let selectedCheckboxes = firstDataTable.$(':checkbox').serializeArray();
  prunedUsernameList = selectedCheckboxes.map((checkbox) => { return checkbox.name; });
  updateDisplayedListInfo(prunedUsernameList.length, prunedListSizeSpan, secondTimeEstimateSpan);
  prunedUsernameListCode.textContent = `prunedUsernameList = ${JSON.stringify(prunedUsernameList)};\n` + 'getMoreDetails()';
  return false;
}

function onSubmitMoreDetails(event) {
  event.preventDefault();
  try {
    moreDetails = JSON.parse(moreDetailsTextArea.value);
    setDataInTable(secondDataTable, moreDetails);

  } catch (error) {
    handleError(error);
  }
  if (storageAvailable) {
    storage.setItem(StorageKeys.moreDetails, moreDetails);
  }
}

function loadFromStorageIfAvailable() {
  if (storageAvailable) {
    let stored = storage.getItem(StorageKeys.inputListsTextArea)
    if (stored != null) {
      inputListsTextArea.value = stored;
    }
    stored = storage.getItem(StorageKeys.listSelectionRadios)
    if (stored != null) {
      listSelectionRadios.value = stored;
    }
    stored = storage.getItem(StorageKeys.firstSelectedList)
    if (stored != null) {
      firstSelectedList = stored;
      // try-catch in case the stored data is incompatible with the recent table
      try {
        setDataInTable(firstDataTable, firstSelectedList);
      } catch (e) { console.error(e); }
    }
    stored = storage.getItem(StorageKeys.moreDetails)
    if (stored != null) {
      moreDetails = stored;
      try {
        setDataInTable(secondDataTable, moreDetails);
      } catch (e) { console.error(e); }
    }
  }
}

function onClickClearStorage() {
  if (storageAvailable) {
    storage.clear();
  }

  usernameForm.username.value = '';
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

  followers = [];
  followings = [];
  firstSelectedList = [];
  prunedUsernameList = [];
  moreDetails = [];
}

$(document).ready(function () {
  usernameForm.onsubmit = onSubmitUsername;
  inputListsForm.onsubmit = onSubmitInputLists;
  firstCsvButton.onclick = onClickGetFirstCsv;
  firstTableSelectAllButton.onclick = onClickSetAllCheckboxesAs(true);
  firstTableUnselectAllButton.onclick = onClickSetAllCheckboxesAs(false);
  moreDetailsForm.onsubmit = onSubmitMoreDetails;
  submitPrunedListButton.click(onClickSubmitPrunedList);
  clearStorageButton.onclick = onClickClearStorage;

  firstDataTable = firstTable.DataTable(firstDataTableArgs);
  secondDataTable = secondTable.DataTable(secondDataTableArgs);
  secondDataTable.on('length.dt', function (e, settings, newLength) {
    // Using FixedColumns means having to redraw when the page length changes, otherwise misalignment
    secondDataTable.draw();
  });

  loadFromStorageIfAvailable();
})
