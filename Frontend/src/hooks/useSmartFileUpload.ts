import { useState, useCallback } from "react";


export function useSmartFileUpload(
    uploadFunction: (file: File) => Promise<any>,
    initialImages?: string[]
) {
    const [uploadedImages, setUploadedImages] = useState<(File | string)[]>(
        initialImages || []
    );
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = useCallback((files: File[], multiple: boolean = false) => {
        if (multiple) {
            setUploadedImages((prev) => [...prev, ...files]);
        } else {
            setUploadedImages(files);
        }
    }, []);

   
    const handleImageRemove = useCallback((index: number) => {
        setUploadedImages((prev) => {
            const newImages = [...prev];
            const removedImage = newImages[index];

            // Clean up blob URLs
            if (typeof removedImage === "string" && removedImage.startsWith("blob:")) {
                URL.revokeObjectURL(removedImage);
            }

            newImages.splice(index, 1);
            return newImages;
        });
    }, []);

 
    const getFileToUpload = useCallback((): File | null => {
        if (uploadedImages.length === 0) return null;
        const newFile = uploadedImages.find((img) => img instanceof File) as
            | File
            | undefined;
        return newFile || null;
    }, [uploadedImages]);


    const getFinalFileUrl = useCallback(async (): Promise<string | null> => {
        if (uploadedImages.length === 0) {
            return null;
        }

        const uploadedFile = uploadedImages[0];

        if (uploadedFile instanceof File) {
            setIsUploading(true);
            try {
                const uploadRes = await uploadFunction(uploadedFile);
                const fileUrl = uploadRes?.data?.url || uploadRes?.url;
                setIsUploading(false);
                return fileUrl;
            } catch (error) {
                setIsUploading(false);
                throw error;
            }
        }

        if (typeof uploadedFile === "string") {
            return uploadedFile;
        }

        return null;
    }, [uploadedImages, uploadFunction]);

  
    const resetUploadedImages = useCallback((newInitialImages?: string[]) => {
        setUploadedImages(newInitialImages || []);
    }, []);

    return {
        uploadedImages,
        isUploading,
        handleImageUpload,
        handleImageRemove,
        getFileToUpload,
        getFinalFileUrl,
        resetUploadedImages,
    };
}
