(function () {
  "use strict";

  if (!Object.assign) {
    Object.assign = function (target) {
      if (target == null) throw new TypeError("Cannot convert undefined or null to object");
      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        if (source != null) {
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) to[key] = source[key];
          }
        }
      }
      return to;
    };
  }

  if (!Object.entries) {
    Object.entries = function (obj) {
      var own = Object.keys(obj);
      var result = new Array(own.length);
      for (var i = 0; i < own.length; i++) result[i] = [own[i], obj[own[i]]];
      return result;
    };
  }

  if (!Object.values) {
    Object.values = function (obj) {
      var keys = Object.keys(obj);
      var result = new Array(keys.length);
      for (var i = 0; i < keys.length; i++) result[i] = obj[keys[i]];
      return result;
    };
  }

  if (!Array.from) {
    Array.from = function (value) {
      return Array.prototype.slice.call(value);
    };
  }

  if (!Array.prototype.includes) {
    Array.prototype.includes = function (value) {
      return this.indexOf(value) !== -1;
    };
  }

  if (!String.prototype.includes) {
    String.prototype.includes = function (value, start) {
      return this.indexOf(value, start || 0) !== -1;
    };
  }

  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (search, position) {
      position = position || 0;
      return this.substr(position, search.length) === search;
    };
  }

  if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (search, length) {
      length = length === undefined ? this.length : length;
      return this.substring(length - search.length, length) === search;
    };
  }

  if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function (search, replacement) {
      return this.split(search).join(replacement);
    };
  }

  if (typeof Element !== "undefined" && !Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector;
  }

  if (typeof Element !== "undefined" && !Element.prototype.closest) {
    Element.prototype.closest = function (selector) {
      var element = this;
      while (element && element.nodeType === 1) {
        if (element.matches(selector)) return element;
        element = element.parentElement || element.parentNode;
      }
      return null;
    };
  }

  if (typeof NodeList !== "undefined" && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
  }

  if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
    Promise.prototype.finally = function (callback) {
      var P = this.constructor;
      return this.then(
        function (value) { return P.resolve(callback()).then(function () { return value; }); },
        function (reason) { return P.resolve(callback()).then(function () { throw reason; }); }
      );
    };
  }

  if (!window.queueMicrotask) {
    window.queueMicrotask = function (callback) {
      Promise.resolve().then(callback);
    };
  }
}());
