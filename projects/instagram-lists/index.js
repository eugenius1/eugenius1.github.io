/// <reference path="../../js/utils/utils.js" />
/// <reference path="../../js/utils/storage.js" />

const storageKeyPrefix = 'project-instagram-lists/';
const storageTypeUsed = storageTypes.sessionStorage;
var storage = new ScopedStorage(storageKeyPrefix, storageTypeUsed);
const storageKeys = {
  inputListsTextArea: 'inputListsTextArea',
  firstSelectedList: 'firstSelectedList'
};

var username = '';
var followers = [];
var followings = [];
var firstSelectedList = [];
var prunedUsernameList = [];

const usernameForm = document.getElementById('username-form');
const igUsernameFallbackLink = document.getElementById('ig-username-fallback-link');
const igUsernameFallbackParent = document.getElementById('ig-username-fallback');
const inputListsForm = document.getElementById('input-lists-form');
const inputListsTextArea = document.getElementById('inputLists');

const firstCsvButton = document.getElementById('first-csv-button');
const firstCsvParent = document.getElementById('first-csv');
const firstCsvCode = firstCsvParent.getElementsByTagName('code')[0];
const firstListSizeSpan = document.getElementById('first-list-size');
const firstTimeEstimateSpan = document.getElementById('first-time-estimate');
const firstTable = $('#first-table'); // need to use jQuery for DataTable
var firstDataTable;

const submitPrunedListButton = $('#submit-pruned-list');
const prunedUsernameListCode = document.getElementById('pruned-username-list').getElementsByTagName('code')[0];
const prunedListSizeSpan = document.getElementById('pruned-list-size');
const secondTimeEstimateSpan = document.getElementById('second-time-estimate');

const secondTable = $('#second-table');
var secondDataTable;

const clearStorageButton = document.getElementById('clear-storage');

const firstDataTableArgs = {
  columns: [
    {
      render: function name(data, type, row) {
        return `<div class="checkbox"><label><input type="checkbox" name="${row.username}" value ="" checked></label></div>`;
      }
    },
    {
      data: 'username',
      render: function (data, type, row) {
        if (type === 'display') {
          return `<a class="btn btn-default-outline ig-username" role="button" target="_blank" href="https://www.instagram.com/${data}/"><img src="${row.profile_pic_url}" class="img-circle ig-profile-pic" aria-hidden="true">&nbsp;&nbsp;${data}</a>`;
        }
        return data;
      }
    },
    {
      data: 'full_name',
      render: function (data, type) {
        if (type === 'display') {
          return `<small>${data}</small>`;
        }
        return data;
      }
    },
    {
      data: 'is_private',
      className: 'text-center',
      render: function (data, type) {
        if (type === 'display') {
          if (data === true) {
            return '<i class="fa fa-lock" aria-hidden="true"></i><span class="sr-only">Private</span>';
          }
          return '<span class="sr-only">Not private</span>';
        }
        return data;
      }
    },
    {
      data: 'is_verified',
      className: 'text-center',
      render: function (data, type) {
        if (type === 'display') {
          if (data === true) {
            return '<i class="fa fa-check ig-verified" aria-hidden="true"></i><span class="sr-only">Verified</span>';
          }
          return '<span class="sr-only">Not verified</span>';
        }
        return data;
      }
    },
    {
      data: 'has_story',
      className: 'text-center',
      render: function (data, type) {
        if (type === 'display') {
          if (data === true) {
            return '<i class="fa fa-circle-thin ig-story" aria-hidden="true"></i><span class="sr-only">Has story</span>';
          }
          return '<span class="sr-only">Has story</span>';
        }
        return data;
      }
    },
    {
      data: 'followed_by_viewer',
      className: 'text-center',
      render: function (data, type) {
        if (type === 'display') {
          if (data === true) {
            // tabindex="-1" disables keyboard focus (via TAB key)
            return '<button class="btn btn-default disabled" tabindex="-1">Following</button>';
          }
          return '<span class="sr-only">Not following</span>';
        }
        return data;
      }
    },
    {
      data: 'requested_by_viewer',
      className: 'text-center',
      render: function (data, type) {
        if (type === 'display') {
          if (data === true) {
            return '<button class="btn btn-default disabled" tabindex="-1">Requested</button>';
          }
          return '<span class="sr-only">Not requested</span>';
        }
        return data;
      }
    }
  ]
}

function setDataInTable(dataTable, data) {
  dataTable.clear();
  dataTable.rows.add(data).draw();
}

function updateDisplayedListInfo(length, listSizeEl, timeEstimateEl) {
  listSizeEl.textContent = String(length);

  // (interval + response time)
  let estimatedTime = ((36 + 2) * length);
  timeEstimateEl.textContent = secondsToStr(estimatedTime);
}

function onSubmitUsername(event) {
  username = usernameForm.username.value;
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
    addUserUrl(followers);
    addUserUrl(followings);

    switch (inputListsForm.prunedListRadios.value) {
      case "all_wers":
        firstSelectedList = followers;
        break;
      case "all_wings":
        firstSelectedList = followings;
        break;
      case "1_way_wers":
        firstSelectedList = oneWayFollowers(followers);
        break;
      case "1_way_wings":
        firstSelectedList = arrayDifference(followings, followers);
        break;
      case "friends":
        firstSelectedList = arrayIntersection(followers, followings);
        break;
      case "all":
        firstSelectedList = arrayUnion(followers, followings);
        break;
      default:
        alert('Missing choice of list')
    }

    updateDisplayedListInfo(firstSelectedList.length, firstListSizeSpan, firstTimeEstimateSpan);

    setDataInTable(firstDataTable, firstSelectedList);

    storeAfterSubmitInputLists();

  } catch (error) {
    console.error(error);
    alert(error);
  }
}

async function storeAfterSubmitInputLists() {
  storage.setItem(storageKeys.inputListsTextArea, inputListsTextArea.value);
  storage.setItem(storageKeys.firstSelectedList, firstSelectedList);
}

function addUserUrl(userList) {
  for (let i = 0; i < userList.length; ++i) {
    userList[i].url = `https://www.instagram.com/${userList[i].username}/`;
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
  let result = first;
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
  firstCsvCode.textContent = objArrayToCsv(firstSelectedList);
}

function onSubmitPrunedList() {
  let selectedCheckboxes = firstDataTable.$('input').serializeArray();
  prunedUsernameList = selectedCheckboxes.map((checkbox) => { return checkbox.name; });
  updateDisplayedListInfo(prunedUsernameList.length, prunedListSizeSpan, secondTimeEstimateSpan);
  prunedUsernameListCode.textContent = `prunedUsernameList = ${JSON.stringify(prunedUsernameList)}`;
  return false;
}

function loadFromStorageIfAvailable() {
  if (storageAvailable(storageTypeUsed)) {
    let stored = storage.getItem(storageKeys.inputListsTextArea)
    if (stored != null) {
      inputListsTextArea.value = stored;
    }
    stored = storage.getItem(storageKeys.firstSelectedList)
    if (stored != null) {
      firstSelectedList = stored;
      setDataInTable(firstDataTable, firstSelectedList);
    }
  }
}

function onClickClearStorage() {
  storage.clear();

  usernameForm.username.value = '';
  inputListsTextArea.value = '';
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
}

$(document).ready(function () {
  usernameForm.onsubmit = onSubmitUsername;
  inputListsForm.onsubmit = onSubmitInputLists;
  firstCsvButton.onclick = onClickGetFirstCsv;

  firstDataTable = firstTable.DataTable(firstDataTableArgs);
  submitPrunedListButton.click(onSubmitPrunedList);

  clearStorageButton.onclick = onClickClearStorage;

  loadFromStorageIfAvailable();
})
