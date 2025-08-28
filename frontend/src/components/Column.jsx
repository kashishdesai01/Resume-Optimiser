import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export const Column = ({ id, title, children }) => {
  const { setNodeRef } = useDroppable({ id });

  const applicationIds = React.Children.map(children, child => child.props.application._id) || [];

  return (
    <div className="w-80 flex-shrink-0 bg-gray-100 p-4 rounded-xl shadow-sm flex flex-col">
      <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">{title}</h2>
      <SortableContext items={applicationIds} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex-grow space-y-3 min-h-[100px]">
          {children}
        </div>
      </SortableContext>
    </div>
  );
};

