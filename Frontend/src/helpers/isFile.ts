// Custom function to check if value is a File
const isFile = (value: any): value is File => {
    return typeof window !== "undefined" && value instanceof File;
};

export default isFile;
