import { useState, useEffect } from "react";
import { ArrowLeft, User, Send, Check, X, Calendar, MessageCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store";
import { billboardApi } from "@/features/billboard/api";
import { BulletinListing } from "@/features/bulletin/types";

interface Application {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantAvatar?: string;
  applicationDate: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  applicantProfile?: {
    bio?: string;
    location?: string;
    verificationStatus?: 'verified' | 'unverified';
  };
}

export default function BillboardApplications() {
  const [listing, setListing] = useState<BulletinListing | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [invitationsSent, setInvitationsSent] = useState<Set<string>>(new Set());

  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user || !listingId) {
      navigate('/billboard');
      return;
    }

    loadData();
  }, [listingId, isAuthenticated, user, navigate]);

  const loadData = async () => {
    if (!listingId || !user) return;

    setIsLoading(true);
    try {
      // Load listing details
      const listingData = await billboardApi.getListing(listingId);

      // Check if user is the owner
      if (listingData.userId !== user.id) {
        navigate('/billboard');
        return;
      }

      setListing(listingData);

      // Load applications
      const applicationsData = await billboardApi.getApplications(listingId, user.id);

      // Mock data for now - replace with real API response
      const mockApplications: Application[] = [
        {
          id: "app1",
          applicantId: "user1",
          applicantName: "Maria Schmidt",
          applicantAvatar: "/avatars/maria.jpg",
          applicationDate: new Date().toISOString(),
          status: "pending",
          message: "Hi! I'm very interested in this property. I'm a quiet professional working in tech.",
          applicantProfile: {
            bio: "Software developer, non-smoker, looking for a long-term rental",
            location: "Berlin",
            verificationStatus: "verified"
          }
        },
        {
          id: "app2",
          applicantId: "user2",
          applicantName: "Thomas Müller",
          applicationDate: new Date(Date.now() - 3600000).toISOString(),
          status: "pending",
          message: "Hello, I would love to schedule a viewing for this apartment.",
          applicantProfile: {
            bio: "Marketing manager, clean and responsible tenant",
            location: "Berlin",
            verificationStatus: "verified"
          }
        },
        {
          id: "app3",
          applicantId: "user3",
          applicantName: "Sarah Johnson",
          applicationDate: new Date(Date.now() - 7200000).toISOString(),
          status: "accepted",
          applicantProfile: {
            bio: "Student at TU Berlin, looking for affordable housing",
            location: "Berlin",
            verificationStatus: "unverified"
          }
        }
      ];

      setApplications(mockApplications || applicationsData.applications);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    if (!user) return;

    try {
      await billboardApi.updateApplicationStatus(applicationId, status, user.id);

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status } : app
        )
      );

      alert(`Application ${status} successfully!`);
    } catch (err) {
      console.error('Failed to update application status:', err);
      alert('Failed to update application status');
    }
  };

  const handleSendInvitation = async (applicantId: string) => {
    if (!listingId || !user) return;

    // Check invitation limits
    if (listing?.maxInvitations && listing?.sentInvitations &&
        listing.sentInvitations >= listing.maxInvitations) {
      alert('You have reached the maximum number of invitations for this listing');
      return;
    }

    try {
      await billboardApi.sendInvitation(listingId, applicantId, user.id);

      // Update local state
      setInvitationsSent(prev => new Set([...prev, applicantId]));
      if (listing) {
        setListing(prev => prev ? { ...prev, sentInvitations: (prev.sentInvitations || 0) + 1 } : null);
      }

      alert('Invitation sent successfully!');
    } catch (err) {
      console.error('Failed to send invitation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send invitation';
      alert(errorMessage);
    }
  };

  const handleMessage = (applicantId: string, applicantName: string) => {
    // Navigate to messages or create new conversation
    navigate(`/messages/new?recipientId=${applicantId}&recipientName=${applicantName}&billboardId=${listingId}`);
  };

  if (!isAuthenticated) {
    return <div>Please log in to view applications</div>;
  }

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto bg-white min-h-screen">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto bg-white min-h-screen">
        <div className="p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/billboard')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Back to Billboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/billboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-lg font-semibold">Applications</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Listing Info */}
      {listing && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">{listing.title}</h2>
          <p className="text-sm text-gray-600 mt-1">{listing.description}</p>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>{applications.length} applications</span>
            {listing.maxInvitations && (
              <span>
                Invitations: {listing.sentInvitations || 0}/{listing.maxInvitations}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="divide-y divide-gray-200">
        {applications.length === 0 ? (
          <div className="text-center py-16 px-4">
            <User size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600">
              When users apply to your listing, they will appear here.
            </p>
          </div>
        ) : (
          applications.map((application) => (
            <div key={application.id} className="p-4">
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                {application.applicantAvatar ? (
                  <img
                    src={application.applicantAvatar}
                    alt={application.applicantName}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={20} className="text-gray-500" />
                  </div>
                )}

                {/* Application Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        {application.applicantName}
                        {application.applicantProfile?.verificationStatus === 'verified' && (
                          <Check size={16} className="text-green-500 ml-1" />
                        )}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Calendar size={12} className="mr-1" />
                        Applied {new Date(application.applicationDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        application.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : application.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {application.status}
                    </span>
                  </div>

                  {/* Application Message */}
                  {application.message && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{application.message}</p>
                    </div>
                  )}

                  {/* Applicant Profile */}
                  {application.applicantProfile && (
                    <div className="mt-2 text-sm text-gray-600">
                      {application.applicantProfile.bio && (
                        <p>{application.applicantProfile.bio}</p>
                      )}
                      {application.applicantProfile.location && (
                        <p className="mt-1">📍 {application.applicantProfile.location}</p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {application.status === 'pending' && (
                    <div className="mt-3 flex items-center space-x-2">
                      <button
                        onClick={() => handleApplicationStatus(application.id, 'accepted')}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                      >
                        <Check size={14} />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleApplicationStatus(application.id, 'rejected')}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                      >
                        <X size={14} />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleMessage(application.applicantId, application.applicantName)}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                      >
                        <MessageCircle size={14} />
                        <span>Message</span>
                      </button>
                    </div>
                  )}

                  {/* Invitation Button */}
                  {application.status === 'accepted' && !invitationsSent.has(application.applicantId) && (
                    <div className="mt-3">
                      <button
                        onClick={() => handleSendInvitation(application.applicantId)}
                        disabled={listing?.maxInvitations && listing?.sentInvitations !== undefined &&
                                 listing.sentInvitations >= listing.maxInvitations}
                        className="flex items-center space-x-1 px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <Send size={14} />
                        <span>Send Invitation</span>
                      </button>
                    </div>
                  )}

                  {/* Invitation Sent */}
                  {invitationsSent.has(application.applicantId) && (
                    <div className="mt-3">
                      <span className="text-sm text-green-600 font-medium">✓ Invitation sent</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}