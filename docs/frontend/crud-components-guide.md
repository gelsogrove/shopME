# CRUD Components Best Practices

This guide outlines best practices for maintaining consistent UI across all CRUD (Create, Read, Update, Delete) pages in the application.

## Layout Structure

Always use the following structure for your pages:

```jsx
import { PageLayout } from "@/components/layout/PageLayout"

export function YourPage() {
  // Your component logic

  return (
    <PageLayout>
      {/* Your page content */}
    </PageLayout>
  )
}
```

## CRUD Pages

For pages that display tables with data, use the `CrudPageContent` component:

```jsx
import { CrudPageContent } from "@/components/shared/CrudPageContent"

// Inside your component return statement
<CrudPageContent
  title="Your Title"
  titleIcon={<Icon className={commonStyles.headerIcon} />}
  searchValue={searchValue}
  onSearch={setSearchValue}
  searchPlaceholder="Search..."
  onAdd={() => setShowFormSheet(true)}
  data={filteredData}
  columns={columns}
  onEdit={handleEdit}
  onDelete={handleDelete}
  isLoading={isLoading}
/>
```

## Common Styles

Use the common styles defined in `src/styles/common.ts` for consistent UI:

```jsx
import { commonStyles } from "@/styles/common"

// Icons 
<Icon className={commonStyles.headerIcon} /> // For page headers
<Icon className={commonStyles.actionIcon} /> // For action buttons

// Buttons
<Button className={commonStyles.buttonPrimary}>Primary Action</Button>
<Button className={commonStyles.buttonGhost}>Secondary Action</Button>
```

## Form Sheets

Use the `FormSheet` component for all forms in slide-in sheets:

```jsx
<FormSheet
  open={showFormSheet}
  onOpenChange={setShowFormSheet}
  title="Form Title"
  description="Form description"
  onSubmit={handleSubmit}
  submitLabel="Submit"
>
  {/* Form fields */}
</FormSheet>
```

## Confirmation Dialogs

Use the `ConfirmDialog` component for all confirmation prompts:

```jsx
<ConfirmDialog
  open={showConfirmDialog}
  onOpenChange={setShowConfirmDialog}
  title="Confirm Action"
  description="Are you sure you want to perform this action?"
  onConfirm={handleConfirm}
/>
```

## Loading States

Use a consistent loading state format:

```jsx
if (isLoading) {
  return <div className="flex justify-center items-center h-96">Loading...</div>
}
```

## Empty States

Provide meaningful empty states when there's no data:

```jsx
{data.length === 0 && (
  <div className="flex flex-col items-center justify-center h-60 text-gray-500">
    <p>No items found</p>
    <Button onClick={onAdd} className={commonStyles.buttonPrimary}>Add Item</Button>
  </div>
)}
```

By following these guidelines, we ensure a consistent user experience across all pages of the application. 