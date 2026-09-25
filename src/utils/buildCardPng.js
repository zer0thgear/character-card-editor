import assembleNewPng from './assembleNewPng';
import stripPngChunks from './stripPngChunks';

/**
 * Builds the V3 and V2-compatible card objects embedded in an exported PNG, without mutating the
 * card state they're built from.
 *
 * @param {Object} cardData Current card state
 * @param {number} [now] Unix timestamp (seconds) to stamp as the modification date
 * @returns {{v3: Object, v2: Object}}
 */
export function buildOutgoingCards(cardData, now = Math.floor(Date.now() / 1000)) {
    const v3 = {
        ...cardData,
        spec: 'chara_card_v3',
        spec_version: '3.0',
        data: {
            ...cardData.data,
            creation_date: cardData.data.creation_date ?? now,
            modification_date: now,
        },
    };
    const v2 = {...v3, spec: 'chara_card_v2', spec_version: '2.0'};
    return {v3, v2};
}

function textChunks(cardData) {
    const {v3, v2} = buildOutgoingCards(cardData);
    return [{keyword: 'ccv3', data: v3}, {keyword: 'chara', data: v2}];
}

/**
 * Assembles an exportable character card PNG from a portrait image and card state.
 *
 * @param {ArrayBuffer} imageArrayBuffer Portrait PNG; any existing tEXt chunks are dropped
 * @param {Object} cardData Current card state
 * @returns {Promise<ArrayBuffer>}
 */
export default async function buildCardPng(imageArrayBuffer, cardData) {
    const strippedPng = await stripPngChunks(imageArrayBuffer);
    return assembleNewPng(strippedPng, textChunks(cardData));
}

/**
 * Byte size of the tEXt chunks buildCardPng embeds for this card, computed without assembling the PNG.
 * Each chunk is 12 bytes of framing plus `keyword\0base64(utf8(JSON))`.
 *
 * @param {Object} cardData Current card state
 * @returns {number}
 */
export function cardDataChunkBytes(cardData) {
    // The V2 copy differs from V3 only in same-length spec strings ("chara_card_v2"/"2.0"), so both
    // serialize to the same length and the card only needs stringifying once per edit.
    const utf8Length = new TextEncoder().encode(JSON.stringify(buildOutgoingCards(cardData).v3)).length;
    const base64Length = 4 * Math.ceil(utf8Length / 3);
    return textChunks(cardData).reduce((total, {keyword}) => total + 12 + keyword.length + 1 + base64Length, 0);
}
