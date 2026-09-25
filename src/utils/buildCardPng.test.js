import buildCardPng, { buildOutgoingCards, cardDataChunkBytes } from './buildCardPng';
import parsePngChunks from './parsePngChunks';
import stripPngChunks from './stripPngChunks';

const BLANK_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

function blankPngArrayBuffer () {
    const binaryString = atob(BLANK_PNG_BASE64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes.buffer;
}

function makeCard () {
    return {
        spec: 'chara_card_v3',
        spec_version: '3.0',
        data: {
            name: 'Test Character',
            description: 'Multibyte text: café, 日本語, 🎭',
            creation_date: 1700000000,
            alternate_greetings: ['Hi', 'Hello'],
        },
    };
}

describe('buildOutgoingCards', () => {
    test('labels the V3 and V2 copies with their own spec, without mutating the input', () => {
        const card = makeCard();
        const snapshot = JSON.parse(JSON.stringify(card));

        const {v3, v2} = buildOutgoingCards(card, 1800000000);

        expect(v3.spec).toBe('chara_card_v3');
        expect(v3.spec_version).toBe('3.0');
        expect(v2.spec).toBe('chara_card_v2');
        expect(v2.spec_version).toBe('2.0');
        expect(v3.data.creation_date).toBe(1700000000);
        expect(v3.data.modification_date).toBe(1800000000);
        expect(card).toEqual(snapshot);
    });

    test('fills in a missing creation date', () => {
        const card = makeCard();
        delete card.data.creation_date;
        expect(buildOutgoingCards(card, 1800000000).v3.data.creation_date).toBe(1800000000);
    });
});

describe('buildCardPng', () => {
    test('embeds correctly labelled ccv3 and chara chunks', async () => {
        const assembled = await buildCardPng(blankPngArrayBuffer(), makeCard());
        const parsed = await parsePngChunks(new File([assembled], 'card.png', {type: 'image/png'}), ['ccv3', 'chara']);

        expect(parsed.map((c) => [c.keyword, c.data.spec])).toEqual([
            ['ccv3', 'chara_card_v3'],
            ['chara', 'chara_card_v2'],
        ]);
    });

    test('cardDataChunkBytes predicts the exported size exactly, including multibyte text', async () => {
        const card = makeCard();
        const image = blankPngArrayBuffer();
        const assembled = await buildCardPng(image, card);
        const strippedImageBytes = (await stripPngChunks(image)).byteLength;

        expect(strippedImageBytes + cardDataChunkBytes(card)).toBe(assembled.byteLength);
    });
});
