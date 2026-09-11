'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'animate-pulse rounded-md bg-slate-200/80',
          className
        )
      )}
      {...props}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 8
}) => {
  return (
    <div className="w-full space-y-3 p-4">
      {/* Table Header Skeleton */}
      <div className="flex items-center gap-4 py-3 border-b border-slate-200">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`th-${i}`}
            className={`h-4 ${i === 0 ? 'w-10' : i === 1 ? 'w-32' : 'flex-1'}`}
          />
        ))}
      </div>

      {/* Table Rows Skeleton */}
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div
          key={`tr-${rIdx}`}
          className="flex items-center gap-4 py-3.5 border-b border-slate-100 last:border-0"
        >
          {Array.from({ length: columns }).map((_, cIdx) => (
            <Skeleton
              key={`td-${rIdx}-${cIdx}`}
              className={`h-4 ${
                cIdx === 0
                  ? 'w-10'
                  : cIdx === 1
                  ? 'w-36'
                  : cIdx === 2
                  ? 'w-24'
                  : cIdx === columns - 1
                  ? 'w-16'
                  : 'flex-1'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`card-skel-${i}`}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
};

