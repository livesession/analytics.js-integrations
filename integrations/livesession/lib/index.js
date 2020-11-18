'use strict';

/**
 * Module dependencies.
 */

var integration = require('@segment/analytics.js-integration');

/**
 * Expose `LiveSession` integration.
 *
 * https://developers.livesession.io/javascript-api/introduction/
 */

var LiveSession = (module.exports = integration('LiveSession')
  .option('trackId', null)
  .option('keystrokes', false)
  .option('rootHostname', null));

/**
 * omit helper.
 *
 * @return {object}
 */

function omit(obj, keys) {
  var o = Object.assign({}, obj);

  for (var i = 0; i < keys.length; i++) {
    var n = keys[i];
    delete o[n];
  }

  return o;
}

/**
 * Initialize.
 *
 * @api public
 */

LiveSession.prototype.initialize = function() {
  var options = this.options;
  var trackId = options.trackId;
  var keystrokes = options.keystrokes || false;
  var rootHostname = options.rootHostname || null;

  (function(w, d, t, u) {
    if (w.__ls) return;
    var f = (w.__ls = function () { // eslint-disable-line
      return f.push ? f.push.apply(f, arguments) : f.store.push(arguments);
    });
    if (!w.__ls) w.__ls = f; // eslint-disable-line
    f.store = [];
    f.v = '1.0';

    var ls = d.createElement(t);
    ls.async = true;
    ls.src = u;
    var s = d.getElementsByTagName(t)[0];
    s.parentNode.insertBefore(ls, s);
  })(
    window,
    document,
    'script',
    (window.location.protocol === 'https:' ? 'https://' : 'http://') +
      'cdn.labs.livesession.io/track.js'
  );

  window.__ls('init', trackId, {
    keystrokes: keystrokes,
    rootHostname: rootHostname
  });
  window.__ls('newPageView');

  this.ready();
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

LiveSession.prototype.loaded = function() {
  return !!window.__ls;
};

/**
 * Identify.
 *
 * https://developers.livesession.io/javascript-api/methods/#identify
 *
 * @api public
 * @param {Identify} identify
 */

LiveSession.prototype.identify = function(identify) {
  var traits = identify.traits();
  delete traits.id;

  var params = omit(traits, ['name', 'email']);

  if (identify.userId()) {
    window.__ls('identify', {
      uid: identify.userId(),
      email: traits.email,
      name: traits.name,
      params: params
    });
  } else {
    window.__ls('identify', {
      email: traits.email,
      name: traits.name,
      params: params
    });
  }
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

LiveSession.prototype.page = function(page) {
  this.track(page.track());
};

/**
 * Track. Passes the events directly to LiveSession via `setCustomParams` method.
 *
 * https://developers.livesession.io/javascript-api/methods/#setcustomparams
 * @param {Track} track
 */

LiveSession.prototype.track = function(track) {
  var params = Object.assign({}, track.properties(), {
    eventName: track.event()
  });

  window.__ls('setCustomParams', {
    params: params
  });
};
