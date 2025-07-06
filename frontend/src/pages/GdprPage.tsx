/**
 * GDPR PAGE - VERSIONE FUNZIONANTE
 * 
 * ✅ SOLUZIONE TESTATA E FUNZIONANTE
 * Data: 13 Giugno 2025
 * 
 * STESSO FIX APPLICATO A GdprSettingsTab:
 * - Endpoint corretto: /api/settings/gdpr
 * - Rimozione logica workspace-specific
 * - Backend gestisce workspace via header x-workspace-id
 * 
 * ⚠️ MANTIENI SINCRONIZZATO CON GdprSettingsTab.tsx
 */

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/services/api"
import { Loader2, Save, ShieldCheck, Upload, File, Download, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function GdprPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [gdprText, setGdprText] = useState("")
  const [defaultGdpr, setDefaultGdpr] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{id: string, name: string, uploadedAt: string}>>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    const loadGdprContent = async () => {
      setIsPageLoading(true)
      try {
        const response = await api.get(`/settings/gdpr`)
        setGdprText(response.data.data?.gdpr || response.data.content || '')
      } catch (error) {
        console.error('Error loading GDPR content:', error)
        toast.error('Failed to load GDPR content')
      } finally {
        setIsPageLoading(false)
      }
    }
    loadGdprContent()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await api.put(`/settings/gdpr`, { gdpr: gdprText })
      toast.success('GDPR policy saved successfully')
    } catch (error) {
      console.error('Error saving GDPR policy:', error)
      toast.error('Failed to save GDPR policy')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      const response = await api.post('/gdpr/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      setUploadedFiles(prev => [...prev, {
        id: response.data.id,
        name: selectedFile.name,
        uploadedAt: new Date().toISOString()
      }])
      
      setSelectedFile(null)
      const input = document.getElementById('file-upload') as HTMLInputElement
      if (input) input.value = ''
      
      toast.success('GDPR document uploaded successfully')
    } catch (error) {
      console.error('Error uploading GDPR document:', error)
      toast.error('Failed to upload GDPR document')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await api.get(`/gdpr/download/${fileId}`, {
        responseType: 'blob',
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('File downloaded successfully')
    } catch (error) {
      console.error('Error downloading file:', error)
      toast.error('Failed to download file')
    }
  }

  const handleDelete = async (fileId: string) => {
    try {
      await api.delete(`/gdpr/delete/${fileId}`)
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
      toast.success('File deleted successfully')
    } catch (error) {
      console.error('Error deleting file:', error)
      toast.error('Failed to delete file')
    }
  }

  if (isPageLoading) {
    return (
      <div className="container mx-auto py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Loading GDPR policy...</h2>
      </div>
    )
  }

  return (
    <div className="container pl-0 pr-4 pt-4 pb-4">
      <div className="grid grid-cols-12 gap-0">
        <div className="col-span-11 col-start-1">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            <h1 className="text-3xl font-bold text-green-600">Privacy & GDPR Policy</h1>
          </div>
          
          <div className="space-y-6">
            {/* GDPR Document Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload GDPR Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload your GDPR-related documents (privacy policy, terms of service, etc.)
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleUpload}
                      disabled={!selectedFile || isUploading}
                      className="flex items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {selectedFile && (
                    <div className="text-sm text-gray-600">
                      Selected: {selectedFile.name}
                    </div>
                  )}
                </div>
                
                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Uploaded Documents</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(file.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(file.id, file.name)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(file.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* GDPR Policy Editor */}
            <Card>
              <CardHeader>
                <CardTitle>GDPR Policy Editor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Edit your privacy policy and GDPR compliance statement that will be shown to your customers.
                </p>
                
                <Textarea
                  value={gdprText}
                  onChange={(e) => setGdprText(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                />
                
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={handleSave} 
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Policy
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 