import { useState, useEffect } from "react";
import { Camera, Plus, User, Heart, MessageCircle, Edit, MoreHorizontal, MapPin, Calendar, Bookmark, Loader, Send } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { BulletinListing } from "@/features/bulletin/types";
import { billboardApi } from "@/features/billboard/api";
import { useAuthStore } from "@/features/auth/store";
import { useUserNotifications, useBillboardCreatorNotifications, useNotificationPermission } from "@/hooks/useWebSocket";
import ImageCarousel from "@/components/ImageCarousel";

export default function BulletinBoard() {
  const [listings, setListings] = useState<BulletinListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [applications, setApplications] = useState<Set<string>>(new Set());
  const [applicationCounts, setApplicationCounts] = useState<Map<string, number>>(new Map());
  
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Initialize WebSocket notifications
  useUserNotifications();
  useNotificationPermission();

  // Handle new applications for billboard creators
  useBillboardCreatorNotifications(
    (data) => {
      // Update application count for the specific billboard
      setApplicationCounts(prev => new Map([...prev, [data.billboardId, (prev.get(data.billboardId) || 0) + 1]]));

      // Show success message
      setMessage(`New application from ${data.applicantName}!`);
      setTimeout(() => setMessage(''), 5000);
    },
    (data) => {
      console.log('Application status updated:', data);
    }
  );

  // Load success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      // Clear the message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    }
  }, [location.state]);

  // Load all billboard listings
  useEffect(() => {
    const loadListings = async () => {
      try {
        const response = await billboardApi.getAllListings({
          sort: 'newest',
          limit: 50
        });
        setListings(response.listings);
      } catch (err) {
        setError('Failed to load listings');
        console.error('Load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadListings();
  }, []);

  const handleLike = async (listingId: string) => {
    if (!isAuthenticated) {
      alert('Login to like posts');
      return;
    }

    try {
      const result = await billboardApi.toggleLike(listingId, user!.id);
      // Update local state
      setListings(prev => prev.map(listing => 
        listing.id === listingId 
          ? { ...listing, interested_count: result.likeCount }
          : listing
      ));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleComment = (_listingId: string) => {
    if (!isAuthenticated) {
      alert('Login to comment on posts');
      return;
    }
    // Navigate to comments or open comment modal
    // TODO: Implement commenting system
  };

  const handleApply = async (listingId: string) => {
    if (!isAuthenticated) {
      alert('Login required to apply');
      return;
    }

    if (applications.has(listingId)) {
      alert('You have already applied to this listing');
      return;
    }

    try {
      const message = window.prompt('Kurze Nachricht an den Vermieter (optional):') || undefined;
      await billboardApi.applyToListing(listingId, user!.id, message);

      // Update local state optimistically
      setApplications(prev => new Set([...prev, listingId]));
      setApplicationCounts(prev => new Map([...prev, [listingId, (prev.get(listingId) || 0) + 1]]));

      alert('Bewerbung erfolgreich gesendet! Der Vermieter wurde benachrichtigt.');
    } catch (err) {
      console.error('Application error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit application';
      alert(errorMessage);
    }
  };

  const incrementViews = async (listingId: string) => {
    try {
      await billboardApi.incrementViews(listingId);
    } catch (err) {
      console.error('View increment error:', err);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-semibold text-gray-900">Billboard</h1>
          <Link
            to="/billboard/upload"
            className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
          >
            <Plus size={20} />
          </Link>
        </div>
      </div>

      {/* Success Message */}
      {message && (
        <div className="mx-4 mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 text-sm">{message}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-3">
            <Loader className="animate-spin" size={24} />
            <span className="text-gray-600">Loading listings...</span>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="pb-16">
        {!isLoading && listings.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Camera size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-4">Be the first to share a property photo on the billboard</p>
            <Link
              to="/billboard/upload"
              className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors inline-block"
            >
              📷 Upload First Photo
            </Link>
            <p className="text-xs text-gray-500 mt-2">
              Our AI will automatically analyze your image
            </p>
          </div>
        ) : (
          listings.map((listing) => (
            <article 
              key={listing.id} 
              className="border-b border-gray-100 pb-4 mb-4"
              onClick={() => incrementViews(listing.id)}
            >
              {/* Post Header */}
              <div className="flex items-center justify-between p-4 pb-3">
                <div className="flex items-center space-x-3">
                  {listing.userAvatar ? (
                    <img
                      src={listing.userAvatar}
                      alt={listing.userName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User size={16} className="text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{listing.userName || 'Anonymous'}</p>
                    {listing.location && (
                      <p className="text-gray-500 text-xs flex items-center">
                        <MapPin size={12} className="mr-1" />
                        {listing.location}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isAuthenticated && listing.userId === user?.id && (
                    <Link
                      to={`/billboard/edit/${listing.id}`}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Edit size={16} className="text-gray-600" />
                    </Link>
                  )}
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreHorizontal size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Post Images */}
              {listing.images && listing.images.length > 0 && (
                <ImageCarousel
                  images={listing.images}
                  title={listing.title}
                />
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between p-4 pt-3">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(listing.id);
                    }}
                    className="hover:text-red-500 transition-colors"
                  >
                    <Heart size={24} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleComment(listing.id);
                    }}
                    className="hover:text-gray-600 transition-colors"
                  >
                    <MessageCircle size={24} />
                  </button>
                  {/* Application Button - Only show if user is not the creator */}
                  {isAuthenticated && listing.userId !== user?.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(listing.id);
                      }}
                      disabled={applications.has(listing.id)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        applications.has(listing.id)
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      <Send size={16} />
                      <span>{applications.has(listing.id) ? 'Applied' : 'Apply'}</span>
                    </button>
                  )}
                </div>
                <button className="hover:text-gray-600 transition-colors">
                  <Bookmark size={24} />
                </button>
              </div>

              {/* Post Content */}
              <div className="px-4">
                <p className="font-semibold text-sm mb-1">{listing.title}</p>
                {listing.description && (
                  <p className="text-sm text-gray-700 mb-2">{listing.description}</p>
                )}

                {/* Display user content and hashtags */}
                {listing.content && (
                  <p className="text-sm text-gray-700 mb-2">{listing.content}</p>
                )}
                {listing.hashtags && listing.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {listing.hashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Show deadline if exists */}
                {listing.deadline && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-2">
                    <p className="text-xs text-orange-700 font-medium flex items-center">
                      <Calendar size={12} className="mr-1" />
                      Applications close: {new Date(listing.deadline).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  {listing.price && listing.price > 0 && (
                    <span className="font-semibold text-green-600">€{listing.price}</span>
                  )}
                  {listing.availableFrom && (
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      Available: {new Date(listing.availableFrom).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-4">
                    <span>{listing.views} views</span>
                    <span>{listing.interested_count} likes</span>
                    <span>{applicationCounts.get(listing.id) || 0} applications</span>
                  </div>
                </div>

                {/* Show applicant avatars if user is the creator */}
                {isAuthenticated && listing.userId === user?.id && applicationCounts.get(listing.id) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Recent applicants:</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex -space-x-2">
                          {/* Mock applicant avatars - replace with real data */}
                          {Array.from({ length: Math.min(applicationCounts.get(listing.id) || 0, 3) }).map((_, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center"
                            >
                              <User size={12} className="text-gray-600" />
                            </div>
                          ))}
                          {(applicationCounts.get(listing.id) || 0) > 3 && (
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full border-2 border-white flex items-center justify-center text-xs font-medium">
                              +{(applicationCounts.get(listing.id) || 0) - 3}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/billboard/${listing.id}/applications`);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View All
                        </button>
                      </div>
                    </div>
                    {/* Invitation Controls */}
                    {(listing.maxInvitations && listing.sentInvitations !== undefined) && (
                      <div className="mt-2 text-xs text-gray-500">
                        Invitations: {listing.sentInvitations}/{listing.maxInvitations} sent
                        {listing.sentInvitations >= listing.maxInvitations && (
                          <span className="text-orange-600 ml-1">(Limit reached)</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
