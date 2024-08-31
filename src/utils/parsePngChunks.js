export async function parsePngChunks (file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            const data = new DataView(arrayBuffer);

            const textChunks = [];
            let offset = 8;

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
                    
                    const separatorIndex = textData.indexOf('\0');
                    if (separatorIndex !== -1) {
                        const keyword = textData.substring(0, separatorIndex);
                        const text = textData.substring(separatorIndex + 1);

                        if (keyword === 'chara') {
                            try {
                                const decodedData = atob(text);
                                resolve(JSON.parse(decodedData));
                                return;
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
            resolve(null);
        };
        reader.onerror = function() {
            reject(new Error("Failed to read the file."));
        }
        reader.readAsArrayBuffer(file);
    });
}