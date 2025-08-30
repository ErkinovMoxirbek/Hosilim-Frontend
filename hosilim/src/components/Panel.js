import React from 'react';

const Panel = ({ title, children, headerButton }) => {
  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {headerButton}
      </div>
      <div className="panel-body">{children}</div>
    </div>
  );
};

export default Panel;