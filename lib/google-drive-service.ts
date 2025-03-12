import { google } from "googleapis"
import type { OAuth2Client } from "google-auth-library"
import { Readable } from "stream";

// Define file type interface
export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  createdTime: string
  webViewLink?: string
  webContentLink?: string
  iconLink?: string
  thumbnailLink?: string
  category?: string
  forClass?: string
  uploadedBy?: string
}

// Create OAuth2 client
export function getOAuth2Client(): OAuth2Client {
  // Use the environment variable for redirect URI
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3000/api/auth/callback/google"

  return new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, redirectUri)
}

// Get Google Drive client
export function getDriveClient(accessToken: string) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({ access_token: accessToken })
  return google.drive({ version: "v3", auth: oauth2Client })
}

// Format file size
export function formatFileSize(bytes?: number): string {
  if (!bytes) return "Unknown size"

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  if (bytes === 0) return "0 Byte"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`
}

// Get file category based on MIME type
export function getFileCategory(mimeType: string): string {
  if (mimeType.includes("pdf")) return "PDF"
  if (mimeType.includes("spreadsheet")) return "Spreadsheet"
  if (mimeType.includes("document")) return "Document"
  if (mimeType.includes("presentation")) return "Presentation"
  if (mimeType.includes("image")) return "Image"
  if (mimeType.includes("video")) return "Video"
  if (mimeType.includes("audio")) return "Audio"
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar")) return "Archive"
  return "Other"
}

// Extract class information from description or properties (if available)
export function getClassInfo(description?: string): string {
  if (!description) return "All Classes"

  // Look for grade patterns like "Grade 10" or "Grade: 11"
  const gradeMatch = description.match(/grade\s*:?\s*(\d+)/i)
  if (gradeMatch) return `Grade ${gradeMatch[1]}`

  return "All Classes"
}

// List files from Google Drive
export async function listFiles(accessToken: string, searchTerm?: string): Promise<DriveFile[]> {
  try {
    const drive = getDriveClient(accessToken)

    // Build query
    let query = "trashed = false"
    if (searchTerm) {
      query += ` and name contains '${searchTerm}'`
    }

    const response = await drive.files.list({
      q: query,
      pageSize: 50,
      fields:
        "files(id, name, mimeType, size, createdTime, description, webViewLink, webContentLink, iconLink, thumbnailLink)",
    })

    const files = response.data.files || []

    return files.map((file) => ({
      id: file.id || "",
      name: file.name || "Unnamed File",
      mimeType: file.mimeType || "application/octet-stream",
      size: formatFileSize(Number.parseInt(file.size || "0")),
      createdTime: new Date(file.createdTime || "").toLocaleDateString(),
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink,
      iconLink: file.iconLink,
      thumbnailLink: file.thumbnailLink,
      category: getFileCategory(file.mimeType || ""),
      forClass: getClassInfo(file.description),
      uploadedBy: "Google Drive",
    }))
  } catch (error) {
    console.error("Error fetching files from Google Drive:", error)
    throw error
  }
}

// Get file by ID
export async function getFile(accessToken: string, fileId: string): Promise<DriveFile | null> {
  try {
    const drive = getDriveClient(accessToken)

    const response = await drive.files.get({
      fileId,
      fields:
        "id, name, mimeType, size, createdTime, description, webViewLink, webContentLink, iconLink, thumbnailLink",
    })

    const file = response.data

    return {
      id: file.id || "",
      name: file.name || "Unnamed File",
      mimeType: file.mimeType || "application/octet-stream",
      size: formatFileSize(Number.parseInt(file.size || "0")),
      createdTime: new Date(file.createdTime || "").toLocaleDateString(),
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink,
      iconLink: file.iconLink,
      thumbnailLink: file.thumbnailLink,
      category: getFileCategory(file.mimeType || ""),
      forClass: getClassInfo(file.description),
      uploadedBy: "Google Drive",
    }
  } catch (error) {
    console.error("Error fetching file from Google Drive:", error)
    return null
  }
}

// Upload file to Google Drive
export async function uploadFile(accessToken: string, file: any, forClass?: string): Promise<DriveFile | null> {
  try {
    const drive = getDriveClient(accessToken)

    // Create metadata for the file
    const fileMetadata = {
      name: file.name,
      description: forClass ? `Grade: ${forClass}` : undefined,
    }

    

    // Upload file to Google Drive
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType: file.type,
        body: Readable.from(file.stream()),
      },
      fields:
        "id, name, mimeType, size, createdTime, description, webViewLink, webContentLink, iconLink, thumbnailLink",
    })

    const uploadedFile = response.data

    // Make the file accessible to anyone with the link
    await drive.permissions.create({
      fileId: uploadedFile.id as string,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    })

    return {
      id: uploadedFile.id || "",
      name: uploadedFile.name || "Unnamed File",
      mimeType: uploadedFile.mimeType || "application/octet-stream",
      size: formatFileSize(Number.parseInt(uploadedFile.size || "0")),
      createdTime: new Date(uploadedFile.createdTime || "").toLocaleDateString(),
      webViewLink: uploadedFile.webViewLink,
      webContentLink: uploadedFile.webContentLink,
      iconLink: uploadedFile.iconLink,
      thumbnailLink: uploadedFile.thumbnailLink,
      category: getFileCategory(uploadedFile.mimeType || ""),
      forClass: getClassInfo(uploadedFile.description),
      uploadedBy: "You",
    }
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error)
    return null
  }
}

// Generate download URL
export function getDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`
}

