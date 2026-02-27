import imageCompression from 'browser-image-compression';

export async function compressAndUpload(file: File): Promise<File> {
    const options = {
        maxSizeMB: 1,          // max 1MB
        maxWidthOrHeight: 1024, // redimensionner si trop grand
        useWebWorker: true
    };

    const compressedFile = await imageCompression(file, options);
    console.log(`Avant: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Après: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

    return compressedFile;
}