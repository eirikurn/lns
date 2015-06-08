"use strict";
let co = require('co');
let fixture = require('./fixture');
let lns = require('../../lib/lns');

describe('lns map', function() {
  before(() => fixture.setup());

  it('maps file to the store and links', co.wrap(function*() {
    yield fixture.write({
      drive: {
        test: 'A'
      }
    });

    yield lns.commands.map(['test']);

    yield fixture.read().should.eventually.deep.equal({
      config: {
        paths: ['test']
      },
      drive: {
        test: '>test'
      },
      store: {
        test: 'A'
      }
    });
  }));

  it('maps multiple files', co.wrap(function*() {
    yield fixture.write({
      drive: {
        a: 'A',
        b: 'B'
      }
    });

    yield lns.commands.map(['a', 'b']);

    yield fixture.read().should.eventually.deep.equal({
      config: {
        paths: ['a', 'b']
      },
      drive: {
        a: '>a',
        b: '>b'
      },
      store: {
        a: 'A',
        b: 'B'
      }
    });
  }));

  it('maps user files to special store folder', co.wrap(function*() {
    yield fixture.write({
      drive: {
        home: {
          test: 'A'
        }
      }
    });

    yield lns.commands.map(['home/test']);

    yield fixture.read().should.eventually.deep.equal({
      config: {
        paths: ['~/test']
      },
      drive: {
        home: {
          test: '>~/test'
        }
      },
      store: {
        '~': {
          test: 'A'
        }
      }
    });
  }));

  it('maps folder to the store', co.wrap(function*() {
    yield fixture.write({
      drive: {
        test: {
          a: 'A'
        }
      }
    });

    yield lns.commands.map(['test']);

    yield fixture.read().should.eventually.deep.equal({
      config: {
        paths: ['test']
      },
      drive: {
        test: '>test'
      },
      store: {
        test: {
          a: 'A'
        }
      }
    });
  }));
});
