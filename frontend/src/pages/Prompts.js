import { Edit, Search, Trash2 } from "lucide-react"
import { useState } from "react"
import PageLayout from "../components/layout/PageLayout"

const Prompts = () => {
  const [prompts, setPrompts] = useState([
    {
      idPrompts: 1,
      prompt: "Default product description template",
      isActive: true,
    },
    {
      idPrompts: 2,
      prompt: "Customer service response template",
      isActive: false,
    },
    { idPrompts: 3, prompt: "Marketing email template", isActive: false },
  ])

  const [editingPrompt, setEditingPrompt] = useState(null)
  const [newPrompt, setNewPrompt] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const handleSetActive = (idPrompts) => {
    setPrompts(
      prompts.map((p) => ({
        ...p,
        isActive: p.idPrompts === idPrompts,
      }))
    )
  }

  const handleAddPrompt = () => {
    if (!newPrompt.trim()) return

    const newId = Math.max(...prompts.map((p) => p.idPrompts)) + 1
    setPrompts([
      ...prompts,
      { idPrompts: newId, prompt: newPrompt, isActive: false },
    ])
    setNewPrompt("")
  }

  const handleEditPrompt = (prompt) => {
    setEditingPrompt(prompt)
    setNewPrompt(prompt.prompt)
  }

  const handleUpdatePrompt = () => {
    if (!newPrompt.trim()) return

    setPrompts(
      prompts.map((p) =>
        p.idPrompts === editingPrompt.idPrompts
          ? { ...p, prompt: newPrompt }
          : p
      )
    )
    setEditingPrompt(null)
    setNewPrompt("")
  }

  const handleDeletePrompt = (idPrompts) => {
    setDeleteConfirm(idPrompts)
  }

  const confirmDelete = () => {
    setPrompts(prompts.filter((p) => p.idPrompts !== deleteConfirm))
    setDeleteConfirm(null)
  }

  return (
    <PageLayout title="Prompts">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Add Prompt
          </button>
        </div>
      </div>

      {/* Prompts List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Prompt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {prompts.map((prompt) => (
              <tr key={prompt.idPrompts}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {prompt.idPrompts}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {prompt.prompt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleSetActive(prompt.idPrompts)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      prompt.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {prompt.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-3">
                  <button
                    onClick={() => handleEditPrompt(prompt)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Edit className="h-5 w-5 inline" />
                  </button>
                  <button
                    onClick={() => handleDeletePrompt(prompt.idPrompts)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-5 w-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this prompt? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}

export default Prompts
