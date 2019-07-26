import React from 'react';

export const debug = (json, level = 0) => {
  let jsx = [];

  for (let node in json) {
    if (typeof json[node] === 'object') {
      jsx.push(<p style={{marginLeft: `${level * 5}px`}}>{node}:</p>);
      jsx.push(debug(json[node], level + 1));
    } else {
      jsx.push(<p style={{marginLeft: `${level * 5}px`}}>{node}: {json[node]}</p>);
    }
  }

  return level === 0 ? (<div>{jsx}</div>) : jsx;
};
