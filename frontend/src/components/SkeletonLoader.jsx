import React from 'react';

const SkeletonLoader = ({ height = '20px', width = '100%', borderRadius = '8px', count = 1 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height, width, borderRadius }}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;
