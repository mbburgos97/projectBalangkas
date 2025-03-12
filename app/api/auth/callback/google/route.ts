import type { NextRequest } from "next/server"
import { handleGoogleCallback } from "@/app/actions/google-drive-actions"
import { redirect } from "next/navigation"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    return new Response("No code provided", { status: 400 })
  }

  try {
    const result = await handleGoogleCallback(code)

    if (result.success) {
      // Redirect to the files page after successful authentication
      return redirect("/files")
    } else {
      // Redirect with error if authentication failed
      return redirect("/files?error=auth_failed")
    }
  } catch (error) {
    console.error("Error handling Google callback:", error)
    return redirect("/files?error=auth_failed")
  }
}

