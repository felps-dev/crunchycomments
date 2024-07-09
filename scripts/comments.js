function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// First, override the history.pushState and history.replaceState methods
(function (history) {
  var pushState = history.pushState;
  var replaceState = history.replaceState;

  history.pushState = function (state) {
    if (typeof history.onpushstate == "function") {
      history.onpushstate({ state: state });
    }
    // call the original pushState method
    return pushState.apply(history, arguments);
  };

  history.replaceState = function (state) {
    if (typeof history.onreplacestate == "function") {
      history.onreplacestate({ state: state });
    }
    // call the original replaceState method
    return replaceState.apply(history, arguments);
  };
})(window.history);

function loadCrunchyComments() {
  const mediaWrapper = document.querySelector(".erc-current-media-info");
  if (!mediaWrapper) return;

  // Remove any existing diqus_thread div
  const existingDisqusThread = document.querySelector("#disqus_thread");
  if (existingDisqusThread) {
    existingDisqusThread.remove();
  }

  // Add div with id "disqus_thread" to the mediaWrapper
  const disqusThread = document.createElement("div");
  disqusThread.id = "disqus_thread";
  mediaWrapper.appendChild(disqusThread);

  // Load Disqus comments
  (function () {
    var d = document,
      s = d.createElement("script");
    s.src = "https://crunchycomments.disqus.com/embed.js";
    s.setAttribute("data-timestamp", +new Date());
    (d.head || d.body).appendChild(s);
  })();
}

async function waitForMediaWrapper() {
  while (true) {
    if (document.querySelector(".erc-current-media-info")) {
      loadCrunchyComments();
      return;
    }
    await sleep(1000);
  }
}

// Then, add event listeners for these events
window.history.onpushstate = function (event) {
  waitForMediaWrapper();
};
window.history.onreplacestate = function (event) {
  waitForMediaWrapper();
};

// Don't forget to handle the popstate event as well
window.onpopstate = function (event) {
  waitForMediaWrapper();
};

async function ensureDisqusIsLastElement() {
  while (true) {
    const mediaWrapper = document.querySelector(".erc-current-media-info");
    if (!mediaWrapper) {
      await sleep(1000);
      continue;
    }

    const disqusThread = document.querySelector("#disqus_thread");
    if (!disqusThread) {
      await sleep(1000);
      continue;
    }
    const lastChild = mediaWrapper.lastElementChild;

    if (lastChild !== disqusThread) {
      mediaWrapper.appendChild(disqusThread);
    }

    await sleep(1000);
  }
}

waitForMediaWrapper();
ensureDisqusIsLastElement();
