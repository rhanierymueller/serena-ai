import React from 'react';
import { Search, Filter } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchPlaceholder?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterLabel?: string;
  className?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filterValue,
  onFilterChange,
  filterOptions = [],
  filterLabel = 'Filtrar',
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}><div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full bg-black/50 border border-white/20 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-[#6DAEDB] focus:outline-none focus:ring-2 focus:ring-[#6DAEDB]/20 transition-all"
        />
      </div>{filterOptions.length > 0 && onFilterChange && (
        <div className="relative">
          <select
            value={filterValue}
            onChange={e => onFilterChange(e.target.value)}
            className="bg-black/50 border border-white/20 rounded-xl px-4 py-2 pr-8 text-white focus:border-[#6DAEDB] focus:outline-none focus:ring-2 focus:ring-[#6DAEDB]/20 transition-all appearance-none cursor-pointer"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
        </div>
      )}
    </div>
  );
};

export default SearchFilter;