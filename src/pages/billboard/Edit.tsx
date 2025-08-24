import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, ArrowLeft, Loader, Trash2 } from "lucide-react";
import { billboardApi } from "@/features/billboard/api";
import { BulletinListing, BulletinFormData } from "@/features/bulletin/types";
import { useAuthStore } from "@/features/auth/store";

export default function BillboardEdit() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<BulletinListing | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<Partial<BulletinFormData>>({});
  const [error, setError] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  // Load listing data
  useEffect(() => {
    const loadListing = async () => {
      if (!id) return;
      
      try {
        const data = await billboardApi.getListing(id);
        setListing(data);
        setSelectedImage(data.images[0] || '');
        setFormData({
          title: data.title,
          description: data.description,
          location: data.location,
          price: data.price,
          availableFrom: data.availableFrom,
        });
      } catch (err) {
        setError('Failed to load listing');
        console.error('Load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadListing();
  }, [id]);

  // Check if user can edit
  const canEdit = !isAuthenticated || (listing && listing.userId === user?.id);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPEG, PNG and WebP images are supported');
      return;
    }

    setError('');
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSelectedImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async () => {
    if (!id || !listing) return;

    setIsUpdating(true);
    try {
      await billboardApi.updateListing(id, {
        imageFile: imageFile || undefined,
        updates: formData,
        userId: user?.id,
      });

      navigate('/billboard', { 
        state: { message: 'Your listing has been updated successfully!' } 
      });
    } catch (err) {
      setError('Failed to update listing. Please try again.');
      console.error('Update error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !listing) return;
    
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await billboardApi.deleteListing(id, user?.id);
      navigate('/billboard', { 
        state: { message: 'Your listing has been deleted successfully!' } 
      });
    } catch (err) {
      setError('Failed to delete listing. Please try again.');
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="animate-spin" size={24} />
          <span>Loading listing...</span>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Listing not found</h2>
          <button
            onClick={() => navigate('/billboard')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Billboard
          </button>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access denied</h2>
          <p className="text-gray-600 mb-4">You can only edit your own listings</p>
          <button
            onClick={() => navigate('/billboard')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Billboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between p-4 max-w-lg mx-auto">
          <button
            onClick={() => navigate('/billboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-lg font-semibold">Edit Listing</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isDeleting ? <Loader className="animate-spin" size={16} /> : <Trash2 size={16} />}
            </button>
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="text-blue-600 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Image Upload */}
        <div className="space-y-4">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Listing preview"
              className="w-full rounded-lg shadow-md"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-80"
            >
              <Camera size={16} />
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <p className="text-sm text-gray-600 text-center">
            Tap the camera icon to change the image
          </p>
        </div>

        {/* Form Fields */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData((prev: BulletinFormData) => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData((prev: BulletinFormData) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData((prev: BulletinFormData) => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (€)
              </label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData((prev: BulletinFormData) => ({ ...prev, price: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Available From
            </label>
            <input
              type="date"
              value={formData.availableFrom || ''}
              onChange={(e) => setFormData((prev: BulletinFormData) => ({ ...prev, availableFrom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Listing Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-700 mb-2">Listing Stats</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Views: {listing.views}</p>
            <p>Interested: {listing.interested_count}</p>
            <p>Created: {new Date(listing.createdAt).toLocaleDateString()}</p>
            <p>Updated: {new Date(listing.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}