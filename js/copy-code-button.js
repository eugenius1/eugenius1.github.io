// get all <code> elements
let allPreElements = document.getElementsByTagName('pre');

for (var i = 0; i < allPreElements.length; ++i) {
  let preEl = allPreElements[i];
  if (preEl.firstElementChild.tagName === 'CODE') {
    // add different id for each code block target
    let currentId = "code-block" + (i + 1);
    preEl.setAttribute('id', currentId);

    // trigger button
    // type is button to avoid submitting a form in case placed inside one
    let copyButton = '<button class="btn" type="button" data-clipboard-target="#' + currentId + '"><img src="https://clipboardjs.com/assets/images/clippy.svg" width="13" alt="Copy to clipboard"> Copy</button><br>';
    $(preEl).before(copyButton);
  }
}

new Clipboard('.btn');
