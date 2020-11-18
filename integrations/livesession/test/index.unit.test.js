'use strict';

var Analytics = require('@segment/analytics.js-core').constructor;
var integration = require('@segment/analytics.js-integration');
var sandbox = require('@segment/clear-env');
var tester = require('@segment/analytics.js-integration-tester');

var LiveSession = require('../lib/');

describe('LiveSession', function() {
  var analytics;
  var livesession;
  var options = {
    trackId: '123',
    keystrokes: false,
    rootHostname: null
  };

  beforeEach(function() {
    analytics = new Analytics();
    livesession = new LiveSession(options);
    analytics.use(LiveSession);
    analytics.use(tester);
    analytics.add(livesession);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    livesession.reset();
    sandbox();
  });

  it('should have the right settings', function() {
    analytics.compare(
      LiveSession,
      integration('LiveSession')
        .option('trackId', null)
        .option('keystrokes', false)
        .option('rootHostname', null)
    );
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.stub(livesession, 'ready');
    });

    describe('#initialize', function() {
      it('should create window.__ls', function() {
        analytics.assert(!window.__ls);
        analytics.initialize();
        analytics.assert(window.__ls);
      });

      it('should call #load', function() {
        analytics.initialize();
        analytics.called(livesession.ready);
      });
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#identify', function() {
      beforeEach(function() {
        analytics.stub(window, '__ls');
      });

      it('should send an id', function() {
        analytics.didNotCall(window.__ls);
        analytics.identify('123');
        analytics.called(window.__ls);
        analytics.called(window.__ls, 'identify', {
          uid: '123',
          name: undefined,
          email: undefined,
          params: {}
        });
      });

      it('should send an anonymousId', function() {
        analytics.didNotCall(window.__ls);
        analytics.identify();
        analytics.calledOnce(window.__ls);
        analytics.called(window.__ls, 'identify', {
          name: undefined,
          email: undefined,
          params: {}
        });
      });

      it('should send an id and email', function() {
        analytics.didNotCall(window.__ls);
        analytics.identify('123', {
          email: 'example@livesession.io'
        });
        analytics.called(window.__ls, 'identify', {
          uid: '123',
          name: undefined,
          email: 'example@livesession.io',
          params: {}
        });
      });

      it('should send an id, email and name', function() {
        analytics.didNotCall(window.__ls);
        analytics.identify('123', {
          email: 'example@livesession.io',
          name: 'John Doe'
        });
        analytics.called(window.__ls, 'identify', {
          uid: '123',
          name: 'John Doe',
          email: 'example@livesession.io',
          params: {}
        });
      });
    });
  });
});
