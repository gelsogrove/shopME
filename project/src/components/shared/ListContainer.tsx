import React, { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface ListContainerProps {
  title: string;
  onAdd?: () => void;
  children: ReactNode;
}

export function ListContainer({ title, onAdd, children }: ListContainerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        
        <div className="flex items-center gap-4">
          <input
            type="search"
            placeholder="Search"
            className="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {onAdd && (
            <Button onClick={onAdd} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-5 w-5 mr-2" />
              Add
            </Button>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}