// String fields the app reads directly (e.g. via .replaceAll) and assumes are always strings.
const STRING_FIELDS = [
    "description", "personality", "scenario", "first_mes", "mes_example",
    "creator_notes", "system_prompt", "post_history_instructions", "creator", "character_version"
];

// Array fields the app iterates/maps over and assumes are always arrays.
const ARRAY_FIELDS = ["tags", "alternate_greetings", "group_only_greetings"];

/**
 * Normalizes a lorebook object (either a card's character_book or a standalone imported
 * lorebook) so its entries are always an array of objects with an array `keys` field.
 *
 * @param {*} book
 * @returns {Object|undefined} The normalized lorebook, or undefined if `book` isn't an object
 */
export function normalizeLorebook (book) {
    if (typeof book !== "object" || book === null) return undefined;

    const entries = Array.isArray(book.entries) ? book.entries : [];
    return {
        ...book,
        entries: entries
            .filter((entry) => typeof entry === "object" && entry !== null)
            .map((entry) => ({
                ...entry,
                keys: Array.isArray(entry.keys) ? entry.keys : []
            }))
    };
}

/**
 * Validates and normalizes a parsed card JSON (from an uploaded .json or PNG chara/ccv3 chunk)
 * so the rest of the app can safely assume every field it reads or iterates over exists and is
 * the expected type, instead of crashing deep in rendering on a malformed/foreign file.
 *
 * @param {*} parsedJson Parsed JSON to validate
 * @returns {{ok: true, cardData: Object} | {ok: false, error: string}}
 */
export default function normalizeCardData (parsedJson) {
    if (typeof parsedJson !== "object" || parsedJson === null) {
        return {ok: false, error: "File does not contain a valid card: expected a JSON object."};
    }
    if (parsedJson.spec === "lorebook_v3") {
        return {ok: false, error: "Uploaded file was a lorebook, not a card."};
    }
    if (typeof parsedJson.data !== "object" || parsedJson.data === null) {
        return {ok: false, error: "File does not contain a valid card: missing a \"data\" object."};
    }
    if (typeof parsedJson.data.name !== "string") {
        return {ok: false, error: "File does not contain a valid card: missing a character name."};
    }

    const data = {...parsedJson.data};

    for (const field of STRING_FIELDS) {
        if (typeof data[field] !== "string") data[field] = "";
    }

    for (const field of ARRAY_FIELDS) {
        if (!Array.isArray(data[field])) data[field] = [];
    }

    if (typeof data.character_book !== "undefined") {
        data.character_book = normalizeLorebook(data.character_book);
    }

    return {ok: true, cardData: {...parsedJson, data}};
}
