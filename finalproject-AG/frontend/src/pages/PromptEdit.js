import { ArrowLeft, ChevronRight, Home } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import PageLayout from "../components/layout/PageLayout"

export default function PromptEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState({
    id: id,
    title: "Product Description Template",
    content: `Product Name: [Product Name]

Description:
[Detailed product description including key features and benefits]

Specifications:
- Material: [Material type]
- Dimensions: [Size/dimensions]
- Weight: [Weight]
- Origin: [Country/Region of origin]

Certifications:
- [List any DOP, IGP, or other certifications]

Storage Instructions:
[Storage requirements and recommendations]

Serving Suggestions:
[How to serve or use the product]

Additional Information:
[Any other relevant details about the product]`,
  })

  const handleSave = () => {
    // In a real app, this would make an API call to save the changes
    navigate("/prompts")
  }

  return (
    <PageLayout title="Edit Prompt">
      <div className="p-4">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link
                  to="/prompts"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 dark:text-gray-400 dark:hover:text-white"
                >
                  Prompts
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                  Edit Prompt
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Back button and actions */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate("/prompts")}
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Prompts
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Save Changes
          </button>
        </div>

        {/* Edit form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            {/* Title */}
            <div className="mb-6">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={prompt.title}
                onChange={(e) =>
                  setPrompt((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Content */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Content
              </label>
              <textarea
                id="content"
                value={prompt.content}
                onChange={(e) =>
                  setPrompt((prev) => ({ ...prev, content: e.target.value }))
                }
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
