import assembleNewPng from './assembleNewPng';
import parsePngChunks from './parsePngChunks';
import stripPngChunks from './stripPngChunks';

// Minimal valid 1x1 transparent PNG, base64-encoded, with no ancillary text chunks.
const BLANK_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

function blankPngArrayBuffer () {
    const binaryString = atob(BLANK_PNG_BASE64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes.buffer;
}

function getChunkTypes (arrayBuffer) {
    const data = new DataView(arrayBuffer);
    const types = [];
    let offset = 8;
    while (offset < data.byteLength) {
        const length = data.getUint32(offset);
        const type = String.fromCharCode(
            data.getUint8(offset + 4),
            data.getUint8(offset + 5),
            data.getUint8(offset + 6),
            data.getUint8(offset + 7)
        );
        types.push(type);
        offset += 8 + length + 4;
    }
    return types;
}

describe('stripPngChunks', () => {
    test('leaves a PNG with no tEXt chunks unchanged', async () => {
        const original = blankPngArrayBuffer();
        const stripped = await stripPngChunks(original);
        expect(new Uint8Array(stripped)).toEqual(new Uint8Array(original));
    });

    test('removes tEXt chunks while preserving other chunks', async () => {
        const original = blankPngArrayBuffer();
        const withText = await assembleNewPng(original, [{keyword: 'chara', data: {hello: 'world'}}]);
        expect(getChunkTypes(withText)).toContain('tEXt');

        const stripped = await stripPngChunks(withText);
        expect(getChunkTypes(stripped)).not.toContain('tEXt');
        expect(getChunkTypes(stripped)).toEqual(getChunkTypes(original));
    });
});

describe('assembleNewPng + parsePngChunks', () => {
    test('round-trips a single embedded chunk', async () => {
        const cardData = {spec: 'chara_card_v2', spec_version: '2.0', data: {name: 'Test Character'}};
        const assembled = await assembleNewPng(blankPngArrayBuffer(), {keyword: 'chara', data: cardData});

        const file = new File([assembled], 'test.png', {type: 'image/png'});
        const parsed = await parsePngChunks(file, ['chara']);

        expect(parsed).toEqual([{keyword: 'chara', data: cardData}]);
    });

    test('round-trips multiple embedded chunks (V2 + V3 compatibility export)', async () => {
        const v3Data = {spec: 'chara_card_v3', spec_version: '3.0', data: {name: 'V3 Character'}};
        const v2Data = {spec: 'chara_card_v2', spec_version: '2.0', data: {name: 'V3 Character'}};
        const assembled = await assembleNewPng(blankPngArrayBuffer(), [
            {keyword: 'ccv3', data: v3Data},
            {keyword: 'chara', data: v2Data}
        ]);

        const file = new File([assembled], 'test.png', {type: 'image/png'});
        const parsed = await parsePngChunks(file, ['ccv3', 'chara']);

        expect(parsed).toEqual([
            {keyword: 'ccv3', data: v3Data},
            {keyword: 'chara', data: v2Data}
        ]);
    });

    test('resolves to null when the PNG has no matching keyword', async () => {
        const file = new File([blankPngArrayBuffer()], 'test.png', {type: 'image/png'});
        const parsed = await parsePngChunks(file, ['ccv3', 'chara']);

        expect(parsed).toBeNull();
    });

    test('ignores tEXt chunks whose keyword is not requested', async () => {
        const assembled = await assembleNewPng(blankPngArrayBuffer(), [{keyword: 'unrelated', data: {foo: 'bar'}}]);
        const file = new File([assembled], 'test.png', {type: 'image/png'});
        const parsed = await parsePngChunks(file, ['chara']);

        expect(parsed).toBeNull();
    });
});
