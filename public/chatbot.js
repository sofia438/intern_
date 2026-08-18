(function () {
  var currentScript = document.currentScript;

  var apiOrigin = (function () {
    try {
      return new URL(currentScript.src).origin;
    } catch (e) {
      return "";
    }
  })();

  var CLOSED_SIZE = { width: "110px", height: "110px" };
  var OPEN_SIZE = { width: "420px", height: "680px" };

  function createWidget(companyId) {
    var iframe = document.createElement("iframe");
    iframe.src = apiOrigin + "/widget/" + companyId;
    iframe.title = "Chat widget";
    iframe.allow = "clipboard-write";
    iframe.setAttribute(
      "style",
      "position:fixed;bottom:0;right:0;border:none;background:transparent;z-index:2147483647;" +
        "width:" + CLOSED_SIZE.width + ";height:" + CLOSED_SIZE.height + ";" +
        "max-width:100vw;max-height:100vh;"
    );

    window.addEventListener("message", function (event) {
      if (event.origin !== apiOrigin) return;
      if (!event.data || event.data.type !== "ge-chat-resize") return;

      var size = event.data.open ? OPEN_SIZE : CLOSED_SIZE;
      iframe.style.width = size.width;
      iframe.style.height = size.height;
    });

    document.body.appendChild(iframe);
  }

  function initChat(config) {
    if (!config || !config.companyId) return;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        createWidget(config.companyId);
      });
    } else {
      createWidget(config.companyId);
    }
  }

  window.GlobalExpo = window.GlobalExpo || {};
  window.GlobalExpo.initChat = initChat;
})();
