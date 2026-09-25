import formatBytes from './formatBytes';

test.each([
    [0, '0 B'],
    [1023, '1023 B'],
    [1536, '1.5 KB'],
    [10239, '10 KB'],
    [1048575, '1.00 MB'],
    [200 * 1024, '200 KB'],
    [1024 * 1024, '1.00 MB'],
    [3.456 * 1024 * 1024, '3.46 MB'],
])('formatBytes(%p) === %p', (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
});
