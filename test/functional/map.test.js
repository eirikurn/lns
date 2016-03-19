"use strict";
let fixture = require('./fixture');
let lns = require('../../lib/lns');

describe('lns map', function() {
  before(() => fixture.setup());

  it('maps file to the store and links', async () => {
    await fixture.write({
      drive: {
        test: 'A'
      }
    });

    await lns.commands.map(['test']);

    await fixture.read().should.eventually.deep.equal({
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
  });

  it('maps multiple files', async () => {
    await fixture.write({
      drive: {
        a: 'A',
        b: 'B'
      }
    });

    await lns.commands.map(['a', 'b']);

    await fixture.read().should.eventually.deep.equal({
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
  });

  it('maps user files to special store folder', async () => {
    await fixture.write({
      drive: {
        home: {
          test: 'A'
        }
      }
    });

    await lns.commands.map(['home/test']);

    await fixture.read().should.eventually.deep.equal({
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
  });

  it('maps folder to the store', async () => {
    await fixture.write({
      drive: {
        test: {
          a: 'A'
        }
      }
    });

    await lns.commands.map(['test']);

    await fixture.read().should.eventually.deep.equal({
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
  });
});
