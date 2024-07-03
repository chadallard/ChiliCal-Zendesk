"use strict";

var defaultMessage = "Copy to clipboard: #{key}, Enter";

function format(message) {
  var copyKey = (/mac os x/i.test(navigator.userAgent) ? "⌘" : "Ctrl") + "+C";
  return message.replace(/#{\s*key\s*}/g, copyKey);
}

export async function copyHtml(htmlContent, options = {}) {
  const debug = options.debug || false;
  let success = false;

  // Ensure the document is focused before copying
  getFocus();

  try {
    // Check if document is focused before using Clipboard API
    if (document.hasFocus()) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([htmlContent], { type: 'text/html' }),
          'text/plain': new Blob([htmlContent], { type: 'text/plain' }) // Add plain text fallback
        })
      ]);
      success = true;
    } else {
      throw new Error("Document is not focused");
    }
  } catch (err) {
    debug && console.error("Unable to copy using Clipboard API: ", err);
    debug && console.warn("Falling back to execCommand");

    try {
      // Fallback to execCommand for older browsers
      const mark = document.createElement("div");
      mark.innerHTML = htmlContent;
      mark.style.all = "unset";
      mark.style.position = "fixed";
      mark.style.top = 0;
      mark.style.clip = "rect(0, 0, 0, 0)";
      mark.style.whiteSpace = "pre";
      mark.style.webkitUserSelect = "text";
      mark.style.MozUserSelect = "text";
      mark.style.msUserSelect = "text";
      mark.style.userSelect = "text";
      document.body.appendChild(mark);

      const range = document.createRange();
      range.selectNodeContents(mark);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      if (!document.execCommand("copy")) {
        throw new Error("execCommand copy was unsuccessful");
      }
      success = true;
      document.body.removeChild(mark);
    } catch (execCommandErr) {
      debug && console.error("Unable to copy using execCommand: ", execCommandErr);
      debug && console.warn("Falling back to prompt");

      const message = format("message" in options ? options.message : defaultMessage);
      window.prompt(message, htmlContent);
    }
  }

  return success;
}

function getFocus() {
  if (!document.hasFocus()) {
    window.focus();
    setTimeout(getFocus, 100);
  }
}

window.addEventListener('message', async function (event) {
  if (event.data.type === "CHILIPIPER_COPY_TIMES_TO_CLIPBOARD") {
    try {
      // Ensure the document is focused
      getFocus();

      const data = event.data.props;
      const slots = data.slots;
      const duration = data.duration;
      const userSlug = data.userSlug;
      const attemptId = data.attemptId;
      const meetingTypeSlug = data.meetingTypeSlug;
      const timezone = data.timezone;

      const tableHTML = buildTable(slots, duration, userSlug, attemptId, meetingTypeSlug, timezone);
      console.log(tableHTML);
      const success = await copyHtml(tableHTML, {
        format: 'text/html',
        debug: true
      });

      if (success) {
        console.log('HTML copied successfully');
      } else {
        console.error('Failed to copy HTML');
      }
    } catch (e) {
      console.error(e);
    }
  }
});
