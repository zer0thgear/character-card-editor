import selectPreferredCardChunk, { countLorebookEntries } from './selectPreferredCardChunk';

function chunkWithEntries (keyword, entryCount) {
    return {
        keyword,
        data: {
            data: {
                character_book: entryCount === null ? undefined : {entries: new Array(entryCount).fill({})}
            }
        }
    };
}

describe('countLorebookEntries', () => {
    test('counts entries when present', () => {
        expect(countLorebookEntries(chunkWithEntries('chara', 5))).toBe(5);
    });

    test('returns 0 when there is no lorebook', () => {
        expect(countLorebookEntries(chunkWithEntries('chara', null))).toBe(0);
    });

    test('returns 0 for malformed/missing shapes without throwing', () => {
        expect(countLorebookEntries({keyword: 'chara', data: null})).toBe(0);
        expect(countLorebookEntries({keyword: 'chara', data: {}})).toBe(0);
        expect(countLorebookEntries({keyword: 'chara', data: {data: {character_book: {entries: 'not an array'}}}})).toBe(0);
    });
});

describe('selectPreferredCardChunk', () => {
    test('returns the only chunk when there is just one', () => {
        const chunk = chunkWithEntries('chara', 0);
        expect(selectPreferredCardChunk([chunk])).toBe(chunk);
    });

    test('prefers the chunk with the most lorebook entries, regardless of keyword', () => {
        const emptyChara = chunkWithEntries('chara', 0);
        const richChara = chunkWithEntries('chara', 49);
        // Reproduces the real-world case: two "chara" chunks, one full, one empty.
        expect(selectPreferredCardChunk([emptyChara, richChara])).toBe(richChara);
        expect(selectPreferredCardChunk([richChara, emptyChara])).toBe(richChara);
    });

    test('prefers the richer chunk even when the leaner one is ccv3', () => {
        const staleCcv3 = chunkWithEntries('ccv3', 10);
        const richChara = chunkWithEntries('chara', 57);
        expect(selectPreferredCardChunk([staleCcv3, richChara])).toBe(richChara);
    });

    test('breaks ties by preferring ccv3', () => {
        const chara = chunkWithEntries('chara', 5);
        const ccv3 = chunkWithEntries('ccv3', 5);
        expect(selectPreferredCardChunk([chara, ccv3])).toBe(ccv3);
        expect(selectPreferredCardChunk([ccv3, chara])).toBe(ccv3);
    });

    test('handles the standard single ccv3 + chara dual-export case', () => {
        const ccv3 = chunkWithEntries('ccv3', 3);
        const chara = chunkWithEntries('chara', 3);
        expect(selectPreferredCardChunk([ccv3, chara])).toBe(ccv3);
    });
});
