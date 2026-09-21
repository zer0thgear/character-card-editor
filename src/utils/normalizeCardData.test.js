import normalizeCardData, { normalizeLorebook } from './normalizeCardData';
import { v3CardPrototype, v3CharacterBookPrototype, v3CharacterBookEntryPrototype } from './v3CardPrototype';

describe('normalizeCardData', () => {
    test('accepts a well-formed card unchanged', () => {
        const card = v3CardPrototype();
        card.data.name = 'Test Character';
        const result = normalizeCardData(card);
        expect(result.ok).toBe(true);
        expect(result.cardData.data.name).toBe('Test Character');
    });

    test('rejects non-object input', () => {
        expect(normalizeCardData(null).ok).toBe(false);
        expect(normalizeCardData('not a card').ok).toBe(false);
        expect(normalizeCardData(42).ok).toBe(false);
    });

    test('rejects a standalone lorebook uploaded as a card', () => {
        const result = normalizeCardData({spec: 'lorebook_v3', data: v3CharacterBookPrototype()});
        expect(result.ok).toBe(false);
    });

    test('rejects a card missing a "data" object', () => {
        expect(normalizeCardData({spec: 'chara_card_v3'}).ok).toBe(false);
    });

    test('rejects a card missing a name', () => {
        const card = v3CardPrototype();
        delete card.data.name;
        expect(normalizeCardData(card).ok).toBe(false);
    });

    test('defaults missing/malformed string fields to empty strings', () => {
        const card = v3CardPrototype();
        card.data.name = 'Test';
        delete card.data.description;
        card.data.personality = null;
        card.data.scenario = 42;

        const result = normalizeCardData(card);
        expect(result.ok).toBe(true);
        expect(result.cardData.data.description).toBe('');
        expect(result.cardData.data.personality).toBe('');
        expect(result.cardData.data.scenario).toBe('');
    });

    test('defaults missing/malformed array fields to empty arrays', () => {
        const card = v3CardPrototype();
        card.data.name = 'Test';
        delete card.data.alternate_greetings;
        card.data.group_only_greetings = 'not an array';
        card.data.tags = null;

        const result = normalizeCardData(card);
        expect(result.ok).toBe(true);
        expect(result.cardData.data.alternate_greetings).toEqual([]);
        expect(result.cardData.data.group_only_greetings).toEqual([]);
        expect(result.cardData.data.tags).toEqual([]);
    });

    test('normalizes a malformed character_book without crashing', () => {
        const card = v3CardPrototype();
        card.data.name = 'Test';
        card.data.character_book = {name: 'Book', entries: 'not an array'};

        const result = normalizeCardData(card);
        expect(result.ok).toBe(true);
        expect(result.cardData.data.character_book.entries).toEqual([]);
    });

    test('normalizes lorebook entries with a malformed keys field', () => {
        const card = v3CardPrototype();
        card.data.name = 'Test';
        const entry = v3CharacterBookEntryPrototype();
        entry.keys = 'not-an-array';
        card.data.character_book = {...v3CharacterBookPrototype(), entries: [entry, 'not an object', null]};

        const result = normalizeCardData(card);
        expect(result.ok).toBe(true);
        expect(result.cardData.data.character_book.entries).toHaveLength(1);
        expect(result.cardData.data.character_book.entries[0].keys).toEqual([]);
    });
});

describe('normalizeLorebook', () => {
    test('returns undefined for non-object input', () => {
        expect(normalizeLorebook(undefined)).toBeUndefined();
        expect(normalizeLorebook(null)).toBeUndefined();
        expect(normalizeLorebook('nope')).toBeUndefined();
    });

    test('normalizes entries on a standalone lorebook', () => {
        const book = {...v3CharacterBookPrototype(), entries: [{content: 'hi'}]};
        const result = normalizeLorebook(book);
        expect(result.entries).toEqual([{content: 'hi', keys: []}]);
    });
});
