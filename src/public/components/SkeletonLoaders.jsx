import React from 'react';

export const CardSkeleton = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full animate-pulse">
            {/* Image placeholder */}
            <div className="h-48 bg-gray-200 w-full"></div>

            {/* Content placeholder */}
            <div className="p-5 flex-1 flex flex-col gap-4">
                {/* Category / Date area */}
                <div className="flex justify-between items-center">
                    <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>

                {/* Title area */}
                <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                    <div className="h-6 bg-gray-200 rounded w-4/5"></div>
                </div>

                {/* Excerpt area */}
                <div className="space-y-2 mt-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>

                {/* Footer area */}
                <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ListSkeleton = () => {
    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 animate-pulse w-full">
            <div className="w-20 h-20 rounded-lg bg-gray-200 flex-shrink-0"></div>
            <div className="flex-1 space-y-3 py-2">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            </div>
        </div>
    );
};
