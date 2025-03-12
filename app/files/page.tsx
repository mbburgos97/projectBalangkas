"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Download, FileText, Search, RefreshCw, LogIn, Info } from "lucide-react"
import type { DriveFile } from "@/lib/google-drive-service"
import { getGoogleAuthUrl, getGoogleDriveFiles, logoutFromGoogle } from "@/app/actions/google-drive-actions"
import { toast } from "@/components/ui/use-toast"
import { FileUploadDialog } from "@/components/file-upload-dialog"

export default function FilesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [files, setFiles] = useState<DriveFile[]>([])
  const [filteredFiles, setFilteredFiles] = useState<DriveFile[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)

  // Check if user is a teacher or admin
  const canUpload = user?.role === "teacher" || user?.role === "admin"

  // Check for auth errors
  useEffect(() => {
    const error = searchParams.get("error")
    if (error === "auth_failed") {
      toast({
        title: "Authentication Failed",
        description: "Failed to authenticate with Google Drive",
        variant: "destructive",
      })
    }
  }, [searchParams])

  // Auth check
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Fetch files from Google Drive
  const fetchFiles = async () => {
    setIsLoadingFiles(true)
    try {
      const result = await getGoogleDriveFiles()
      setFiles(result.files)
      setFilteredFiles(result.files)
      setIsAuthenticated(result.authenticated)

      // Extract unique categories
      const uniqueCategories = Array.from(new Set(result.files.map((file) => file.category)))
      setCategories(uniqueCategories as string[])
    } catch (error) {
      console.error("Error fetching files:", error)
      toast({
        title: "Error",
        description: "Failed to fetch files from Google Drive",
        variant: "destructive",
      })
    } finally {
      setIsLoadingFiles(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchFiles()
    }
  }, [user])

  // Handle search and filtering
  useEffect(() => {
    if (files.length > 0) {
      let filtered = files

      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(
          (file) =>
            file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (file.category && file.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (file.forClass && file.forClass.toLowerCase().includes(searchTerm.toLowerCase())),
        )
      }

      // Apply category filter
      if (selectedCategory) {
        filtered = filtered.filter((file) => file.category === selectedCategory)
      }

      setFilteredFiles(filtered)
    }
  }, [searchTerm, selectedCategory, files])

  // Handle Google Drive authentication
  const handleGoogleAuth = async () => {
    try {
      const authUrl = await getGoogleAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      console.error("Error getting auth URL:", error)
      toast({
        title: "Error",
        description: "Failed to initiate Google Drive authentication",
        variant: "destructive",
      })
    }
  }

  // Handle logout from Google
  const handleGoogleLogout = async () => {
    try {
      await logoutFromGoogle()
      setIsAuthenticated(false)
      setFiles([])
      setFilteredFiles([])
      toast({
        title: "Success",
        description: "Logged out from Google Drive",
      })
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  // Get file icon based on category
  const getFileIcon = (category?: string) => {
    switch (category) {
      case "PDF":
        return <FileText className="h-5 w-5 text-red-500" />
      case "Spreadsheet":
        return <FileText className="h-5 w-5 text-green-500" />
      case "Document":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "Presentation":
        return <FileText className="h-5 w-5 text-orange-500" />
      case "Image":
        return <FileText className="h-5 w-5 text-purple-500" />
      case "Video":
        return <FileText className="h-5 w-5 text-pink-500" />
      case "Audio":
        return <FileText className="h-5 w-5 text-yellow-500" />
      case "Archive":
        return <FileText className="h-5 w-5 text-gray-500" />
      default:
        return <FileText className="h-5 w-5 text-accent" />
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">Loading...</h2>
          <p className="text-sm text-muted-foreground">Please wait while we load your files</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 space-y-4 p-4 md:p-8 bg-gradient-to-b from-secondary/5 to-accent/5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              Google Drive Files
            </h1>
            <p className="text-muted-foreground">Access and manage educational resources from Google Drive</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" size="icon" onClick={() => setShowDebug(!showDebug)} className="ml-auto">
              <Info className="h-4 w-4" />
            </Button>
            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  className="gap-2 border-secondary text-secondary hover:bg-secondary/10"
                  onClick={handleGoogleLogout}
                >
                  Disconnect Google Drive
                </Button>
                <Button
                  className="gap-2 bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 transition-all duration-300"
                  onClick={fetchFiles}
                  disabled={isLoadingFiles}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingFiles ? "animate-spin" : ""}`} />
                  Refresh Files
                </Button>
                {canUpload && isAuthenticated && <FileUploadDialog onUploadComplete={fetchFiles} />}
              </>
            ) : (
              <Button
                className="gap-2 bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 transition-all duration-300"
                onClick={handleGoogleAuth}
              >
                <LogIn className="h-4 w-4" />
                Connect Google Drive
              </Button>
            )}
          </div>
        </div>

        {showDebug && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>NEXT_PUBLIC_REDIRECT_URI:</strong> {process.env.NEXT_PUBLIC_REDIRECT_URI}
                </div>
                <div>
                  <strong>NEXT_PUBLIC_APP_URL:</strong> {process.env.NEXT_PUBLIC_APP_URL}
                </div>
                <div>
                  <strong>Full Redirect URI:</strong> {process.env.NEXT_PUBLIC_REDIRECT_URI + "/google"}
                </div>
                <div>
                  <strong>Is Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
                </div>
                <div>
                  <strong>User Role:</strong> {user?.role}
                </div>
                <div>
                  <strong>Can Upload:</strong> {canUpload ? "Yes" : "No"}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="md:w-1/4">
            <Card className="border-secondary/10 shadow-lg shadow-secondary/5">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  Categories
                </CardTitle>
                <CardDescription>Browse by file type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${!selectedCategory ? "bg-secondary/10 text-secondary" : "text-secondary hover:text-secondary/80 hover:bg-secondary/10"}`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    All Files
                  </Button>

                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant="ghost"
                      className={`w-full justify-start ${selectedCategory === category ? "bg-secondary/10 text-secondary" : "text-secondary hover:text-secondary/80 hover:bg-secondary/10"}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex-1">
            <Card className="border-accent/10 shadow-lg shadow-accent/5">
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <CardTitle className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                    Available Files
                  </CardTitle>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search files..."
                      className="pl-8 border-accent/20 focus-visible:ring-accent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingFiles ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <RefreshCw className="h-12 w-12 text-secondary animate-spin" />
                    <h3 className="mt-4 text-lg font-medium">Loading files...</h3>
                    <p className="text-sm text-muted-foreground">
                      Please wait while we fetch your files from Google Drive
                    </p>
                  </div>
                ) : !isAuthenticated ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <LogIn className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Connect to Google Drive</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect your Google Drive account to access your files
                    </p>
                    <Button
                      className="gap-2 bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 transition-all duration-300"
                      onClick={handleGoogleAuth}
                    >
                      <LogIn className="h-4 w-4" />
                      Connect Google Drive
                    </Button>
                  </div>
                ) : filteredFiles.length > 0 ? (
                  <div className="space-y-4">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between hover:border-accent/20 transition-all shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-secondary/20 to-accent/20">
                            {getFileIcon(file.category)}
                          </div>
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span>{file.size}</span>
                              <span>•</span>
                              <span>{file.category}</span>
                              {file.forClass && (
                                <>
                                  <span>•</span>
                                  <span>{file.forClass}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground">Uploaded: {file.createdTime}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-accent hover:text-accent/80 hover:bg-accent/10"
                            asChild
                          >
                            <a href={file.webViewLink} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4" />
                              <span>View</span>
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-accent hover:text-accent/80 hover:bg-accent/10"
                            asChild
                          >
                            <a href={file.webContentLink} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                              <span>Download</span>
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No files found</h3>
                    <p className="text-sm text-muted-foreground">
                      {canUpload
                        ? "Try uploading some files or adjusting your search filters"
                        : "Try adjusting your search or filters"}
                    </p>
                    {canUpload && (
                      <Button
                        className="mt-4 gap-2 bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 transition-all duration-300"
                        onClick={() => document.querySelector<HTMLButtonElement>('[data-trigger="upload"]')?.click()}
                      >
                        Upload Files
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

