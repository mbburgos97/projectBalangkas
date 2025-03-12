import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mock data for files
export const mockFiles = [
  {
    id: "1",
    name: "Mathematics Syllabus.pdf",
    type: "pdf",
    size: "2.4 MB",
    uploadedBy: "Teacher Demo",
    uploadedAt: "2023-09-15",
    category: "Syllabus",
    forClass: "Grade 10",
    downloadUrl: "#",
  },
  {
    id: "2",
    name: "Science Project Guidelines.docx",
    type: "docx",
    size: "1.8 MB",
    uploadedBy: "Teacher Demo",
    uploadedAt: "2023-09-20",
    category: "Project",
    forClass: "Grade 9",
    downloadUrl: "#",
  },
  {
    id: "3",
    name: "History Assignment.pdf",
    type: "pdf",
    size: "3.2 MB",
    uploadedBy: "Teacher Demo",
    uploadedAt: "2023-10-05",
    category: "Assignment",
    forClass: "Grade 11",
    downloadUrl: "#",
  },
  {
    id: "4",
    name: "English Literature Notes.pdf",
    type: "pdf",
    size: "5.1 MB",
    uploadedBy: "Teacher Demo",
    uploadedAt: "2023-10-12",
    category: "Notes",
    forClass: "Grade 12",
    downloadUrl: "#",
  },
  {
    id: "5",
    name: "Computer Science Practical.zip",
    type: "zip",
    size: "15.7 MB",
    uploadedBy: "Teacher Demo",
    uploadedAt: "2023-10-18",
    category: "Practical",
    forClass: "Grade 10",
    downloadUrl: "#",
  },
]

// Mock announcements
export const mockAnnouncements = [
  {
    id: "1",
    title: "Midterm Exam Schedule",
    content:
      "The midterm exams will be held from November 15-20. Please check the detailed schedule on the notice board.",
    postedBy: "Admin User",
    postedAt: "2023-10-25",
    important: true,
  },
  {
    id: "2",
    title: "Science Fair Registration",
    content:
      "Registration for the annual science fair is now open. Please submit your project proposals by November 5.",
    postedBy: "Teacher Demo",
    postedAt: "2023-10-20",
    important: false,
  },
  {
    id: "3",
    title: "Holiday Schedule",
    content:
      "The school will be closed for the winter break from December 20 to January 5. Classes will resume on January 6.",
    postedBy: "Admin User",
    postedAt: "2023-10-15",
    important: true,
  },
]

