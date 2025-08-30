import React from 'react';

const Table = ({ headers, rows }) => {
  return (
    <div className="table-container">
      <table className="min-w-full">
        <thead>
          <tr>
            {headers.map((header, idx) => <th key={idx}>{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {row.map((cell, cellIdx) => <td key={cellIdx}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;