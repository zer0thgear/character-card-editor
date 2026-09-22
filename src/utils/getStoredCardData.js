/**
 * Safely reads and parses the autosaved card from localStorage.
 * Falls back to null (rather than throwing) if the stored value is missing or corrupted,
 * so a bad/edited localStorage entry can't prevent the app from mounting.
 *
 * @returns {Object|null} Parsed card JSON, or null if none is stored or it fails to parse
 */
export default function getStoredCardData () {
    const rawCardData = localStorage.getItem("cardData");
    if (rawCardData === null) return null;
    try {
        return JSON.parse(rawCardData);
    } catch (error) {
        console.error("Stored card data was corrupted and could not be parsed: ", error);
        return null;
    }
}
