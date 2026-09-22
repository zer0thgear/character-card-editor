export function countLorebookEntries (chunk) {
    const characterBook = chunk?.data?.data?.character_book;
    return Array.isArray(characterBook?.entries) ? characterBook.entries.length : 0;
}

/**
 * Some card export tools embed more than one card copy in a single PNG (e.g. a ccv3 chunk
 * alongside a chara chunk for V2 compatibility, or even two chara chunks), and the copies
 * aren't always kept in sync with each other - one may carry a full lorebook while another
 * is missing it entirely or has a stale/smaller one. Rather than blindly preferring a
 * keyword or chunk position (which can silently pick the emptier/stale copy), this picks
 * whichever chunk actually has the most complete lorebook, breaking ties by preferring the
 * V3 (ccv3) chunk.
 *
 * @param {Array<{keyword: string, data: Object}>} chunks Chunks returned by parsePngChunks (non-empty)
 * @returns {{keyword: string, data: Object}} The chunk to load
 */
export default function selectPreferredCardChunk (chunks) {
    return chunks.reduce((best, chunk) => {
        if (!best) return chunk;
        const chunkEntries = countLorebookEntries(chunk);
        const bestEntries = countLorebookEntries(best);
        if (chunkEntries > bestEntries) return chunk;
        if (chunkEntries === bestEntries && chunk.keyword === "ccv3" && best.keyword !== "ccv3") return chunk;
        return best;
    }, null);
}
