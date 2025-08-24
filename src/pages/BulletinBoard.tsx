import { useState } from "react";
import { Camera, Plus, Upload, X } from "lucide-react";
import { BulletinListing, BulletinFormData } from "@/features/bulletin/types";

export default function BulletinBoard() {
  const [isCreating, setIsCreating] = useState(false);
  const [listings, setListings] = useState<BulletinListing[]>([]);
  const [newListing, setNewListing] = useState<Partial<BulletinFormData>>({
    title: "",
    description: "",
    availableFrom: "",
    images: [] as string[]
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setNewListing(prev => ({
              ...prev,
              images: [...prev.images, e.target!.result as string]
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setNewListing(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const listing: BulletinListing = {
      id: Date.now().toString(),
      title: newListing.title || "",
      description: newListing.description || "",
      availableFrom: newListing.availableFrom || "",
      images: (newListing.images as string[]) || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      views: 0,
      interested_count: 0,
      ...newListing
    };
    setListings(prev => [listing, ...prev]);
    setNewListing({ title: "", description: "", availableFrom: "", images: [] });
    setIsCreating(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulletin Board</h1>
          <p className="text-gray-600">Share your listings like a digital bulletin board</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>New Listing</span>
        </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Create New Listing</h2>
            <button
              onClick={() => setIsCreating(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={newListing.title}
                onChange={(e) => setNewListing(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Beautiful 2-room apartment in Mitte"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={newListing.description}
                onChange={(e) => setNewListing(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Describe your listing..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available From *
              </label>
              <input
                type="date"
                value={newListing.availableFrom}
                onChange={(e) => setNewListing(prev => ({ ...prev, availableFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photos
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload size={32} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload images</p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 10MB each</p>
                </label>
              </div>

              {/* Image Preview */}
              {newListing.images.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {newListing.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Listing
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <div className="text-center py-12">
          <Camera size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
          <p className="text-gray-600">Create your first bulletin board listing to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {listing.images.length > 0 && (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{listing.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{listing.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Available: {new Date(listing.availableFrom).toLocaleDateString()}</span>
                  <span>{listing.images.length} photos</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}