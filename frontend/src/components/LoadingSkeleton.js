import React from 'react';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const skeletons = {
    card: (
      <div className="bg-white rounded-2xl shadow-soft p-6 animate-pulse">
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-12 h-12 bg-neutral-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-neutral-200 rounded w-full"></div>
          <div className="h-3 bg-neutral-200 rounded w-5/6"></div>
        </div>
      </div>
    ),
    list: (
      <div className="bg-white rounded-xl shadow-soft p-4 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-neutral-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    ),
    stat: (
      <div className="bg-white rounded-2xl shadow-soft p-6 animate-pulse">
        <div className="w-12 h-12 bg-neutral-200 rounded-xl mb-4"></div>
        <div className="h-8 bg-neutral-200 rounded w-20 mb-2"></div>
        <div className="h-4 bg-neutral-200 rounded w-32"></div>
      </div>
    ),
    dashboard: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-soft p-6 animate-pulse">
              <div className="w-12 h-12 bg-neutral-200 rounded-xl mb-4"></div>
              <div className="h-8 bg-neutral-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-32"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-soft p-8">
          <div className="h-6 bg-neutral-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-neutral-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  };

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div key={index} className={count > 1 ? 'mb-4' : ''}>
          {skeletons[type] || skeletons.card}
        </div>
      ))}
    </>
  );
};

export default LoadingSkeleton;