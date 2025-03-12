"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockAnnouncements } from "@/lib/utils"
import { Bell, BookOpen, FileText, Users } from "lucide-react"
import Link from "next/link"
import { getGoogleDriveFiles } from "@/app/actions/google-drive-actions"
import type { DriveFile } from "@/lib/google-drive-service"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [files, setFiles] = useState<DriveFile[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Fetch files from Google Drive
  useEffect(() => {
    if (user) {
      const fetchFiles = async () => {
        setIsLoadingFiles(true)
        try {
          const result = await getGoogleDriveFiles()
          if (result.authenticated) {
            setFiles(result.files)
          }
        } catch (error) {
          console.error("Error fetching files:", error)
        } finally {
          setIsLoadingFiles(false)
        }
      }

      fetchFiles()
    }
  }, [user])

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">Loading...</h2>
          <p className="text-sm text-muted-foreground">Please wait while we load your dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 space-y-4 p-4 md:p-8 bg-gradient-to-b from-purple-50/50 to-blue-50/50 dark:from-purple-950/10 dark:to-blue-950/10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Dashboard
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/10 shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{files.length}</div>
              <p className="text-xs text-muted-foreground">Available in Google Drive</p>
            </CardContent>
          </Card>
          <Card className="border-secondary/10 shadow-lg shadow-secondary/5 hover:shadow-secondary/10 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+120</div>
              <p className="text-xs text-muted-foreground">+10% from last month</p>
            </CardContent>
          </Card>
          <Card className="border-accent/10 shadow-lg shadow-accent/5 hover:shadow-accent/10 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resources</CardTitle>
              <BookOpen className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">25</div>
              <p className="text-xs text-muted-foreground">+5 new resources</p>
            </CardContent>
          </Card>
          <Card className="border-primary/10 shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Announcements</CardTitle>
              <Bell className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnnouncements.length}</div>
              <p className="text-xs text-muted-foreground">+1 new announcement</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 border-primary/10 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Recent Announcements
              </CardTitle>
              <CardDescription>Stay updated with the latest announcements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="flex flex-col space-y-2 rounded-lg border p-4 hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{announcement.title}</h3>
                      {announcement.important && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                          Important
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{announcement.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Posted by: {announcement.postedBy}</span>
                      <span className="text-xs text-muted-foreground">{announcement.postedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3 border-secondary/10 shadow-lg shadow-secondary/5">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                Recent Files
              </CardTitle>
              <CardDescription>Recently uploaded files</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingFiles ? (
                <div className="flex justify-center py-8">
                  <p className="text-sm text-muted-foreground">Loading files...</p>
                </div>
              ) : files.length > 0 ? (
                <div className="space-y-4">
                  {files.slice(0, 3).map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 rounded-lg border p-3 hover:border-secondary/20 transition-all"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-secondary/20 to-primary/20">
                        <FileText className="h-5 w-5 text-secondary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.size} • {file.createdTime}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-secondary hover:text-secondary/80 hover:bg-secondary/10"
                      >
                        <a href={file.webContentLink} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="border-secondary text-secondary hover:bg-secondary/10"
                    >
                      <Link href="/files">View All Files</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No files found</h3>
                  <p className="text-sm text-muted-foreground">Connect to Google Drive to access files</p>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="mt-4 border-secondary text-secondary hover:bg-secondary/10"
                  >
                    <Link href="/files">Go to Files</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

