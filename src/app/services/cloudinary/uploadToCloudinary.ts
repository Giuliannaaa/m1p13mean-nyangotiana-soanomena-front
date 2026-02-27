import { environment } from "../../../environments/environment.prod";

export async function uploadToCloudinary(file: File, folder: string = 'stores'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', environment.cloudinary.uploadPreset);
    formData.append('folder', folder);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`,
        { method: 'POST', body: formData }
    );

    if (!response.ok) throw new Error('Erreur upload Cloudinary');
    const data = await response.json();
    return data.secure_url;
}
