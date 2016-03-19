const fixture = require('./fixture');
const lns = require('../../lib/lns');

describe('lns update', () => {
  before(() => fixture.setup());

  it('creates new link', async () => {
    await fixture.write({
      config: {
        paths: ['test'],
      },
      drive: {},
      store: {
        test: 'A',
      },
    });

    await lns.commands.update();

    await fixture.read().should.eventually.deep.equal({
      config: {
        paths: ['test'],
      },
      drive: {
        test: '>test',
      },
      store: {
        test: 'A',
      },
    });
  });

  it('only creates link if parent folder exists', async () => {
    await fixture.write({
      config: {
        paths: ['missing/test'],
      },
      drive: {},
      store: {
        missing: {
          test: 'A',
        },
      },
    });

    await lns.commands.update();

    await fixture.read().should.eventually.deep.equal({
      config: {
        paths: ['missing/test'],
      },
      drive: {},
      store: {
        missing: {
          test: 'A',
        },
      },
    });
  });

  it('ignores existing link', async () => {
    await fixture.write({
      config: {
        paths: ['test'],
      },
      drive: {
        test: '>test',
      },
      store: {
        test: 'A',
      },
    });

    await lns.commands.update();

    await fixture.read().should.eventually.deep.equal({
      config: {
        paths: ['test'],
      },
      drive: {
        test: '>test',
      },
      store: {
        test: 'A',
      },
    });
  });

  it('does not overwrite local files', async () => {
    await fixture.write({
      config: {
        paths: ['test'],
      },
      drive: {
        test: 'B',
      },
      store: {
        test: 'A',
      },
    });

    await lns.commands.update().should.be.rejectedWith('exists');
  });
});
