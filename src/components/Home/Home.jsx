import React from 'react';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import SearchBar from '../SearchBar/SearchBar';

const Home = () => {
  return (
    <ScreenContainer>
      <div id="home">
        <SearchBar
          resultsPage="/venues/search"
          searchType="venues"
          placeholder="Search for a venue"
        />
      </div>
    </ScreenContainer>
  );
};

export default Home;
