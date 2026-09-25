export default function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    // Pick the unit from the value as it will be displayed, so 1048575 bytes reads "1.00 MB", not "1024 KB".
    if (kb < 9.95) return `${kb.toFixed(1)} KB`;
    if (kb < 1023.5) return `${kb.toFixed(0)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
}
