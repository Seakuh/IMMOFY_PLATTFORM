import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, X, ArrowLeft, Loader, Plus } from "lucide-react";
import { billboardApi } from "@/features/billboard/api";
import { BulletinFormData } from "@/features/bulletin/types";
import { useAuthStore } from "@/features/auth/store";

export default function BillboardUpload() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<BulletinFormData>>({});
  const [userText, setUserText] = useState<string>("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxImages = 5;

    // Check if adding these files would exceed the limit
    if (imageFiles.length + files.length > maxImages) {
      setError(`You can upload a maximum of ${maxImages} images`);
      return;
    }

    for (const file of files) {
      if (file.size > maxFileSize) {
        setError('Each image must be smaller than 10MB');
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, PNG and WebP images are supported');
        return;
      }
    }

    setError('');

    // Add new files to existing files
    const newImageFiles = [...imageFiles, ...files];
    setImageFiles(newImageFiles);

    // Create previews for new files
    const newPreviews: string[] = [];
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          if (newPreviews.length === files.length) {
            setSelectedImages(prev => [...prev, ...newPreviews]);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (imageFiles.length === 0) {
      setError('Please select at least one image');
      return;
    }

    if (!formData.title?.trim()) {
      setError('Please enter a title');
      return;
    }

    setIsUploading(true);
    try {
      const _listing = await billboardApi.createListing({
        imageFiles,
        formData: {
          ...formData,
          content: userText,
          hashtags: hashtags
        },
        userId: user?.id,
      });

      // Navigate to the billboard feed or listing detail
      navigate('/billboard', {
        state: { message: 'Your listing has been created successfully!' }
      });
    } catch (err) {
      setError('Failed to create listing. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Extract hashtags from text
  const extractHashtags = (text: string): string[] => {
    const matches = text.match(/#[\w\u00c0-\u024f\u1e00-\u1eff]+/g);
    return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
  };

  // Handle text input with hashtag extraction
  const handleTextChange = (text: string) => {
    setUserText(text);
    const extractedHashtags = extractHashtags(text);
    setHashtags(extractedHashtags);
  };

  const removeImage = (index: number) => {
    const newSelectedImages = selectedImages.filter((_, i) => i !== index);
    const newImageFiles = imageFiles.filter((_, i) => i !== index);
    setSelectedImages(newSelectedImages);
    setImageFiles(newImageFiles);
  };

  const removeAllImages = () => {
    setSelectedImages([]);
    setImageFiles([]);
    setError('');
  };

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
          <h1 className="text-lg font-semibold">Upload to Billboard</h1>
          <button
            onClick={handleSubmit}
            disabled={imageFiles.length === 0 || !formData.title?.trim() || isUploading}
            className="text-blue-600 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Sharing...' : 'Share'}
          </button>
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
          {selectedImages.length > 0 ? (
            <div className="space-y-4">
              {/* Image Grid */}
              <div className="grid grid-cols-2 gap-3">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg shadow-md"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {/* Add More Button */}
                {imageFiles.length < 5 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors flex items-center justify-center"
                  >
                    <div className="text-center">
                      <Plus size={24} className="text-gray-400 mx-auto mb-1" />
                      <span className="text-xs text-gray-500">Add More</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {imageFiles.length}/5 images selected
                </span>
                <button
                  onClick={removeAllImages}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove All
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 cursor-pointer hover:border-gray-400 transition-colors"
            >
              <div className="text-center">
                <Camera size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Property Photos</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Upload up to 5 images of your property
                </p>
                <div className="bg-blue-600 text-white px-6 py-2 rounded-full inline-flex items-center space-x-2 hover:bg-blue-700 transition-colors">
                  <Upload size={16} />
                  <span>Choose Photos</span>
                </div>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* User Text Input with Hashtags */}
        {selectedImages.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💬 Add your text with hashtags
            </label>
            <textarea
              value={userText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Share something about this property... #WG #Berlin #möbliert"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {hashtags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Basic Form Fields */}
        {selectedImages.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <h3 className="font-medium text-gray-700">📝 Property Details</h3>

            {/* Title - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Beautiful 2-room apartment in Mitte"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                placeholder="Describe your property..."
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Location and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Berlin, Mitte"
                  value={formData.location || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (€)
                </label>
                <input
                  type="number"
                  placeholder="800"
                  value={formData.price || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Additional Settings */}
        {selectedImages.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <details className="group">
              <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                ⚙️ Additional Settings (Optional)
              </summary>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Available From
                    </label>
                    <input
                      type="date"
                      value={formData.availableFrom || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, availableFrom: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      value={formData.deadline || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Invitations (Default: 10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    placeholder="10"
                    value={formData.maxInvitations || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxInvitations: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Limit the number of invitations you can send to applicants
                  </p>
                </div>
              </div>
            </details>
          </div>
        )}

        {/* User Info Notice */}
        {!isAuthenticated && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600 text-sm">
              📝 Posting as anonymous user. 
              <button 
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-700 ml-1"
              >
                Login to manage your listings
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}