import React, { useEffect, useState } from 'react';

const Search = (props) => {
  const { onSubmit } = props;
  const [ query, setQuery ] = useState('');

  const handleChangeQuery = (event) => {
    const value = event.target.value;
    setQuery(value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(query);
  };

  return (
    <form>
      <input type="text" onChange={handleChangeQuery} placeholder="Enter a song or artist name" />
      <button onClick={handleSubmit} type="submit"> Search </button>
    </form>
  );
};

export default Search;