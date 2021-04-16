import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

import './SearchBar.scss';

const SearchBar = (props) => {
  const [ query, setQuery ] = useState('');
  const [ redirect, setRedirect ] = useState(false);

  const handleChangeQuery = (event) => {
    const value = event.target.value;
    setRedirect(false);
    setQuery(value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setRedirect(true);
  };

  useEffect(() => {
    const urlSegments = window.location.pathname.split('/');
    if (urlSegments[1] === 'search' && urlSegments[2]) {
      setQuery(decodeURIComponent(urlSegments[2]));
    }
  }, []);

  return (
    <form id="search-bar" {...props}>
      <input
        type="text"
        onChange={handleChangeQuery}
        placeholder="Search for a song/artist"
        value={query}
      />

      <span className="search-submit" onClick={handleSubmit} title="Search">
        <FontAwesomeIcon icon={faSearch} />
      </span>

      <button onClick={handleSubmit} type="submit" hidden={true}> Search </button>

      {
        redirect
          && <Redirect to={`/search/${encodeURIComponent(query)}`} />
      }
    </form>
  );
};

export default SearchBar;
