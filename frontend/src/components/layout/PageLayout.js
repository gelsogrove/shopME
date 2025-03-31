const PageLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {title && (
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h1>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}

export default PageLayout
