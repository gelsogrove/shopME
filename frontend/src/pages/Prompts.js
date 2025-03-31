import { Edit, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

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
    setPrompts(prompts.filter((p) => p.idPrompts !== idPrompts))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Prompts
        </h1>
      </div>

      {/* Add/Edit Prompt Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex space-x-4">
          <input
            type="text"
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            placeholder="Enter prompt text..."
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={editingPrompt ? handleUpdatePrompt : handleAddPrompt}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            {editingPrompt ? "Update Prompt" : "Add Prompt"}
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
    </div>
  )
}

export default Prompts
