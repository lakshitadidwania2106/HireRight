import React, { useState } from 'react';
import {
  User,
  Code,
  Target,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  Plus,
  Trophy,
  Sparkles,
  Clock,
  Settings,
  MessageSquare,
  Brain,
  Users,
  Star,
  Zap,
  BookOpen,
  ArrowLeft
} from 'lucide-react';

const STEPS = [
  { id: 1, title: "Basic Info", icon: User },
  { id: 2, title: "Preferences", icon: Settings },
  { id: 3, title: "Learning Goals", icon: Target },
  { id: 4, title: "Complete", icon: CheckCircle2 }
];

const INTERVIEW_TYPES = [
  { id: "technical", label: "Technical Coding", icon: Code },
  { id: "system-design", label: "System Design", icon: Settings },
  { id: "behavioral", label: "Behavioral/HR", icon: MessageSquare },
  { id: "ai-mock", label: "Mock AI Interviews", icon: Brain }
];

const PROGRAMMING_LANGUAGES = [
  "JavaScript", "Python", "Java", "C++", "TypeScript", "Go", 
  "Rust", "C#", "Ruby", "PHP", "Swift", "Kotlin"
];

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "E-commerce", "Gaming",
  "Fintech", "Social Media", "Cloud Computing", "AI/ML", "Cybersecurity"
];

const IMPROVEMENT_AREAS = [
  { id: "algorithms", label: "Algorithms & Data Structures", icon: Code },
  { id: "system-design", label: "System Design", icon: Settings },
  { id: "communication", label: "Communication Skills", icon: MessageSquare },
  { id: "problem-solving", label: "Problem Solving", icon: Brain },
  { id: "confidence", label: "Interview Confidence", icon: Star },
  { id: "speed", label: "Coding Speed", icon: Zap },
  { id: "debugging", label: "Debugging Skills", icon: Settings },
  { id: "leadership", label: "Leadership Questions", icon: Users }
];

export default function ProfileSetupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    profilePicture: null,
    displayName: "",
    location: "",
    bio: "",
    experienceLevel: 1,
    interviewTypes: [],
    programmingLanguages: [],
    industryFocus: "",
    targetCompanies: [],
    timelineGoal: "",
    weeklyCommitment: 5,
    improvementAreas: []
  });
  const [newCompany, setNewCompany] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
    if (currentStep === 3) {
      setShowConfetti(true);
      // Auto hide confetti after 2 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 2000);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      setFormData({ ...formData, profilePicture: file });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const toggleSelection = (array, item) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const addCompany = () => {
    if (newCompany.trim() && !formData.targetCompanies.includes(newCompany.trim())) {
      setFormData({
        ...formData,
        targetCompanies: [...formData.targetCompanies, newCompany.trim()]
      });
      setNewCompany("");
    }
  };

  const removeCompany = (company) => {
    setFormData({
      ...formData,
      targetCompanies: formData.targetCompanies.filter(c => c !== company)
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center space-y-4">
              <label className="text-lg font-semibold text-gray-700">Profile Picture</label>
              <div
                className={`relative w-32 h-32 border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer transition-all ${
                  dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                {formData.profilePicture ? (
                  <img
                    src={URL.createObjectURL(formData.profilePicture)}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-500 hover:text-purple-600 transition-colors">
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-sm">Upload Photo</span>
                  </div>
                )}
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Display Name</label>
              <input
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="How should we call you?"
                className="input-field"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Location/Timezone</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input-field"
              >
                <option value="">Select your timezone</option>
                <option value="UTC-8">Pacific Time (UTC-8)</option>
                <option value="UTC-7">Mountain Time (UTC-7)</option>
                <option value="UTC-6">Central Time (UTC-6)</option>
                <option value="UTC-5">Eastern Time (UTC-5)</option>
                <option value="UTC+0">GMT (UTC+0)</option>
                <option value="UTC+1">CET (UTC+1)</option>
                <option value="UTC+8">CST (UTC+8)</option>
              </select>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Brief Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us a bit about yourself..."
                className="input-field min-h-[100px] resize-none"
              />
            </div>

            {/* Experience Level */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">Experience Level</label>
              <div className="px-4">
                <input
                  type="range"
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: parseInt(e.target.value) })}
                  max="3"
                  min="1"
                  step="1"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Beginner</span>
                  <span>Intermediate</span>
                  <span>Advanced</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Interview Types */}
            <div className="space-y-4">
              <label className="text-lg font-semibold text-gray-700">Interview Types</label>
              <div className="grid grid-cols-2 gap-3">
                {INTERVIEW_TYPES.map((type) => {
                  const isSelected = formData.interviewTypes.includes(type.id);
                  return (
                    <div
                      key={type.id}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-105 ${
                        isSelected 
                          ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700' 
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setFormData({
                        ...formData,
                        interviewTypes: toggleSelection(formData.interviewTypes, type.id)
                      })}
                    >
                      <div className="flex items-center space-x-3">
                        <type.icon className="w-5 h-5" />
                        <span className="font-medium">{type.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Programming Languages */}
            <div className="space-y-4">
              <label className="text-lg font-semibold text-gray-700">Programming Languages</label>
              <div className="flex flex-wrap gap-2">
                {PROGRAMMING_LANGUAGES.map((lang) => {
                  const isSelected = formData.programmingLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      onClick={() => setFormData({
                        ...formData,
                        programmingLanguages: toggleSelection(formData.programmingLanguages, lang)
                      })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Industry Focus */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Industry Focus</label>
              <select
                value={formData.industryFocus}
                onChange={(e) => setFormData({ ...formData, industryFocus: e.target.value })}
                className="input-field"
              >
                <option value="">Select your target industry</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Target Companies */}
            <div className="space-y-4">
              <label className="text-lg font-semibold text-gray-700">Target Companies</label>
              <div className="flex space-x-2">
                <input
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="Add a company..."
                  className="input-field flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && addCompany()}
                />
                <button
                  onClick={addCompany}
                  className="btn-secondary px-4 py-2 rounded-lg flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.targetCompanies.map((company) => (
                  <div
                    key={company}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-3 py-1 rounded-full animate-scale-in"
                  >
                    <span className="text-sm font-medium">{company}</span>
                    <button
                      onClick={() => removeCompany(company)}
                      className="hover:bg-purple-200 rounded-full p-1 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Goal */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Timeline Goal</label>
              <select
                value={formData.timelineGoal}
                onChange={(e) => setFormData({ ...formData, timelineGoal: e.target.value })}
                className="input-field"
              >
                <option value="">When do you want to be interview-ready?</option>
                <option value="1-month">1 Month</option>
                <option value="3-months">3 Months</option>
                <option value="6-months">6 Months</option>
                <option value="1-year">1 Year</option>
              </select>
            </div>

            {/* Weekly Commitment */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">Weekly Time Commitment</label>
              <div className="px-4">
                <input
                  type="range"
                  value={formData.weeklyCommitment}
                  onChange={(e) => setFormData({ ...formData, weeklyCommitment: parseInt(e.target.value) })}
                  max="20"
                  min="1"
                  step="1"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>1 hour</span>
                  <span className="font-medium text-purple-600">{formData.weeklyCommitment} hours/week</span>
                  <span>20+ hours</span>
                </div>
              </div>
            </div>

            {/* Improvement Areas */}
            <div className="space-y-4">
              <label className="text-lg font-semibold text-gray-700">Areas for Improvement</label>
              <div className="grid grid-cols-2 gap-3">
                {IMPROVEMENT_AREAS.map((area) => {
                  const isSelected = formData.improvementAreas.includes(area.id);
                  return (
                    <div
                      key={area.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${
                        isSelected 
                          ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700' 
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      onClick={() => setFormData({
                        ...formData,
                        improvementAreas: toggleSelection(formData.improvementAreas, area.id)
                      })}
                    >
                      <div className="flex items-center space-x-2">
                        <area.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{area.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-8 animate-scale-in">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="w-12 h-12 text-white" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Profile Complete!
              </h2>
              <p className="text-gray-600 text-lg">
                Your personalized interview preparation journey is ready to begin!
              </p>
            </div>

            {/* Clean Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40 shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-sm text-gray-600 mb-1">Name</div>
                <div className="font-semibold text-gray-800">{formData.displayName || "Not set"}</div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40 shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <Code className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-sm text-gray-600 mb-1">Languages</div>
                <div className="font-semibold text-gray-800">{formData.programmingLanguages.length} selected</div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40 shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-sm text-gray-600 mb-1">Timeline</div>
                <div className="font-semibold text-gray-800">{formData.timelineGoal || "Not set"}</div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40 shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-sm text-gray-600 mb-1">Weekly Time</div>
                <div className="font-semibold text-gray-800">{formData.weeklyCommitment}h/week</div>
              </div>
            </div>

            <button className="btn-primary w-full py-4 text-lg">
              Start Learning Journey
              <Sparkles className="w-5 h-5 ml-2" />
            </button>

            {showConfetti && (
              <div className="fixed inset-0 pointer-events-none celebration-overlay">
                <div className="confetti-container">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div
                      key={i}
                      className="confetti-piece"
                      style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 0.5}s`,
                        backgroundColor: i % 2 === 0 ? '#8B5CF6' : '#3B82F6'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes confettiDrop {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }

        .celebration-overlay {
          animation: fadeOut 2s ease-in-out forwards;
        }

        .confetti-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: confettiDrop 2s linear forwards;
        }

        @keyframes fadeOut {
          0% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        .glassmorphic {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .input-field {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid rgba(229, 231, 235, 0.6);
          color: #374151;
          padding: 1rem 1.25rem;
          border-radius: 1rem;
          width: 100%;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 0.95rem;
        }
        
        .input-field:focus {
          outline: none;
          background: rgba(255, 255, 255, 1);
          border-color: #8B5CF6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
          transform: translateY(-1px);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #8B5CF6, #3B82F6);
          color: white;
          font-weight: 600;
          padding: 1rem 2rem;
          border-radius: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 1rem;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
        }
        
        .btn-primary:hover:not(:disabled) {
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.5);
          transform: translateY(-2px);
        }
        
        .btn-secondary {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(139, 92, 246, 0.3);
          color: #8B5CF6;
          font-weight: 500;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.9);
          border-color: #8B5CF6;
          transform: translateY(-1px);
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8B5CF6, #3B82F6);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
        }
      `}</style>

      {/* Subtle Background Elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-100/10 to-blue-100/10 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Navigation Icon */}
        <div className="absolute top-6 left-6">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 group"
            title="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700 group-hover:text-purple-600 transition-colors" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-center relative">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <React.Fragment key={step.id}>
                  {/* Step Circle */}
                  <div className="flex flex-col items-center relative z-10">
                    <div
                      className={`flex items-center justify-center w-14 h-14 rounded-full border-3 transition-all duration-500 ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 border-transparent text-white shadow-lg scale-110' 
                          : isActive
                          ? 'border-purple-500 bg-white text-purple-600 shadow-lg scale-110'
                          : 'border-gray-300 bg-white text-gray-400 shadow-sm'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-7 h-7" />
                      ) : (
                        <step.icon className="w-7 h-7" />
                      )}
                    </div>
                    
                    <div className="mt-3 text-center">
                      <div className={`font-semibold text-sm transition-colors duration-300 ${
                        isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        Step {step.id}
                      </div>
                      <div className={`text-xs mt-1 transition-colors duration-300 ${
                        isActive ? 'text-purple-500' : isCompleted ? 'text-green-500' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                  
                  {/* Connecting Line */}
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 relative mx-6">
                      <div className="h-0.5 bg-gray-200 absolute top-7 left-0 right-0"></div>
                      <div 
                        className={`h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 absolute top-7 left-0 transition-all duration-700 ease-out ${
                          isCompleted ? 'w-full' : 'w-0'
                        }`}
                      ></div>
                      
                      {/* Animated progress dot */}
                      {isCompleted && (
                        <div className="absolute top-6 right-0 w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Main Card */}
        <div className="max-w-2xl mx-auto glassmorphic rounded-3xl p-8">
          <div className="text-center pb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              {STEPS[currentStep - 1]?.title}
            </h1>
            <p className="text-gray-600">
              {currentStep === 1 && "Let's get to know you better"}
              {currentStep === 2 && "Tell us about your interview preferences"}
              {currentStep === 3 && "Set your learning goals and timeline"}
              {currentStep === 4 && "You're all set to begin your journey!"}
            </p>
          </div>

          <div className="px-2 pb-2">
            {renderStepContent()}

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="flex justify-between mt-8 pt-6">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    currentStep === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'btn-secondary hover:scale-105'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleNext}
                  className="btn-primary flex items-center space-x-2 px-6 py-3 hover:scale-105"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}