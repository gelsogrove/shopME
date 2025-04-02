import { Pencil, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import PageLayout from "../components/layout/PageLayout"

export default function Prompts() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")

  const [prompts] = useState([
    {
      id: 1,
      title: "Product Description Template",
      lastModified: "2024-03-31",
      content: "Template for product descriptions...",
    },
    {
      id: 2,
      title: "Customer Service Response",
      lastModified: "2024-03-30",
      content: "Standard responses for customer service...",
    },
    {
      id: 3,
      title: "Order Confirmation",
      lastModified: "2024-03-29",
      content: "Order confirmation message template...",
    },
  ])

  // Optimize search using useMemo
  const filteredPrompts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return prompts

    return prompts.filter((prompt) => {
      const titleMatch = prompt.title.toLowerCase().includes(query)
      const contentMatch = prompt.content.toLowerCase().includes(query)
      return titleMatch || contentMatch
    })
  }, [prompts, searchQuery])

  return (
    <PageLayout title="Prompts">
      <div className="p-4">
        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Prompts Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Modified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPrompts.map((prompt) => (
                    <tr
                      key={prompt.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {prompt.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {prompt.lastModified}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <button
                          onClick={() => navigate(`/prompts/${prompt.id}/edit`)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          <Pencil className="h-5 w-5" />
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
