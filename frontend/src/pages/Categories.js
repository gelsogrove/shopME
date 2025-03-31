import { Check, Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import PageLayout from "../components/layout/PageLayout"

const Categories = () => {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Formaggi",
      description: "Formaggi italiani DOP e IGP",
    },
    {
      id: 2,
      name: "Oli e Condimenti",
      description: "Oli extra vergine e condimenti tipici",
    },
    {
      id: 3,
      name: "Pasta",
      description: "Pasta fresca e secca di alta qualità",
    },
    {
      id: 4,
      name: "Salumi",
      description: "Salumi e affettati tradizionali",
    },
    {
      id: 5,
      name: "Conserve",
      description: "Conserve e specialità in barattolo",
    },
    {
      id: 6,
      name: "Primi Piatti",
      description: "Primi piatti pronti della tradizione",
    },
  ])

  const [editingId, setEditingId] = useState(null)
  const [newCategory, setNewCategory] = useState({ name: "", description: "" })
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = () => {
    if (newCategory.name.trim() && newCategory.description.trim()) {
      setCategories([
        ...categories,
        {
          id: Math.max(...categories.map((c) => c.id)) + 1,
          ...newCategory,
        },
      ])
      setNewCategory({ name: "", description: "" })
      setIsAdding(false)
    }
  }

  const handleEdit = (id) => {
    const category = categories.find((c) => c.id === id)
    if (category) {
      setEditingId(id)
      setNewCategory({ name: category.name, description: category.description })
    }
  }

  const handleUpdate = (id) => {
    if (newCategory.name.trim() && newCategory.description.trim()) {
      setCategories(
        categories.map((category) =>
          category.id === id ? { ...category, ...newCategory } : category
        )
      )
      setEditingId(null)
      setNewCategory({ name: "", description: "" })
    }
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setCategories(categories.filter((category) => category.id !== id))
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setNewCategory({ name: "", description: "" })
  }

  return (
    <PageLayout title="Categories">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="p-6">
            {/* Add/Edit Form */}
            {(isAdding || editingId !== null) && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, name: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white sm:text-sm"
                      placeholder="Enter category name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newCategory.description}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          description: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white sm:text-sm"
                      placeholder="Enter category description"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() =>
                        editingId !== null
                          ? handleUpdate(editingId)
                          : handleAdd()
                      }
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {editingId !== null ? "Update" : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Categories List */}
            <div className="mt-6">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {category.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {category.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(category.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export default Categories
