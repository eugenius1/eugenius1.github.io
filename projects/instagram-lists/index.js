var username = '';
var followers = [];
var followings = [];
var selectedList = [];

const usernameForm = document.getElementById('username-form');
const inputListsForm = document.getElementById('input-lists-form');
const inputListsTextArea = document.getElementById('inputLists');

usernameForm.onsubmit = onSubmitUsername;
inputListsForm.onsubmit = onSubmitInputLists;

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
    switch (inputListsForm.prunedListRadios.value) {
      case "all_wers":
        selectedList = followers;
        break;
      case "all_wings":
        selectedList = followings;
        break;
      case "1_way_wers":
        selectedList = oneWayFollowers(followers);
        break;
      case "1_way_wings":
        selectedList = arrayDifference(followings, followers);
        break;
      case "friends":
        selectedList = arrayIntersection(followers, followings);
        break;
      case "all":
        selectedList = arrayUnion(followers, followings);
        break;
      default:
        alert('Missing choice of list')
    }
    document.getElementById('first-list-size').innerText = String(selectedList.length);
    document.getElementById('first-time-estimate').innerText = secondsToStr(36 * selectedList.length);
  } catch (error) {
    console.error(error);
    alert(error);
  }
  event.preventDefault();
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


// Inspired from https://stackoverflow.com/a/8212878/5288481
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