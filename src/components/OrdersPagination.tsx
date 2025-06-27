import React from 'react';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';

type Props = {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  hasMore: boolean;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLoadMore: () => void;
};

const OrdersPagination: React.FC<Props> = ({
  currentPage,
  totalCount,
  pageSize,
  hasMore,
  isLoading,
  onPageChange,
  onLoadMore
}) => {
  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalCount);
  const endItem = Math.min(currentPage * pageSize, totalCount);
  
  return (
    <div className="mt-8">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="text-sm text-gray-500 mb-4 md:mb-0">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalCount}</span> orders
        </div>
        
        <div className="flex justify-center space-x-2">
          {hasMore && (
            <button
              onClick={onLoadMore}
              disabled={isLoading}
              className="bg-blue-50 text-blue-600 border border-blue-200 px-6 py-2 rounded-lg hover:bg-blue-100 disabled:opacity-50 flex items-center transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Load More
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPagination;