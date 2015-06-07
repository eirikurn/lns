"use strict";
let co = require('co');
let fixture = require('./fixture');
let lns = require('../../lib/lns');

describe('lns add', function() {
  before(() => fixture.setup());

  it('adds file to the store and links', co.wrap(function*() {
    yield fixture.write({
      drive: {
        test: 'A'
      }
    });

    yield lns.commands.add(['test']);

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

  it('adds multiple files', co.wrap(function*() {
    yield fixture.write({
      drive: {
        a: 'A',
        b: 'B'
      }
    });

    yield lns.commands.add(['a', 'b']);

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

  it('adds user files to special store folder', co.wrap(function*() {
    yield fixture.write({
      drive: {
        home: {
          test: 'A'
        }
      }
    });

    yield lns.commands.add(['home/test']);

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

  it('adds folder to the store', co.wrap(function*() {
    yield fixture.write({
      drive: {
        test: {
          a: 'A'
        }
      }
    });

    yield lns.commands.add(['test']);

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
