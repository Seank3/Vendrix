import React from 'react'

const Skeleton = ({ className = '', style = {} }) => (
  <div
    className={`bg-gray-700 animate-pulse rounded ${className}`}
    style={style}
  />
)

const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton
        key={i}
        className="h-4"
        style={{ width: i === lines - 1 ? '60%' : '100%' }}
      />
    ))}
  </div>
)

const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className}`}>
    <Skeleton className="h-6 w-3/4 mb-4" />
    <SkeletonText lines={3} />
  </div>
)

const SkeletonTable = ({ rows = 5, cols = 4, className = '' }) => (
  <div className={`bg-gray-800 border border-gray-700 rounded-lg overflow-hidden ${className}`}>
    <div className="p-4 border-b border-gray-700">
      <Skeleton className="h-6 w-40" />
    </div>
    <div className="divide-y divide-gray-700">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex items-center p-4">
          {Array.from({ length: cols }, (_, colIndex) => (
            <div key={colIndex} className="flex-1 px-2">
              <Skeleton
                className="h-4"
                style={{ width: colIndex === 0 ? '80%' : '60%' }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
)

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable }