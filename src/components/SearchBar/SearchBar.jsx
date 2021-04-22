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
    if (urlSegments[1] === searchType && urlSegments[2] === 'search' && urlSegments[3]) {
      setQuery(decodeURIComponent(urlSegments[3]));
    } else {
      setQuery('');
    }

    setRedirect(false);
  }, [searchType, props.history.location]);

  return (
    <form id="search-bar" {...props}>
      <input
        type="text"
        onChange={handleChangeQuery}
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
    </form>
  );
};

export default withRouter(SearchBar);
