"use strict";
let fixture = require('./fixture');
let lns = require('../../lib/lns');

describe('lns unmap', function() {
  before(() => fixture.setup());

  it('file', async () => {
    await fixture.write({
      drive: {
        test: '>test'
      },
      store: {
        test: 'A'
      }
    });

    await lns.commands.unmap(['test']);

    await fixture.read().should.eventually.deep.equal({
      config: {paths: []},
      drive: {
        test: 'A'
      },
      store: {
        test: 'A'
      }
    });
  });

  it('folder', async () => {
    await fixture.write({
      drive: {
        folder: '>folder'
      },
      store: {
        folder: {
          test: 'A'
        }
      }
    });

    await lns.commands.unmap(['folder']);

    await fixture.read().should.eventually.deep.equal({
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
  });

  it('store config', async () => {
    await fixture.write({
      config: {
        paths: ['test']
      }
    });

    await lns.commands.unmap(['test']);

    await fixture.read().should.eventually.deep.equal({
      config: {
        paths: []
      }
    });
  });

  it('does not touch local file', async () => {
    await fixture.write({
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

    await lns.commands.unmap(['test']);

    await fixture.read().should.eventually.deep.equal({
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
  });

  it('warns if nothing is done', async () => {
    await fixture.write({
    });

    await lns.commands.unmap(['test']).should.not.be.rejected;

    // Todo: stub log
  });
});
