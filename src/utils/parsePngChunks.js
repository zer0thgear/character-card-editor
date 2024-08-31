/**
 * Utility function to retrieve the 'chara' tEXt chunk from an uploaded PNG
 * 
 * @param {*} file File as read directly from the file input
 * @param {string | string[]} keywords Keyword or list of keywords to look for in the tEXt chunk
 * @returns A promise that resolves to the contents of the specified tEXt chunk if found, otherwise resolves to null
 * Returned data will be in the format of [{"keyword": keyword, "data": JSON}]
 */
export async function parsePngChunks (file, keywords) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            const data = new DataView(arrayBuffer);

            const textChunks = [];
            const output = [];
            let offset = 8; // Skips the PNG header

            while (offset < data.byteLength) {
                const length = data.getUint32(offset);
                const type = String.fromCharCode(
                    data.getUint8(offset + 4),
                    data.getUint8(offset + 5),
                    data.getUint8(offset + 6),
                    data.getUint8(offset + 7)
                );
                if (type === 'tEXt') {
                    const chunkData = new Uint8Array(arrayBuffer, offset + 8, length);
                    const textData = new TextDecoder().decode(chunkData);
                    
                    const separatorIndex = textData.indexOf('\0'); // Looking for null separator between 'chara' keyword and base64 encoded text
                    if (separatorIndex !== -1) {
                        const keyword = textData.substring(0, separatorIndex);
                        const text = textData.substring(separatorIndex + 1);

                        if ((Array.isArray(keywords) && keywords.includes(keyword)) || keyword === keywords) {
                            try {
                                const decodedData = atob(text);
                                output.push({"keyword": keyword, "data": JSON.parse(decodedData)});
                                //resolve(JSON.parse(decodedData));
                            } catch (error) {
                                reject(new Error("Failed to decode base64 data."));
                                return;
                            }
                        }
                    }
                    textChunks.push(textData);
                }

                offset += 8 + length + 4;
            }
            resolve(output.length === 0 ? null : output);
        };
        reader.onerror = function() {
            reject(new Error("Failed to read the file."));
        }
        reader.readAsArrayBuffer(file);
    });
}