import { useState, useEffect } from 'react';
import { useSeekersStore } from '@/features/seekers/store';
import { Seeker } from '@/features/seekers/types';
import SwipeMode from '@/components/SwipeMode';
import Loader from '@/components/Loader';

export default function SwipeModePage() {
  const { seekers, isLoading, error, fetchSeekers } = useSeekersStore();
  const [availableSeekers, setAvailableSeekers] = useState<Seeker[]>([]);

  useEffect(() => {
    if (seekers.length === 0) {
      fetchSeekers();
    }
  }, [seekers.length, fetchSeekers]);

  useEffect(() => {
    // Filter out seekers that have already been swiped (you can extend this logic)
    setAvailableSeekers(seekers);
  }, [seekers]);

  const handleSwipeLeft = (seeker: Seeker) => {
    console.log('Swiped left on:', seeker.name);
    // You can track rejected profiles here if needed
  };

  const handleSwipeRight = (seeker: Seeker) => {
    console.log('Swiped right on:', seeker.name);
    // Profile is automatically added to favorites in the SwipeMode component
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Fehler beim Laden
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => fetchSeekers()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Swipe Mode
        </h1>
        <p className="text-gray-600">
          Wische nach links für "Pass" oder nach rechts für "Like"
        </p>
      </div>

      <SwipeMode
        seekers={availableSeekers}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
      />
    </div>
  );
}