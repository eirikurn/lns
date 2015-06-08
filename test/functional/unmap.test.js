"use strict";
let co = require('co');
let fixture = require('./fixture');
let lns = require('../../lib/lns');

describe('lns unmap', function() {
  before(() => fixture.setup());

  it('file', co.wrap(function*() {
    yield fixture.write({
      drive: {
        test: '>test'
      },
      store: {
        test: 'A'
      }
    });

    yield lns.commands.unmap(['test']);

    yield fixture.read().should.eventually.deep.equal({
      config: {paths: []},
      drive: {
        test: 'A'
      },
      store: {
        test: 'A'
      }
    });
  }));

  it('folder', co.wrap(function*() {
    yield fixture.write({
      drive: {
        folder: '>folder'
      },
      store: {
        folder: {
          test: 'A'
        }
      }
    });

    yield lns.commands.unmap(['folder']);

    yield fixture.read().should.eventually.deep.equal({
      config: {
        paths: []
      },
      drive: {
        folder: {
          test: 'A'
        }
      },
      store: {
        folder: {
          test: 'A'
        }
      }
    });
  }));

  it('store config', co.wrap(function*() {
    yield fixture.write({
      config: {
        paths: ['test']
      }
    });

    yield lns.commands.unmap(['test']);

    yield fixture.read().should.eventually.deep.equal({
      config: {
        paths: []
      }
    });
  }));

  it('does not touch local file', co.wrap(function*() {
    yield fixture.write({
      config: {
        paths: ['test']
      },
      drive: {
        test: 'b'
      },
      store: {
        test: 'a'
      }
    });

    yield lns.commands.unmap(['test']);

    yield fixture.read().should.eventually.deep.equal({
      config: {
        paths: []
      },
      drive: {
        test: 'b'
      },
      store: {
        test: 'a'
      }
    });
  }));

  it('warns if nothing is done', co.wrap(function*() {
    yield fixture.write({
    });

    yield lns.commands.unmap(['test']).should.not.be.rejected;

    // Todo: stub log
  }));
});
