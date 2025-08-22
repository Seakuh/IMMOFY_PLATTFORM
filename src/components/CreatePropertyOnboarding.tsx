import { useOnboardingSubmission } from "@/features/onboarding/hooks";
import {
  logButtonClicked,
  logOnboardingAbandoned,
  logOnboardingCompleted,
  logOnboardingStarted,
  logOnboardingStepCompleted,
} from "@/lib/logger";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Loader,
  Mail,
  MessageSquare,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface OnboardingData {
  name?: string;
  prompt: string;
  images: File[];
  email: string;
}

interface CreatePropertyOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: OnboardingData) => void;
}

type Step = "welcome" | "name" | "prompt" | "images" | "email" | "complete";

export default function CreatePropertyOnboarding({
  isOpen,
  onClose,
  onComplete,
}: CreatePropertyOnboardingProps) {
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [formData, setFormData] = useState<OnboardingData>({
    name: "",
    prompt: "",
    images: [],
    email: "",
  });
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Onboarding Submission Hook
  const {
    submitOnboarding,
    status,
    result,
    error,
    isSubmitting,
    isSuccess,
    isError,
    reset,
  } = useOnboardingSubmission();

  const steps: Step[] = ["welcome", "name", "prompt", "images", "email", "complete"];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Log onboarding start when component mounts and is open
  useEffect(() => {
    if (isOpen && currentStep === "welcome") {
      logOnboardingStarted();
    }
  }, [isOpen]);

  // Log when user closes/abandons onboarding
  useEffect(() => {
    return () => {
      if (currentStep !== "complete" && currentStep !== "welcome") {
        logOnboardingAbandoned(currentStep, {
          progress: currentStepIndex + 1,
          partialData: {
            hasPrompt: formData.prompt.length > 0,
            hasImages: formData.images.length > 0,
            hasEmail: formData.email.length > 0,
          },
        });
      }
    };
  }, [currentStep, currentStepIndex, formData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    // Filter nur Bild-Dateien
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) return;

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...imageFiles],
    }));

    const newPreviewUrls = imageFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

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
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    // Log step completion before moving to next
    logOnboardingStepCompleted(currentStep, {
      stepIndex: currentStepIndex,
      stepData:
        currentStep === "prompt"
          ? { promptLength: formData.prompt.length }
          : currentStep === "images"
          ? { imageCount: formData.images.length }
          : currentStep === "email"
          ? { email: formData.email }
          : undefined,
    });

    logButtonClicked("onboarding_next", `step_${currentStep}`);

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    logButtonClicked("onboarding_back", `step_${currentStep}`);

    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleComplete = async () => {
    logOnboardingCompleted(formData);
    logButtonClicked("onboarding_complete", "final_step");

    try {
      // Sende Daten an den Server
      const result = await submitOnboarding(formData);

      if (result?.success) {
        // Erfolg - zeige Success-Screen
        console.log("🎉 Onboarding erfolgreich eingereicht:", result);
        onComplete?.(formData);

        // Warte kurz, dann schließe Dialog
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        // Fehler vom Server
        console.error("❌ Server-Fehler:", result?.message);
      }
    } catch (err) {
      console.error("❌ Fehler beim Einreichen:", err);
    }
  };

  const handleClose = () => {
    if (currentStep !== "complete") {
      logOnboardingAbandoned(currentStep, {
        progress: currentStepIndex + 1,
        partialData: {
          hasPrompt: formData.prompt.length > 0,
          hasImages: formData.images.length > 0,
          hasEmail: formData.email.length > 0,
        },
      });
    }

    logButtonClicked("onboarding_close", `step_${currentStep}`);

    // Cleanup
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setCurrentStep("welcome");
    setFormData({
      name: "",
      prompt: "",
      images: [],
      email: "",
    });
    reset(); // Reset submission state
    onClose();
  };

  const canProceed = () => {
    switch (currentStep) {
      case "welcome":
        return true;
      case "name":
        return true; // Name ist optional
      case "prompt":
        return formData.prompt.trim().length > 0;
      case "images":
        return true; // Bilder sind optional
      case "email":
        return formData.email.includes("@") && formData.email.includes(".");
      case "complete":
        return true;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <button
            onClick={handleClose}
            className="absolute right-6 top-6 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          <div className="pr-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Wohnungsgesuch erstellen
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
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {currentStep === "welcome" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Willkommen!
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Lass uns gemeinsam dein Wohnungsgesuch erstellen. Beschreibe was
                du suchst und wir helfen dir dabei, die perfekte Wohnung zu
                finden.
              </p>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  ✨ Es dauert nur wenige Minuten
                </p>
              </div>
            </div>
          )}

          {currentStep === "name" && (
            <div className="py-4">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Wie sollen wir dich nennen?
                </h3>
                <p className="text-gray-600">
                  Dein Name hilft Vermietern, dich persönlich anzusprechen. Du kannst auch einen Spitznamen verwenden.
                </p>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Dein Name (optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="z.B. Max, Anna, oder wie du genannt werden möchtest"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Tipp: Ein Name macht dein Gesuch persönlicher und sympathischer.
                </p>
              </div>
            </div>
          )}

          {currentStep === "prompt" && (
            <div className="py-4">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Beschreibe deine Wohnungssuche
                </h3>
                <p className="text-gray-600">
                  Erzähl uns, was für eine Wohnung du suchst. Sei so detailliert
                  wie möglich.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Deine Beschreibung *
                </label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, prompt: e.target.value }))
                  }
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="z.B. Suche 2-3 Zimmer Wohnung in Berlin Mitte oder Prenzlauer Berg, bis 1200€ warm, ab sofort oder März 2024, mit Balkon bevorzugt, bin ruhiger Student, Nichtraucher..."
                />
                <p className="text-xs text-gray-500">
                  Tipp: Je detaillierter, desto besser können wir dir helfen!
                </p>
              </div>
            </div>
          )}

          {currentStep === "images" && (
            <div className="py-4">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Bilder hinzufügen
                </h3>
                <p className="text-gray-600">
                  Bilder sind optional, aber sie helfen Vermietern dabei, dich
                  als Person kennenzulernen.
                </p>
              </div>

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
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {isDragOver ? (
                    <>
                      <Camera className="w-8 h-8 text-blue-500 mb-2 animate-bounce" />
                      <span className="text-sm text-blue-600 font-medium">
                        Bilder hier ablegen
                      </span>
                      <span className="text-xs text-blue-400 mt-1">
                        Loslassen zum Hochladen
                      </span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-gray-400 group-hover:text-gray-600 mb-2 transition-colors" />
                      <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                        Bilder von dir auswählen oder hierher ziehen
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        (optional - z.B. ein Foto von dir)
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
                  <div className="grid grid-cols-2 gap-3">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Vorschau ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
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
          )}

          {currentStep === "email" && (
            <div className="py-4">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Kontakt-E-Mail
                </h3>
                <p className="text-gray-600">
                  Damit Vermieter dich für passende Wohnungen kontaktieren
                  können.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  E-Mail Adresse *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="deine-email@beispiel.de"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Wir verwenden deine E-Mail nur für Wohnungsangebote, die zu
                  deinem Gesuch passen.
                </p>
              </div>
            </div>
          )}

          {currentStep === "complete" && (
            <div className="text-center py-8">
              {isSubmitting ? (
                // Loading State
                <>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Einen Moment...
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Wir senden deine Daten an unseren Server und erstellen dein
                    Inserat.
                  </p>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                      <span className="text-sm text-blue-800">
                        Wird verarbeitet...
                      </span>
                    </div>
                  </div>
                </>
              ) : isError ? (
                // Error State
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Ups, etwas ist schiefgelaufen
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Beim Senden deiner Daten ist ein Fehler aufgetreten. Bitte
                    versuche es erneut.
                  </p>
                  <div className="bg-red-50 rounded-xl p-4 space-y-2">
                    <p className="text-sm text-red-800">
                      Fehler: {error || "Unbekannter Fehler"}
                    </p>
                    <button
                      onClick={() => {
                        reset();
                        handleComplete();
                      }}
                      className="text-sm text-red-600 hover:text-red-700 underline"
                    >
                      Erneut versuchen
                    </button>
                  </div>
                </>
              ) : isSuccess ? (
                // Success State
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Perfekt!
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Dein Wohnungsgesuch wurde erfolgreich eingereicht. Wir
                    informieren Vermieter über deine Suche.
                  </p>
                  <div className="bg-green-50 rounded-xl p-4 space-y-2">
                    <p className="text-sm text-green-800 font-medium">
                      ✓ Beschreibung: {formData.prompt.slice(0, 50)}...
                    </p>
                    <p className="text-sm text-green-800 font-medium">
                      ✓ Bilder: {formData.images.length} hochgeladen
                    </p>
                    <p className="text-sm text-green-800 font-medium">
                      ✓ Kontakt: {formData.email}
                    </p>
                    {result?.submissionId && (
                      <p className="text-xs text-green-600 mt-2">
                        Referenz-ID: {result.submissionId}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                // Initial Complete State (before submission)
                <>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Bereit zum Absenden!
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Alle Informationen sind vollständig. Klicke auf "Absenden"
                    um dein Wohnungsgesuch zu veröffentlichen.
                  </p>
                  <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                    <p className="text-sm text-blue-800 font-medium">
                      ✓ Beschreibung: {formData.prompt.slice(0, 50)}...
                    </p>
                    <p className="text-sm text-blue-800 font-medium">
                      ✓ Bilder: {formData.images.length} Dateien
                    </p>
                    <p className="text-sm text-blue-800 font-medium">
                      ✓ Kontakt: {formData.email}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex gap-3">
            {currentStep !== "welcome" && currentStep !== "complete" && (
              <button
                onClick={handleBack}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Zurück
              </button>
            )}

            <div className="flex-1" />

            {currentStep === "complete" ? (
              !isSuccess ? (
                <button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Sende...
                    </>
                  ) : (
                    "Jetzt absenden"
                  )}
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Schließen
                </button>
              )
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {currentStep === "welcome" ? "Los geht's" : "Weiter"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
