/**
 * Utility function to assemble a v2 or v3 compliant Character Card PNG
 * 
 * @param {*} png PNG to insert the JSON
 * @param {Object | Object[]} dataJson JSON containing the data to encode and insert into the PNG. Should be in the format of {"keyword": keyword, "data": JSON} or as a list of objects in the aforementioned format to encode multiple specs.
 * @returns Promise that resolves to an array buffer containing the newly assembled PNG
 */
export async function assembleNewPng (png, dataJson) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            const arrayBuffer = e.target.result;
            const data = new DataView(arrayBuffer);
            const newChunks = [];

            let offset = 8; // Skipping the PNG header

            newChunks.push(new Uint8Array(arrayBuffer.slice(0, offset))); // Copying the original header

            const listOfChunks = Array.isArray(dataJson) ? dataJson : [dataJson];
            
            listOfChunks.forEach((item) => {
                // Creating the new tEXt chunk
                const textChunkData = new TextEncoder().encode(`${item.keyword}\0${JSON.stringify(item.data)}`)
                const textChunkLength = textChunkData.length;

                const textChunk = new Uint8Array(8 + textChunkLength + 4);
                const view = new DataView(textChunk.buffer);

                // Writing the length of the tEXt chunk
                view.setUint32(0, textChunkLength);

                // Write chunk type 'tEXt'
                textChunk[4] = 't'.charCodeAt(0);
                textChunk[5] = 'E'.charCodeAt(0);
                textChunk[6] = 'X'.charCodeAt(0);
                textChunk[7] = 't'.charCodeAt(0);

                textChunk.set(textChunkData, 8);

                const crc = crc32(textChunk.subarray(4, 8 + textChunkLength));
                view.setUint32(8 + textChunkLength, crc);

                // Adds the tEXt chunk after the PNG header
                newChunks.push(textChunk);
            });
            // Copying the rest of the PNG
            while (offset < data.byteLength) {
                const length = data.getUint32(offset);
                const chunk = new Uint8Array(arrayBuffer.slice(offset, offset + 8 + length + 4));
                newChunks.push(chunk);
                
                offset += 8 + length + 4
            }

            const combinedLength = newChunks.reduce((acc, chunk) => acc + chunk.length, 0);
            const combinedArrayBuffer = new Uint8Array(combinedLength);
            let combinedOffset = 0;

            for (const chunk of newChunks) {
                combinedArrayBuffer.set(chunk, combinedOffset);
                combinedOffset += chunk.length;
            }

            resolve(combinedArrayBuffer.buffer);
        };
        reader.onerror = function() {
            reject(new Error("Failed to read the file."));
        };

        reader.readAsArrayBuffer(png);
    });    
}

/**
 * Utility function to calculate CRC32. Mostly magic to me if I'm being honest
 * 
 * @param {*} data 
 * @returns uhhhh the CRC apparently
 */
function crc32(data) {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++){
        crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
}

// Precomputes CRC table, also frankly magic to me
const crcTable = (() => {
    let c;
    const table = new Array(256);
    for (let n = 0; n < 256; n++) {
        c = n;
        for (let k = 0; k < 8; k++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        table[n] = c;
    }
    return table;
})();