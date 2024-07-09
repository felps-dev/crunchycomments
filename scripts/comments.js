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
    var originalReturn = pushState.apply(history, arguments);
    // Reset Disqus with new URL
    window.DISQUS.reset({
      reload: true,
      config: function () {
        this.page.url = window.location.href;
      },
    });
    return originalReturn;
  };

  history.replaceState = function (state) {
    if (typeof history.onreplacestate == "function") {
      history.onreplacestate({ state: state });
    }
    // call the original replaceState method
    var originalReturn = replaceState.apply(history, arguments);
    // Reset Disqus with new URL
    window.DISQUS.reset({
      reload: true,
      config: function () {
        this.page.url = window.location.href;
      },
    });
    return originalReturn;
  };
})(window.history);

function loadCrunchyComments() {
  const mediaWrapper = document.querySelector(".erc-current-media-info");
  if (!mediaWrapper) return;

  // Add div with id "disqus_thread" to the mediaWrapper
  const disqusThread = document.createElement("div");
  disqusThread.id = "disqus_thread";
  mediaWrapper.appendChild(disqusThread);
  // Load Disqus comments
  this.DISQUS.host._loadEmbed();
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

// Then, handle the popstate event as well
window.onpopstate = function (event) {
  // Reset Disqus with new URL
  window.DISQUS.reset({
    reload: true,
    config: function () {
      this.page.url = window.location.href;
    },
  });
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
