import { Plus } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const Workspace = () => {
  const navigate = useNavigate()
  const [phoneNumbers, setPhoneNumbers] = useState([
    {
      id: 1,
      number: "+39 345 123 4567",
      isActive: true,
      lastAccess: "2024-03-20T10:30:00",
      unreadMessages: 5,
    },
    {
      id: 2,
      number: "+39 333 987 6543",
      isActive: true,
      lastAccess: "2024-03-19T15:45:00",
      unreadMessages: 2,
    },
  ])

  const [isAddingNumber, setIsAddingNumber] = useState(false)
  const [newNumber, setNewNumber] = useState("")

  const handleAddNumber = () => {
    if (newNumber.trim()) {
      setPhoneNumbers([
        ...phoneNumbers,
        {
          id: Math.max(...phoneNumbers.map((p) => p.id)) + 1,
          number: newNumber,
          isActive: true,
          lastAccess: new Date().toISOString(),
          unreadMessages: 0,
        },
      ])
      setNewNumber("")
      setIsAddingNumber(false)
    }
  }

  const handleNumberClick = (number) => {
    // Navigate to the dashboard with the selected phone number
    navigate(`/dashboard`, { state: { phoneNumber: number } })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your channels
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Seleziona un numero per gestire le sue conversazioni
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {phoneNumbers.map((phone) => (
              <div
                key={phone.id}
                onClick={() => handleNumberClick(phone.number)}
                className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow cursor-pointer transition-transform hover:scale-105"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {phone.number}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Ultimo accesso:{" "}
                        {new Date(phone.lastAccess).toLocaleString("it-IT")}
                      </p>
                    </div>
                    {phone.unreadMessages > 0 && (
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {phone.unreadMessages}
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        phone.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {phone.isActive ? "Attivo" : "Non attivo"}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Add new number card */}
            <div
              onClick={() => setIsAddingNumber(true)}
              className={`bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 ${
                isAddingNumber ? "hidden" : "flex"
              } items-center justify-center p-6 hover:border-blue-500 dark:hover:border-blue-400 transition-colors`}
            >
              <div className="text-center">
                <Plus className="mx-auto h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Aggiungi nuovo numero
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Add number modal */}
        {isAddingNumber && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Aggiungi nuovo numero
              </h2>
              <input
                type="text"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                placeholder="+39 XXX XXX XXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setIsAddingNumber(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Annulla
                </button>
                <button
                  onClick={handleAddNumber}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Aggiungi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Workspace
