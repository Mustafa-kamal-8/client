
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/context/toast-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Plus, Loader2 } from "lucide-react"

// Category type
type Category = {
  id: string
  name: string
  created_at: string
  message_text: string
}

// Form validation schema
const MessageSchema = yup.object({
  category_id: yup.string().required("Category name is required"),
  message_text: yup.string().required("Message is required"),
})

type MessageFormData = yup.InferType<typeof MessageSchema>

export default function MessageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [messages, setMessages] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageFormData>({
    resolver: yupResolver(MessageSchema),
  })

  // Fetch categories
  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const data = await fetchWithAuth("/api/categories")
      setCategories(data)

    } catch (error) {
      console.error("Error fetching categories:", error)
      addToast({
        type: "error",
        description: "Failed to load categories",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchMessages = async () => {
    setIsLoading(true)
    try {
      const data = await fetchWithAuth("/api/message")
      setMessages(data)

    } catch (error) {
      console.error("Error fetching categories:", error)
      addToast({
        type: "error",
        description: "Failed to load categories",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  // Handle form submission
  const onSubmit = async (data: MessageFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetchWithAuth("/api/message", {
        method: "POST",
        body: JSON.stringify(data),
      })

      addToast({
        type: "success",
        description: "Category created successfully!",
      })

      // Close dialog and reset form
      setIsDialogOpen(false)
      reset()

      // Refresh categories
      fetchCategories()
    } catch (error) {
      console.error("Error creating category:", error)
      addToast({
        type: "error",
        description: "Failed to create category",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Pagination
  const paginatedCategories = messages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Categories</h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Create a new category for messages.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <select
                id="category_id"
                {...register("category_id", { required: "Category is required" })}
                className="w-full border p-2 rounded-md"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name || "Unknown Name"} {/* Adjust key if necessary */}
                  </option>
                ))}
              </select>



              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="message_text">Message </Label>
                  <Input id="message_text" {...register("message_text")} />
                  {errors.message_text && <p className="text-sm text-destructive">{errors.message_text.message}</p>}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Category"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border w-full overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">SI No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : paginatedCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCategories.map((category, index) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                    <TableCell>{category.message_text}</TableCell>
                    <TableCell>{new Date(category.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

        </div>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationPrevious onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} />
            {[...Array(totalPages)].map((_, i) => (
              <PaginationLink key={i} isActive={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </PaginationLink>
            ))}
            <PaginationNext onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}  />
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}



