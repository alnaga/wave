import React from 'react';
import { useAppDispatch, useAppState } from '../../context/context';
import { queueSong } from '../../actions/spotify/spotifyActions';

const SearchResults = () => {
  const dispatch = useAppDispatch();
  const { searchResults, tokens } = useAppState();
  const { spotify } = tokens;

  const handleQueueSong = (song) => async () => {
    await queueSong(dispatch, spotify.accessToken, song.uri);
  };

  return (
    <div>
      {
        searchResults.length > 1 &&  searchResults.map((result) => {
          return (
            <div className="flex pointer" onClick={handleQueueSong(result)}>
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
