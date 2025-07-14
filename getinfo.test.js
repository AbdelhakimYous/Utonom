const getInfo = require('./getinfo');

test('getInfo returns correct information', () => {
    expect(getInfo()).toBe('Fetching information...');
});

