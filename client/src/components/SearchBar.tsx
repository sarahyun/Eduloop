import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Zap } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const suggestions = [
    "Urban business schools with D1 baseball",
    "Engineering programs with co-op opportunities", 
    "Small colleges with vibrant arts communities",
    "International programs in environmental science"
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Discover Your Perfect College</h2>
        <div className="flex items-center text-sm text-gray-500">
          <Zap className="w-4 h-4 mr-1 text-warning" />
          AI-Powered
        </div>
      </div>
      
      {/* Smart Search Bar */}
      <form onSubmit={handleSubmit} className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Try: 'liberal arts college with strong fashion scene and Latinx community'"
          className="w-full pl-10 pr-16 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-500 h-14"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <Button 
            type="submit" 
            size="sm"
            className="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark transition-colors"
            disabled={isLoading || !query.trim()}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {/* Search Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            className="text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 h-auto justify-start"
            onClick={() => {
              setQuery(suggestion);
              onSearch(suggestion);
            }}
          >
            <Search className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
            <span className="text-sm text-gray-700 truncate">{suggestion}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
