"use strict";
let co = require('co');
let fixture = require('./fixture');
let lns = require('../../lib/lns');

describe('lns update', function() {
  before(() => fixture.setup());

  it('creates new link', co.wrap(function*() {
    yield fixture.write({
      config: {
        paths: ['test']
      },
      drive: {},
      store: {
        test: 'A'
      }
    });

    yield lns.commands.update();

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

  it('only creates link if parent folder exists', co.wrap(function*() {
    yield fixture.write({
      config: {
        paths: ['missing/test']
      },
      drive: {},
      store: {
        missing: {
          test: 'A'
        }
      }
    });

    yield lns.commands.update();

    yield fixture.read().should.eventually.deep.equal({
      config: {
        paths: ['missing/test']
      },
      drive: {},
      store: {
        missing: {
          test: 'A'
        }
      }
    });
  }));

  it('ignores existing link', co.wrap(function*() {
    yield fixture.write({
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

    yield lns.commands.update();

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

  it('does not overwrite local files', co.wrap(function*() {
    yield fixture.write({
      config: {
        paths: ['test']
      },
      drive: {
        test: 'B'
      },
      store: {
        test: 'A'
      }
    });

    yield lns.commands.update().should.be.rejectedWith('exists');
  }));
});
