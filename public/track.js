(function () {
  var currentScript = document.currentScript;
  var siteId = currentScript && currentScript.dataset ? currentScript.dataset.site : null;
  if (!siteId) return;

  var apiOrigin = (function () {
    try {
      return new URL(currentScript.src).origin;
    } catch (e) {
      return "";
    }
  })();

  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name, value, days) {
    var expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/; SameSite=Lax";
  }

  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  var visitorCookie = getCookie("visitor_id");
  if (!visitorCookie) {
    visitorCookie = uuid();
    setCookie("visitor_id", visitorCookie, 730);
  }

  function send(locationPermission, coords) {
    var payload = JSON.stringify({
      siteId: siteId,
      visitorCookie: visitorCookie,
      locationPermission: locationPermission,
      coords: coords,
    });

    var url = apiOrigin + "/api/track";

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, payload);
    } else {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(function () {});
    }
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      send(false, null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function (position) {
        send(true, { lat: position.coords.latitude, lng: position.coords.longitude });
      },
      function () {
        send(true, null);
      },
      { timeout: 8000 }
    );
  }

  function showConsentBanner() {
    var banner = document.createElement("div");
    banner.setAttribute(
      "style",
      "position:fixed;bottom:16px;left:16px;right:16px;max-width:420px;z-index:2147483647;" +
        "background:#041B3A;color:#fff;padding:16px 18px;border-radius:8px;" +
        "font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:14px;line-height:1.4;" +
        "box-shadow:0 4px 20px rgba(0,0,0,.25);"
    );
    banner.innerHTML =
      '<div style="margin-bottom:12px;">Please share your location to help us serve you better.</div>' +
      '<div style="display:flex;gap:8px;">' +
      '<button data-ge-allow style="flex:1;background:#e7f600;color:#041B3A;border:none;border-radius:6px;padding:8px 12px;font-weight:600;cursor:pointer;">YES</button>' +
      '<button data-ge-deny style="flex:1;background:transparent;color:#fff;border:1px solid rgba(255,255,255,.4);border-radius:6px;padding:8px 12px;font-weight:600;cursor:pointer;">NO</button>' +
      "</div>";

    document.body.appendChild(banner);

    banner.querySelector("[data-ge-allow]").addEventListener("click", function () {
      setCookie("ge_geo_consent", "yes", 365);
      banner.remove();
      requestLocation();
    });

    banner.querySelector("[data-ge-deny]").addEventListener("click", function () {
      setCookie("ge_geo_consent", "no", 365);
      banner.remove();
      send(false, null);
    });
  }

  var consent = getCookie("ge_geo_consent");

  function init() {
    if (consent === "yes") {
      requestLocation();
    } else if (consent === "no") {
      send(false, null);
    } else {
      showConsentBanner();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
