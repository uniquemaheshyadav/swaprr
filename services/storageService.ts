import {
    ref,
    uploadBytesResumable,
    getDownloadURL
} from 'firebase/storage';
import { storage } from '../firebase';

export const uploadImage = async (file: File, path: string = 'items'): Promise<string> => {
    try {
        const timestamp = Date.now();
        const storageRef = ref(storage, `${path}/${timestamp}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // You can observe state change events such as progress, pause, and resume
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                },
                (error) => {
                    // Handle unsuccessful uploads
                    console.error("Upload failed", error);
                    reject(error);
                },
                () => {
                    // Handle successful uploads on complete
                    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL);
                    });
                }
            );
        });
    } catch (error) {
        console.error("Error starting upload:", error);
        throw error;
    }
};
