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

function crc32 (bytes) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) {
        crc ^= bytes[i];
        for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk (type, payload) {
    const chunk = new Uint8Array(12 + payload.length);
    const view = new DataView(chunk.buffer);
    view.setUint32(0, payload.length);
    for (let i = 0; i < 4; i++) chunk[4 + i] = type.charCodeAt(i);
    chunk.set(payload, 8);
    view.setUint32(8 + payload.length, crc32(chunk.subarray(4, 8 + payload.length)));
    return chunk;
}

// Same image as the blank PNG, but with its compressed image data split across two IDAT chunks,
// the way most real encoders (including browsers' canvas.toBlob) write anything bigger than a few KB.
function multiIdatPngArrayBuffer () {
    const original = new Uint8Array(blankPngArrayBuffer());
    const view = new DataView(original.buffer);
    const parts = [original.slice(0, 8)];
    let offset = 8;
    while (offset < original.length) {
        const length = view.getUint32(offset);
        const type = String.fromCharCode(...original.slice(offset + 4, offset + 8));
        if (type === 'IDAT') {
            const payload = original.slice(offset + 8, offset + 8 + length);
            const mid = Math.floor(payload.length / 2);
            parts.push(makeChunk('IDAT', payload.slice(0, mid)), makeChunk('IDAT', payload.slice(mid)));
        } else {
            parts.push(original.slice(offset, offset + 12 + length));
        }
        offset += 12 + length;
    }
    const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    let pos = 0;
    for (const p of parts) { out.set(p, pos); pos += p.length; }
    return out.buffer;
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

    test('embeds each chunk exactly once, after all IDAT chunks, when image data spans multiple IDATs', async () => {
        const source = multiIdatPngArrayBuffer();
        expect(getChunkTypes(source).filter((t) => t === 'IDAT')).toHaveLength(2);

        const assembled = await assembleNewPng(source, [
            {keyword: 'ccv3', data: {spec: 'chara_card_v3'}},
            {keyword: 'chara', data: {spec: 'chara_card_v2'}}
        ]);

        // IDAT chunks must stay consecutive per the PNG spec, and the card data must not be duplicated.
        expect(getChunkTypes(assembled)).toEqual(['IHDR', 'IDAT', 'IDAT', 'tEXt', 'tEXt', 'IEND']);
    });

    test('still embeds the card data when the source PNG is missing its IEND chunk', async () => {
        const full = new Uint8Array(blankPngArrayBuffer());
        const truncated = full.slice(0, full.length - 12).buffer; // IEND is the final 12 bytes

        const assembled = await assembleNewPng(truncated, [{keyword: 'chara', data: {spec: 'chara_card_v2'}}]);

        expect(getChunkTypes(assembled)).toEqual(['IHDR', 'IDAT', 'tEXt']);
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
