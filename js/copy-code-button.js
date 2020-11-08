// get all <code> elements
let allPreElements = $("pre");

allPreElements.each(function (i) {
  if ($(this).context.firstElementChild.tagName === 'CODE') {
    // add different id for each code block target
    var currentId = "code-block" + (i + 1);
    $(this).attr('id', currentId);

    // trigger button
    // type is button to avoid submitting a form in case placed inside one
    let copyButton = '<button class="btn" type="button" data-clipboard-target="#' + currentId + '"><img src="https://clipboardjs.com/assets/images/clippy.svg" width="13" alt="Copy to clipboard"> Copy</button><br>';
    $(this).before(copyButton);
  }
});

new Clipboard('.btn');
