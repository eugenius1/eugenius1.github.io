/// <reference path="../../js/utils/storage.js" />

const storageKeyPrefix = '/projects/instagram-lists/';
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

const usernameForm = document.getElementById('username-form');
const igUsernameFallbackLink = document.getElementById('ig-username-fallback-link');
const igUsernameFallbackParent = document.getElementById('ig-username-fallback');
const inputListsForm = document.getElementById('input-lists-form');
const inputListsTextArea = document.getElementById('inputLists');

const firstCsvButton = document.getElementById('first-csv-button');
const firstCsvParent = document.getElementById('first-csv');
const firstListSizeSpan = document.getElementById('first-list-size');
const firstTimeEstimateSpan = document.getElementById('first-time-estimate');

const firstTable = $('#first-table'); // need to use jQuery for DataTable
var firstDataTable;

usernameForm.onsubmit = onSubmitUsername;
inputListsForm.onsubmit = onSubmitInputLists;
firstCsvButton.onclick = onClickGetFirstCsv;

// Inspired by https://stackoverflow.com/a/8212878/5288481
// limit sets how many parts to include
function secondsToStr(totalSeconds, limit = 2) {
  let result = '';
  let partsCount = 0;
  let remainderSeconds = totalSeconds;

  function numberEnding(number) {
    return (number > 1) ? 's' : '';
  }

  function append(newPart) {
    if (partsCount < limit) {
      if (result.length !== 0) {
        result += ', ';
      }
      result += newPart;
      partsCount += 1;
    }
  }

  let years = Math.floor(remainderSeconds / 31536000);
  if (years) {
    append(years + ' year' + numberEnding(years));
  }
  let weeks = Math.floor((remainderSeconds %= 31536000) / 604800);
  if (weeks) {
    append(weeks + ' week' + numberEnding(weeks));
  }
  let days = Math.floor((remainderSeconds %= 604800) / 86400);
  if (days) {
    append(days + ' day' + numberEnding(days));
  }
  let hours = Math.floor((remainderSeconds %= 86400) / 3600);
  if (hours) {
    append(hours + ' hour' + numberEnding(hours));
  }
  let minutes = Math.floor((remainderSeconds %= 3600) / 60);
  if (minutes) {
    append(minutes + ' minute' + numberEnding(minutes));
  }
  let seconds = remainderSeconds % 60;
  if (seconds) {
    append(seconds + ' second' + numberEnding(seconds));
  }
  return result;
}

// Inspired by https://stackoverflow.com/a/11257124/5288481
function objArrayToCsv(objArray, header = true) {
  // parse to object if not already one
  let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  let str = '';

  // header row
  if (header && array.length >= 1) {
    let line = '';
    for (let key in array[0]) {
      if (line != '') {
        line += ',';
      }
      line += key;
    }
    str += line + '\r\n';
  }

  for (let i = 0; i < array.length; i++) {
    let line = '';
    for (let index in array[i]) {
      if (line != '') {
        line += ',';
      }
      let field = array[i][index];
      if (typeof (field) === 'string' && field.match('[,"]')) {
        if (field.includes('"')) {
          // " becomes ""
          field = field.replace('"', '""');
        }
        // surround in double quotes
        field = `"${field}"`;
      }
      line += field;
    }
    str += line + '\r\n';
  }

  return str;
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

    firstListSizeSpan.innerText = String(firstSelectedList.length);
    // (interval + response time)
    let estimatedTime = ((36 + 2) * firstSelectedList.length);
    firstTimeEstimateSpan.innerText = secondsToStr(estimatedTime);

    setDataInTable(firstDataTable, firstSelectedList);

    storeAfterSubmitInputLists();

  } catch (error) {
    console.error(error);
    alert(error);
  }
}

async function storeAfterSubmitInputLists() {
  storage.setItem(storageKeys.inputListsTextArea, inputListsTextArea.value);
  console.log(typeof (firstSelectedList));
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
  let codeEl = firstCsvParent.querySelector('code');
  // Display first the loading message in case the formatting takes some time
  firstCsvParent.style.display = 'block';
  codeEl.innerText = objArrayToCsv(firstSelectedList);
}

firstDataTable = firstTable.DataTable({
  columns: [
    {
      render: function name() {
       // if (type === 'display') {
          return '<div class="checkbox"><label><input type="checkbox" checked></label></div>'
        //}
      }
    },
    { data: 'username' },
    { data: 'full_name' },
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
            return '<button class="btn btn-default disabled">Following</button>';
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
            return '<button class="btn btn-default disabled">Requested</button>';
          }
          return '<span class="sr-only">Not requested</span>';
        }
        return data;
      }
    }
  ]
});

function setDataInTable(dataTable, data) {
  dataTable.clear();
  dataTable.rows.add(data).draw();
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

loadFromStorageIfAvailable();
