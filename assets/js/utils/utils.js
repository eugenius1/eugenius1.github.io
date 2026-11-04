// Inspired by https://stackoverflow.com/a/31135571/5288481
function getUserLanguage() {
  if (navigator.languages !== undefined)
    return navigator.languages[0];
  else if (navigator.language !== undefined)
    return navigator.language;
  return 'en';
}

// Inspired by https://stackoverflow.com/a/8212878/5288481
// limit sets how many parts to include
function secondsToString(totalSeconds, limit = 2) {
  if (totalSeconds === 0){
    return '0 seconds';
  }
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
function objectArrayToCsv(objArray, header = true) {
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