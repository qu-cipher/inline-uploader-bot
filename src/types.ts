type UploadState = {
    step: "file" | "title" | "tags",
    fileId?: string, 
    title?: string, 
    tags?: string,
    fileType?: "photo" | "video" | "audio" | "voice" | "document"
}

export { type UploadState }