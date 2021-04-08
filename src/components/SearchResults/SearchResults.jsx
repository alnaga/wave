import React from 'react';
import { useAppState } from '../../context/context';

const SearchResults = () => {
  const { searchResults } = useAppState();

  return (
    <div>
      {
        searchResults.map((result) => {
          console.log(result);
          return (
            <div className="flex">
              <img src={result.album.images[0].url} width="60" />
              <span> {result.artists[0].name} - { result.name } </span>
            </div>
          );
        })
      }
    </div>
  );
};

export default SearchResults;
