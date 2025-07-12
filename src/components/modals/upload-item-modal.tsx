'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createItemSchema, CreateItemInput } from '@/lib/validations'
import { ItemCategory, ItemCondition } from '@/models/Item'
import { Upload, X, Plus, CheckCircle } from 'lucide-react'

interface UploadItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const categories: { value: ItemCategory; label: string }[] = [
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'other', label: 'Other' },
]

const conditions: { value: ItemCondition; label: string }[] = [
  { value: 'new', label: 'New with tags' },
  { value: 'like-new', label: 'Like new' },
  { value: 'good', label: 'Good condition' },
  { value: 'fair', label: 'Fair condition' },
  { value: 'poor', label: 'Poor condition' },
]

export default function UploadItemModal({ isOpen, onClose, onSuccess }: UploadItemModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<CreateItemInput>({
    resolver: zodResolver(createItemSchema),
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            const newImages = [...images, event.target.result as string]
            setImages(newImages)
            setValue('images', newImages)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    setValue('images', newImages)
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const newTags = [...tags, newTag.trim()]
      setTags(newTags)
      setValue('tags', newTags)
      setNewTag('')
    }
  }

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index)
    setTags(newTags)
    setValue('tags', newTags)
  }

  const onSubmit = async (data: CreateItemInput) => {
    try {
      setIsLoading(true)
      setError('')

      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          handleClose()
          onSuccess?.()
        }, 2000)
      } else {
        setError(result.error || 'Failed to upload item')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    setImages([])
    setTags([])
    setNewTag('')
    setError('')
    setSuccess(false)
    onClose()
  }

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Success!" size="md">
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Item Uploaded Successfully!
          </h3>
          <p className="text-gray-600 mb-4">
            Your item has been submitted for review. You'll be notified once it's approved.
          </p>
          <Button onClick={handleClose}>
            Close
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Sell Your Item" size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Images */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Images *</label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {images.length < 5 && (
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400">
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Add Image</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {errors.images && (
            <p className="text-red-500 text-sm">{errors.images.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title *</label>
              <Input
                id="title"
                placeholder="Enter item title"
                {...register('title')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category *</label>
              <select
                id="category"
                {...register('category')}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm">{errors.category.message}</p>
              )}
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <label htmlFor="condition" className="text-sm font-medium">Condition *</label>
              <select
                id="condition"
                {...register('condition')}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">Select condition</option>
                {conditions.map((condition) => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
              {errors.condition && (
                <p className="text-red-500 text-sm">{errors.condition.message}</p>
              )}
            </div>

            {/* Size and Brand */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="size" className="text-sm font-medium">Size *</label>
                <Input
                  id="size"
                  placeholder="e.g., M, L, 32"
                  {...register('size')}
                  className={errors.size ? 'border-red-500' : ''}
                />
                {errors.size && (
                  <p className="text-red-500 text-sm">{errors.size.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="brand" className="text-sm font-medium">Brand</label>
                <Input
                  id="brand"
                  placeholder="Brand name"
                  {...register('brand')}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description *</label>
              <Textarea
                id="description"
                placeholder="Describe your item in detail"
                rows={4}
                {...register('description')}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description.message}</p>
              )}
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="sellingPrice" className="text-sm font-medium">Selling Price *</label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('sellingPrice', { valueAsNumber: true })}
                  className={errors.sellingPrice ? 'border-red-500' : ''}
                />
                {errors.sellingPrice && (
                  <p className="text-red-500 text-sm">{errors.sellingPrice.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="originalPrice" className="text-sm font-medium">Original Price</label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('originalPrice', { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1 text-primary hover:text-primary/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Uploading...' : 'Upload Item'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
