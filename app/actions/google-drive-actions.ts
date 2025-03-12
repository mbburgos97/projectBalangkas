"use server"

import { cookies } from "next/headers"
import { getOAuth2Client, listFiles, getFile, uploadFile, type DriveFile } from "@/lib/google-drive-service"

// Scopes for Google Drive API
const SCOPES = ["https://www.googleapis.com/auth/drive"]

// Get auth URL for Google Drive
export async function getGoogleAuthUrl() {
  const oauth2Client = getOAuth2Client()
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    // Make sure the redirect_uri matches exactly what's in Google Cloud Console
    redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI + "/google",
  })
  return authUrl
}

// Handle Google auth callback
export async function handleGoogleCallback(code: string) {
  try {
    const oauth2Client = getOAuth2Client()
    // Explicitly set the redirect_uri to match what was used in the authorization request
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI + "/google",
    })

    if (tokens.access_token) {
      // Store token in cookies (in a real app, you'd want to store this more securely)
      cookies().set("google_access_token", tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600, // 1 hour
        path: "/",
      })

      if (tokens.refresh_token) {
        cookies().set("google_refresh_token", tokens.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: "/",
        })
      }

      return { success: true }
    }

    return { success: false, error: "No access token received" }
  } catch (error) {
    console.error("Error handling Google callback:", error)
    return { success: false, error: "Failed to authenticate with Google" }
  }
}

// Get files from Google Drive
export async function getGoogleDriveFiles(
  searchTerm?: string,
): Promise<{ files: DriveFile[]; authenticated: boolean }> {
  const accessToken = cookies().get("google_access_token")?.value

  if (!accessToken) {
    return { files: [], authenticated: false }
  }

  try {
    const files = await listFiles(accessToken, searchTerm)
    return { files, authenticated: true }
  } catch (error) {
    console.error("Error fetching Google Drive files:", error)
    // Token might be expired
    return { files: [], authenticated: false }
  }
}

// Get single file from Google Drive
export async function getGoogleDriveFile(fileId: string): Promise<{ file: DriveFile | null; authenticated: boolean }> {
  const accessToken = cookies().get("google_access_token")?.value

  if (!accessToken) {
    return { file: null, authenticated: false }
  }

  try {
    const file = await getFile(accessToken, fileId)
    return { file, authenticated: true }
  } catch (error) {
    console.error("Error fetching Google Drive file:", error)
    return { file: null, authenticated: false }
  }
}

// Upload file to Google Drive
export async function uploadFileToDrive(
  formData: FormData,
): Promise<{ file: DriveFile | null; success: boolean; error?: string }> {
  const accessToken = cookies().get("google_access_token")?.value

  console.log(accessToken)

  if (!accessToken) {
    return { file: null, success: false, error: "Not authenticated with Google Drive" }
  }

  try {
    const fileData = formData.get("file") as File
    const forClass = formData.get("forClass") as string

    if (!fileData) {
      return { file: null, success: false, error: "No file provided" }
    }

    const uploadedFile = await uploadFile(accessToken, fileData, forClass)

    if (!uploadedFile) {
      console.log(uploadedFile)
      return { file: null, success: false, error: "Failed to upload file" }
    }

    return { file: uploadedFile, success: true }
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error)
    return { file: null, success: false, error: "An error occurred while uploading the file" }
  }
}

// Logout from Google
export async function logoutFromGoogle() {
  cookies().delete("google_access_token")
  cookies().delete("google_refresh_token")
  return { success: true }
}

