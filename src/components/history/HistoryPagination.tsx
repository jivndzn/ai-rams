
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface HistoryPaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const HistoryPagination = ({ currentPage, totalPages, setCurrentPage }: HistoryPaginationProps) => {
  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            isDisabled={currentPage === 1}
          />
        </PaginationItem>
        
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const pageNumber = i + 1;
          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink 
                isActive={currentPage === pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            isDisabled={currentPage === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default HistoryPagination;
