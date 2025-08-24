import { logButtonClicked } from "@/lib/logger";
import { AlertCircle, ArrowLeft, ArrowRight, Camera, Check, Euro, Home, Loader, MapPin, Plus, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCreateProperty } from "../features/properties/hooks";
import { PropertyFormData } from "../features/properties/types";

interface CreatePropertyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (property: any) => void;
}

type Step = "basic" | "details" | "features" | "images";

export default function CreatePropertyDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreatePropertyDialogProps) {
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    price: 0,
    location: "",
    rooms: 1,
    size: 0,
    images: [],
    features: [],
  });
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  // const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps: Step[] = ["basic", "details", "features", "images"];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const { createWithImages, error, reset, isLoading, isError, isSuccess } = useCreateProperty();

  // Auto-close nach erfolgreichem Submit
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        handleClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleNext = () => {
    logButtonClicked("property_dialog_next", `step_${currentStep}`);
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    logButtonClicked("property_dialog_back", `step_${currentStep}`);
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    // Filter nur Bild-Dateien
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;

    setImages((prev) => [...prev, ...imageFiles]);
    const newPreviewUrls = imageFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  // Drag & Drop Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feature),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    logButtonClicked('create_property_submit', 'property_dialog');
    setSubmitStatus('submitting');

    try {
      console.log('🏠 Erstelle Inserat mit Daten:', {
        ...formData,
        imageCount: images.length
      });

      // Verwende die neue createWithImages API
      const property = await createWithImages(formData, images);

      if (property) {
        setSubmitStatus('success');
        console.log('✅ Inserat erfolgreich erstellt:', property);
        onSuccess?.(property);
        
        // Dialog wird automatisch nach 2s geschlossen (useEffect)
      } else {
        throw new Error('Inserat konnte nicht erstellt werden');
      }
    } catch (err) {
      setSubmitStatus('error');
      console.error("❌ Fehler beim Erstellen des Inserats:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: 0,
      location: "",
      rooms: 1,
      size: 0,
      images: [],
      features: [],
    });
    setImages([]);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setNewFeature("");
    setSubmitStatus('idle');
    reset(); // Reset hook state
  };

  const handleClose = () => {
    logButtonClicked('create_property_close', 'property_dialog');
    resetForm();
    setCurrentStep("basic");
    onClose();
  };

  const canProceed = () => {
    switch (currentStep) {
      case "basic":
        return formData.title.trim().length > 0 && formData.price > 0;
      case "details":
        return formData.location.trim().length > 0 && formData.rooms > 0;
      case "features":
        return true; // Features are optional
      case "images":
        return true; // Images are optional
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "basic":
        return (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel *
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="z.B. Moderne 3-Zimmer-Wohnung"
                  required
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preis (€) *
              </label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: Number(e.target.value),
                    }))
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="1200"
                  required
                />
              </div>
            </div>
          </div>
        );
      
      case "details":
        return (
          <div className="space-y-6">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Standort *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="z.B. Berlin Mitte"
                  required
                />
              </div>
            </div>

            {/* Rooms & Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zimmer *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.rooms}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rooms: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Größe (m²)
                </label>
                <input
                  type="number"
                  value={formData.size || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      size: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="85"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Beschreiben Sie Ihre Immobilie..."
              />
            </div>
          </div>
        );

      case "features":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Ausstattung hinzufügen</h3>
            
            {/* Add Feature */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Neue Ausstattung
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="z.B. Balkon, Einbauküche, Parkett"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  disabled={!newFeature.trim()}
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Features List */}
            {formData.features.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hinzugefügte Ausstattung
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <span className="text-gray-900">{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(feature)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "images":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Bilder hochladen</h3>
            
            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                isDragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }`}
            >
              <Camera className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">
                Bilder hier ablegen oder klicken
              </span>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Preview Images */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="absolute right-6 top-6 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
          <div className="pr-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Neues Inserat erstellen
            </h2>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Schritt {currentStepIndex + 1} von {steps.length}
            </p>
            {isLoading && (
              <p className="text-sm text-blue-600 mt-1">Wird gespeichert...</p>
            )}
            {isSuccess && (
              <p className="text-sm text-green-600 mt-1">✓ Erfolgreich erstellt!</p>
            )}
            {isError && (
              <p className="text-sm text-red-600 mt-1">Fehler beim Speichern</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(90vh-80px)]">
          <div className="flex-1 overflow-y-auto p-6">
            {renderStepContent()}
          </div>
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="z.B. Moderne 3-Zimmer-Wohnung"
                  required
                />
              </div>
            </div>

            {/* Price & Rooms */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preis (€)
                </label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: Number(e.target.value),
                      }))
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="1200"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zimmer
                </label>
                <select
                  value={formData.rooms}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rooms: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} Zimmer
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location & Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standort
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Berlin, Mitte"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Größe (m²)
                </label>
                <input
                  type="number"
                  value={formData.size || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      size: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="85"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Beschreiben Sie Ihre Immobilie..."
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bilder
              </label>
              <div className="space-y-4">
                {/* Drag & Drop Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer group ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {isDragOver ? (
                    <>
                      <Upload className="w-8 h-8 text-blue-500 mb-2 animate-bounce" />
                      <span className="text-sm text-blue-600 font-medium">
                        Bilder hier ablegen
                      </span>
                      <span className="text-xs text-blue-400 mt-1">Loslassen zum Hochladen</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-gray-400 group-hover:text-gray-600 mb-2 transition-colors" />
                      <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                        Bilder auswählen oder hierher ziehen
                      </span>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ausstattung
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addFeature())
                    }
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ausstattung hinzufügen"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(feature)}
                          className="w-4 h-4 hover:bg-blue-200 rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Status Messages */}
            {isError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 font-medium text-sm">Fehler beim Erstellen des Inserats</p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                    <button
                      onClick={() => reset()}
                      className="text-red-600 hover:text-red-700 text-sm underline mt-2"
                    >
                      Erneut versuchen
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {isSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-green-800 font-medium text-sm">Inserat erfolgreich erstellt!</p>
                    <p className="text-green-600 text-sm mt-1">Das Fenster schließt sich automatisch...</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex gap-3">
              {currentStep !== "basic" && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Zurück
                </button>
              )}
              
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSuccess ? "Schließen" : "Abbrechen"}
              </button>
              
              {currentStep !== "images" ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed() || isLoading}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Weiter
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e)}
                  disabled={isLoading || isSuccess}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Erstelle...
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Erstellt!
                    </>
                  ) : (
                    "Inserat erstellen"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
