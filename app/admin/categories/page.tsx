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
}

// Form validation schema
const categorySchema = yup.object({
  name: yup.string().required("Category name is required"),
})

type CategoryFormData = yup.InferType<typeof categorySchema>

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
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
  } = useForm<CategoryFormData>({
    resolver: yupResolver(categorySchema),
  })

  // Fetch categories
  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const data = await fetchWithAuth("/api/categories")
      setCategories(data || [])
      setTotalPages(Math.ceil((data?.length || 0) / itemsPerPage))
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

  // Handle form submission
  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetchWithAuth("/api/categories", {
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
  const paginatedCategories = categories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Categories</h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Create a new category for messages.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
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
          <TableCell>{category.name}</TableCell>
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
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                // disabled={currentPage === 1}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink isActive={page === currentPage} onClick={() => setCurrentPage(page)}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                // disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

