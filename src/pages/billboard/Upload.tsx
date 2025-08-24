import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, X, ArrowLeft, Loader } from "lucide-react";
import { billboardApi, AIAnalysisResponse } from "@/features/billboard/api";
import { BulletinFormData } from "@/features/billboard/types";
import { useAuthStore } from "@/features/auth/store";

export default function BillboardUpload() {
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse['analysis'] | null>(null);
  const [userOverrides, setUserOverrides] = useState<Partial<BulletinFormData>>({});
  const [error, setError] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        // Auto-analyze the image
        analyzeImage(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const analysis = await billboardApi.analyzeImage(file);
      if (analysis.success) {
        setAiAnalysis(analysis.analysis);
      } else {
        setError(analysis.message || 'Failed to analyze image');
      }
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      console.error('Image analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile || !aiAnalysis) {
      setError('Please select an image first');
      return;
    }

    setIsUploading(true);
    try {
      const listing = await billboardApi.createListing({
        imageFile,
        aiAnalysis,
        userOverrides,
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

  const removeImage = () => {
    setSelectedImage('');
    setImageFile(null);
    setAiAnalysis(null);
    setUserOverrides({});
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
            disabled={!imageFile || !aiAnalysis || isUploading}
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
          {selectedImage ? (
            <div className="relative">
              <img
                src={selectedImage}
                alt="Preview"
                className="w-full rounded-lg shadow-md"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center"
              >
                <X size={16} />
              </button>
              
              {/* Analysis Loading */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 flex items-center space-x-3">
                    <Loader className="animate-spin" size={20} />
                    <span className="text-sm">Analyzing image...</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 cursor-pointer hover:border-gray-400 transition-colors"
            >
              <div className="text-center">
                <Camera size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Property Photo</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Our AI will automatically analyze your image and extract property details
                </p>
                <div className="bg-blue-600 text-white px-6 py-2 rounded-full inline-flex items-center space-x-2 hover:bg-blue-700 transition-colors">
                  <Upload size={16} />
                  <span>Choose Photo</span>
                </div>
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* AI Analysis Results */}
        {aiAnalysis && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">🤖 AI Analysis Complete</h3>
            <div className="space-y-2 text-sm text-green-700">
              <p><strong>Title:</strong> {aiAnalysis.title}</p>
              <p><strong>Description:</strong> {aiAnalysis.description?.slice(0, 100)}...</p>
              {aiAnalysis.location && <p><strong>Location:</strong> {aiAnalysis.location}</p>}
              {aiAnalysis.estimatedPrice && <p><strong>Estimated Price:</strong> €{aiAnalysis.estimatedPrice}</p>}
              {aiAnalysis.rooms && <p><strong>Rooms:</strong> {aiAnalysis.rooms}</p>}
              {aiAnalysis.propertyType && <p><strong>Type:</strong> {aiAnalysis.propertyType}</p>}
            </div>
          </div>
        )}

        {/* Override Fields */}
        {aiAnalysis && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <details className="group">
              <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                ⚙️ Adjust Details (Optional)
              </summary>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder={aiAnalysis.title}
                    value={userOverrides.title || ''}
                    onChange={(e) => setUserOverrides(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder={aiAnalysis.description}
                    value={userOverrides.description || ''}
                    onChange={(e) => setUserOverrides(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
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
                      placeholder={aiAnalysis.location || 'Location'}
                      value={userOverrides.location || ''}
                      onChange={(e) => setUserOverrides(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (€)
                    </label>
                    <input
                      type="number"
                      placeholder={aiAnalysis.estimatedPrice?.toString() || 'Price'}
                      value={userOverrides.price || ''}
                      onChange={(e) => setUserOverrides(prev => ({ ...prev, price: Number(e.target.value) }))}
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
                    value={userOverrides.availableFrom || ''}
                    onChange={(e) => setUserOverrides(prev => ({ ...prev, availableFrom: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
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