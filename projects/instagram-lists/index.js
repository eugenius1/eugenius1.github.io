var username = '';
var followers = [];
var followings = [];
var firstSelectedList = [];

const usernameForm = document.getElementById('username-form');
const inputListsForm = document.getElementById('input-lists-form');
const inputListsTextArea = document.getElementById('inputLists');
const firstCsvButton = document.getElementById('first-csv-button');
const firstCsvParent = document.getElementById('first-csv');

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
function objArrayToCsv(objArray, header=true) {
  // parse to object if not already one
  let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  let str = '';

  // header row
  if (header && array.length >= 1) {
    let line = '';
    for (var key in array[0]) {
      if (line != '') {
        line += ',';
      }
      line += key;
    }
    str += line + '\r\n';
  }

  for (var i = 0; i < array.length; i++) {
    let line = '';
    for (var index in array[i]) {
      if (line != '') {
        line += ',';
      }
      let field = array[i][index];
      if (typeof(field) === 'string' && field.match('[,"]')) {
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

  let fallbackLink = document.getElementById('ig-username-fallback-link');
  fallbackLink.href = link;
  fallbackLink.textContent = link;
  let fallbackParent = document.getElementById('ig-username-fallback');
  fallbackParent.style.display = 'block';

  event.preventDefault();
}

function onSubmitInputLists(event) {
  let inputLists = {};
  try {
    inputLists = JSON.parse(inputListsTextArea.value);
    followers = inputLists.followers;
    followings = inputLists.followings;
    addLinks(followers);
    addLinks(followings);
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
    document.getElementById('first-list-size').innerText = String(firstSelectedList.length);
    document.getElementById('first-time-estimate').innerText = secondsToStr(36 * firstSelectedList.length);
  } catch (error) {
    console.error(error);
    alert(error);
  }
  event.preventDefault();
}

function addLinks(userList) {
  for (var i=0; i< userList.length; ++i){
    userList[i].link = `https://www.instagram.com/${userList[i].username}/`;
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
  codeEl.innerText = objArrayToCsv(firstSelectedList);
  firstCsvParent.style.display = 'block';
}
