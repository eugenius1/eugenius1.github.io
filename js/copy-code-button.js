// get all <code> elements
var allCodeBlocksElements = $("pre");

allCodeBlocksElements.each(function (i) {
  if ($(this).context.firstElementChild.tagName === 'CODE') {
    // add different id for each code block target
    var currentId = "code-block" + (i + 1);
    $(this).attr('id', currentId);

    // trigger
    var clipButton = '<button class="btn" data-clipboard-target="#' + currentId + '"><img src="https://clipboardjs.com/assets/images/clippy.svg" width="13" alt="Copy to clipboard"> Copy</button><br>';
    $(this).before(clipButton);
  }
});

new Clipboard('.btn');
