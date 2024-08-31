/**
 * Helper function to remove tEXt chunks from a given PNG and return a plain PNG
 * 
 * @param {*} file File as read directly from the file input
 * @returns Promise that resolves to an array buffer containing the newly stripped PNG
 */
export async function stripPngChunks (file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            const data = new DataView(arrayBuffer);
            const newChunks = [];

            let offset = 8; // Skipping PNG header

            newChunks.push(new Uint8Array(arrayBuffer.slice(0, offset))); // Copying the old PNG header

            while (offset < data.byteLength) {
                const length = data.getUint32(offset);
                const type = String.fromCharCode(
                    data.getUint8(offset + 4),
                    data.getUint8(offset + 5),
                    data.getUint8(offset + 6),
                    data.getUint8(offset + 7)
                );

                if (type !== 'tEXt') { // Only consider chunks not contained with a tEXt chunk
                    const chunk = new Uint8Array(arrayBuffer.slice(offset, offset + 8 + length + 4));
                    newChunks.push(chunk);
                }

                offset += 8 + length + 4;
            }
            
            const combinedLength = newChunks.reduce((acc, chunk) => acc + chunk.length, 0);
            const combinedArrayBuffer = new Uint8Array(combinedLength);
            let combinedOffset = 0;

            for (const chunk of newChunks) { // Recombining chunks into a new PNG
                combinedArrayBuffer.set(chunk, combinedOffset);
                combinedOffset += chunk.length;
            }

            resolve(combinedArrayBuffer.buffer)
        };
        reader.onerror = function() {
            reject(new Error("Failed to read the file."));
        };
        reader.readAsArrayBuffer(file);
    });
}