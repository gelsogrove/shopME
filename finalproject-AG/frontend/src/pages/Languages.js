import PageLayout from "../components/layout/PageLayout"

const Languages = () => {
  const languages = [
    { code: "en", name: "English" },
    { code: "it", name: "Italian" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
  ]

  return (
    <PageLayout title="Languages">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {languages.map((language) => (
          <div
            key={language.code}
            className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
          >
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {language.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Language code: {language.code}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-4 sm:px-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Select
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}

export default Languages
