import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

import './SearchBar.scss';

const SearchBar = ({ placeholder, resultsPage, searchType, staticContext, ...props }) => {
  const [ query, setQuery ] = useState('');
  const [ redirect, setRedirect ] = useState(false);

  const handleChangeQuery = (event) => {
    event.preventDefault();
    const value = event.target.value;
    setRedirect(false);
    setQuery(value);

    return false;
  };

  const handleCheckEnterKey = (event) => {
    if (event.key === 'Enter') {
      handleSubmit(event);
    }

    return false;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (query.length > 0) {
      setRedirect(true);
    }

    return false;
  };

  useEffect(() => {
    const urlSegments = window.location.pathname.split('/');
    // Automatically sets the value of the search query if there is a search query value already in the URL.
    if (urlSegments[1] === searchType && urlSegments[2] === 'search' && urlSegments[3]) {
      setQuery(decodeURIComponent(urlSegments[3]));
    } else {
      setQuery('');
    }

    setRedirect(false);
  }, [searchType, props.history.location]);

  return (
    <div id="search-bar" {...props}>
      <input
        enterKeyHint="search"
        type="text"
        onChange={handleChangeQuery}
        onKeyDown={handleCheckEnterKey}
        placeholder={placeholder}
        value={query}
      />

      <span className="search-submit" onClick={handleSubmit} title="Search">
        <FontAwesomeIcon icon={faSearch} />
      </span>

      <button onClick={handleSubmit} type="submit" hidden={true}> Search </button>

      {
        redirect
          && <Redirect to={`${resultsPage}/${encodeURIComponent(query)}`} />
      }
    </div>
  );
};

export default withRouter(SearchBar);
