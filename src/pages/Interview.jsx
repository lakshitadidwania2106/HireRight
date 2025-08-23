import React, { useState, useEffect } from "react";
import Header from '../components/ui/header';
import Footer from '../components/ui/footer';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Save,
  Eye,
  FileText,
  Code,
  Brain,
  Settings,
} from "lucide-react";
import { getAuthToken } from "../utils/handleToken";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// removed framer-motion; using CSS transitions instead

// ⚠️ Removed Header/Footer imports to fix previous build error.

// ====== ENV & API ======
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const baseUrl = "http://localhost:8000/api/";

// ====== UI PRIMITIVES ======
const PageShell = ({ children }) => (
  <div className="min-h-screen relative overflow-hidden bg-white">
    {/* Soft background gradients */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-purple-200 via-purple-100 to-blue-100 blur-3xl opacity-70" />
      <div className="absolute bottom-0 right-0 w-[34rem] h-[34rem] rounded-full bg-gradient-to-br from-indigo-200 via-purple-100 to-sky-100 blur-3xl opacity-70" />
    </div>
    <main className="relative z-10 container mx-auto px-4 py-10">{children}</main>
  </div>
);

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-purple-200 bg-white shadow-sm transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, title, right }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-6 h-6 text-purple-600" />}
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
    {right}
  </div>
);

const Field = ({ label, children, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 border-purple-200 ${props.className || ""}`}
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-400 border-purple-200 ${props.className || ""}`}
  />
);

const Badge = ({ children }) => (
  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
    {children}
  </span>
);

const GradientButton = ({ children, className = "", ...rest }) => (
  <button
    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white bg-gradient-to-r from-purple-500 to-blue-500 shadow-sm hover:shadow-md transition-transform duration-150 hover:scale-[1.03] active:scale-95 ${className}`}
    {...rest}
  >
    {children}
  </button>
);

// ====== TOAST-LIKE BANNER ======
const MessageNotification = ({ message, messageType, onClose }) => {
  if (!message) return null;
  const styles =
    messageType === "error"
      ? "bg-red-100 text-red-800 border-red-200"
      : messageType === "success"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-blue-100 text-blue-800 border-blue-200";
  return (
    <div
      className={`fixed top-6 right-6 z-50 border rounded-xl px-4 py-3 shadow transition-all duration-300 ${styles}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="text-sm opacity-70 hover:opacity-100">
          Close
        </button>
      </div>
    </div>
  );
};

// ====== STEP 1: Interview Setup ======
const InterviewSetup = ({ onNext, formData, setFormData }) => {
  const [errors, setErrors] = useState({});

  const setField = (key, val) => {
    setFormData((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.desc.trim()) e.desc = "Description is required";
    if (!formData.post.trim()) e.post = "Position is required";
    if (!formData.submissionDeadline) e.submissionDeadline = "Submission deadline is required";
    if (!formData.startTime) e.startTime = "Start time is required";
    if (!formData.endTime) e.endTime = "End time is required";
    if (!formData.duration || formData.duration <= 0) e.duration = "Valid duration is required";
    if (formData.DSA + formData.Dev !== 100) e.allocation = "DSA and Dev percentages must total 100%";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <Card className="p-6">
      <SectionTitle icon={Settings} title="Interview Setup" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Field label="Job Description" error={errors.desc}>
            <Textarea
              value={formData.desc}
              onChange={(e) => setField("desc", e.target.value)}
              placeholder="Enter job description..."
              rows={5}
            />
          </Field>
          <Field label="Position" error={errors.post}>
            <Input
              type="text"
              value={formData.post}
              onChange={(e) => setField("post", e.target.value)}
              placeholder="e.g., Backend Developer"
            />
          </Field>
          <Field label="Experience Required (years)">
            <Input
              type="number"
              value={formData.experience}
              onChange={(e) => setField("experience", parseInt(e.target.value) || 0)}
              min={0}
              max={40}
            />
          </Field>
        </div>
        <div className="space-y-4">
          <Field label="Submission Deadline" error={errors.submissionDeadline}>
            <Input
              type="datetime-local"
              value={formData.submissionDeadline}
              onChange={(e) => setField("submissionDeadline", e.target.value)}
            />
          </Field>
          <Field label="Interview Start Time" error={errors.startTime}>
            <Input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setField("startTime", e.target.value)}
            />
          </Field>
          <Field label="Interview End Time" error={errors.endTime}>
            <Input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setField("endTime", e.target.value)}
            />
          </Field>
          <Field label="Duration (minutes)" error={errors.duration}>
            <Input
              type="number"
              value={formData.duration}
              onChange={(e) => setField("duration", parseInt(e.target.value) || 0)}
              min={1}
              max={300}
            />
          </Field>
        </div>
      </div>

      {/* Allocation */}
      <div className="mt-6 p-4 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-purple-700">Question Allocation</h3>
          <Badge>Total: {formData.DSA + formData.Dev}%</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="DSA Questions (%)">
            <Input
              type="number"
              value={formData.DSA}
              onChange={(e) => setField("DSA", parseInt(e.target.value) || 0)}
              min={0}
              max={100}
            />
          </Field>
          <Field label="Development Questions (%)">
            <Input
              type="number"
              value={formData.Dev}
              onChange={(e) => setField("Dev", parseInt(e.target.value) || 0)}
              min={0}
              max={100}
            />
          </Field>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-400"
                checked={formData.ask_questions_on_resume}
                onChange={(e) => setField("ask_questions_on_resume", e.target.checked)}
              />
              <span className="text-sm text-gray-700">Ask questions on resume</span>
            </label>
          </div>
        </div>
        {errors.allocation && (
          <p className="text-sm text-red-600 mt-2 transition-opacity duration-300">
            {errors.allocation}
          </p>
        )}
      </div>

      <div className="flex justify-end mt-6">
        <GradientButton onClick={handleNext}>
          <span>Next: Questions</span>
          <ChevronRight className="w-4 h-4" />
        </GradientButton>
      </div>
    </Card>
  );
};

// ====== STEP 2: Questions Config (Dev + DSA) ======
const QuestionsConfig = ({ onNext, onBack, formData, setFormData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("dev");

  // --- Dev Questions ---
  const addQuestion = () =>
    setFormData((p) => ({ ...p, questions: [...p.questions, { question: "", answer: "" }] }));
  const removeQuestion = (idx) =>
    setFormData((p) => ({ ...p, questions: p.questions.filter((_, i) => i !== idx) }));
  const updateQuestion = (idx, key, val) =>
    setFormData((p) => ({
      ...p,
      questions: p.questions.map((q, i) => (i === idx ? { ...q, [key]: val } : q)),
    }));

  // --- DSA Topics ---
  const addDSA = () =>
    setFormData((p) => ({
      ...p,
      dsa_topics: [...p.dsa_topics, { topic: "", difficulty: "Medium", number_of_questions: 1 }],
    }));
  const removeDSA = (idx) =>
    setFormData((p) => ({ ...p, dsa_topics: p.dsa_topics.filter((_, i) => i !== idx) }));
  const updateDSA = (idx, key, val) =>
    setFormData((p) => ({
      ...p,
      dsa_topics: p.dsa_topics.map((t, i) => (i === idx ? { ...t, [key]: val } : t)),
    }));

  // --- Gemini Generation (kept logic) ---
  const generateQuestionsWithGemini = async () => {
    if (!GEMINI_API_KEY) {
      toast.error("Gemini API key not configured");
      return;
    }
    setIsGenerating(true);
    try {
      const existingQuestions = formData.questions.map((q) => q.question).join("\n");
      const prompt = `
Generate 1 new technical interview question for a ${formData.post} position with ${formData.experience} years of experience. 
Job description: ${formData.desc}. 

Do NOT repeat these questions:
${existingQuestions}

Return ONLY JSON array of objects with 'question' and 'answer' fields.

    Example format:
    [
      {
        "question": "What is the difference between let and var in JavaScript?",
        "answer": "let has block scope while var has function scope. let variables cannot be redeclared in the same scope."
      }
    ]`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      const data = await response.json();
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content)
        throw new Error("Invalid response format from Gemini API");

      const generatedText = data.candidates[0].content.parts[0].text;
      let cleanedText = generatedText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      let jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        const first = cleanedText.indexOf("[");
        const last = cleanedText.lastIndexOf("]");
        if (first !== -1 && last !== -1 && last > first) cleanedText = cleanedText.substring(first, last + 1);
      } else {
        cleanedText = jsonMatch[0];
      }

      try {
        const questions = JSON.parse(cleanedText);
        if (Array.isArray(questions) && questions.length > 0) {
          const valid = questions.filter(
            (q) => q && typeof q === "object" && typeof q.question === "string" && typeof q.answer === "string" && q.question.trim() && q.answer.trim()
          );
          if (valid.length > 0) {
            setFormData((p) => ({ ...p, questions: [...p.questions, ...valid.slice(0, 1)] }));
            toast.success("Successfully generated and added 1 question!");
          } else throw new Error("No valid questions found in response");
        } else throw new Error("Response is not a valid array of questions");
      } catch (err) {
        console.error("JSON parsing error:", err);
        console.error("Cleaned text:", cleanedText);
        throw new Error("Failed to parse generated questions. Please try again.");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error(`Failed to generate questions: ${error.message}. Please add them manually.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6">
      <SectionTitle
        icon={FileText}
        title="Questions Configuration"
        right={
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        }
      />

      {/* Tabs */}
      <div className="mb-6 p-1 bg-purple-50 border border-purple-200 rounded-xl inline-flex">
        <button
          onClick={() => setActiveTab("dev")}
          className={`px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 ${
            activeTab === "dev" ? "bg-white shadow border border-purple-200" : "text-gray-600"
          }`}
        >
          <Code className="w-4 h-4" /> Development
        </button>
        <button
          onClick={() => setActiveTab("dsa")}
          className={`px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 ml-1 ${
            activeTab === "dsa" ? "bg-white shadow border border-purple-200" : "text-gray-600"
          }`}
        >
          <Brain className="w-4 h-4" /> DSA Topics
        </button>
      </div>

      {/* Dev Tab */}
      {activeTab === "dev" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Development Questions ({formData.Dev}%)</h3>
            <div className="flex items-center gap-2">
              <GradientButton onClick={generateQuestionsWithGemini} disabled={isGenerating}>
                <Brain className="w-4 h-4" /> {isGenerating ? "Generating..." : "Generate with AI"}
              </GradientButton>
              <button
                onClick={addQuestion}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto pr-1 space-y-4">
            {formData.questions.map((q, i) => (
              <div key={i} className="p-4 rounded-xl border border-purple-200 bg-purple-50/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-700 font-medium">Question {i + 1}</span>
                  <button onClick={() => removeQuestion(i)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <Textarea
                    value={q.question}
                    onChange={(e) => updateQuestion(i, "question", e.target.value)}
                    placeholder="Enter your question..."
                    rows={4}
                  />
                  <Textarea
                    value={q.answer}
                    onChange={(e) => updateQuestion(i, "answer", e.target.value)}
                    placeholder="Enter the expected answer..."
                    rows={3}
                  />
                </div>
              </div>
            ))}
            {formData.questions.length === 0 && (
              <p className="text-sm text-gray-600">No questions added yet.</p>
            )}
          </div>
        </div>
      )}

      {/* DSA Tab */}
      {activeTab === "dsa" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">DSA Topics ({formData.DSA}%)</h3>
            <button onClick={addDSA} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-gray-50">
              <Plus className="w-4 h-4" /> Add Topic
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto pr-1 space-y-4">
            {formData.dsa_topics.map((t, i) => (
              <div key={i} className="p-4 rounded-xl border border-purple-200 bg-purple-50/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-700 font-medium">Topic {i + 1}</span>
                  <button onClick={() => removeDSA(i)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Field label="Topic">
                    <Input
                      type="text"
                      value={t.topic}
                      onChange={(e) => updateDSA(i, "topic", e.target.value)}
                      placeholder="e.g., Trees, Graphs"
                    />
                  </Field>
                  <Field label="Difficulty">
                    <select
                      value={t.difficulty}
                      onChange={(e) => updateDSA(i, "difficulty", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </Field>
                  <Field label="Questions">
                    <Input
                      type="number"
                      value={t.number_of_questions}
                      onChange={(e) => updateDSA(i, "number_of_questions", parseInt(e.target.value) || 1)}
                      min={1}
                      max={10}
                    />
                  </Field>
                </div>
              </div>
            ))}
            {formData.dsa_topics.length === 0 && (
              <p className="text-sm text-gray-600">No DSA topics added yet.</p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-gray-50">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <GradientButton onClick={onNext}>
          Next: Review <ChevronRight className="w-4 h-4" />
        </GradientButton>
      </div>
    </Card>
  );
};

// ====== STEP 3: Review & Submit ======
const ReviewSubmit = ({ onBack, formData, onSubmit, isLoading, isEditMode }) => {
  const formatDateTime = (dt) => (dt ? new Date(dt).toLocaleString() : "—");
  return (
    <Card className="p-6">
      <SectionTitle
        icon={Eye}
        title="Review & Submit"
        right={
          <button onClick={onBack} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-gray-50">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        }
      />

      <div className="space-y-6">
        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40">
          <h3 className="text-lg font-semibold text-purple-700 mb-3">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Position:</span>
              <p className="text-gray-900">{formData.post}</p>
            </div>
            <div>
              <span className="text-gray-600">Experience Required:</span>
              <p className="text-gray-900">{formData.experience} years</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-gray-600">Description:</span>
              <p className="text-gray-900 whitespace-pre-wrap">{formData.desc}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40">
          <h3 className="text-lg font-semibold text-purple-700 mb-3">Timing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Submission Deadline:</span>
              <p className="text-gray-900">{formatDateTime(formData.submissionDeadline)}</p>
            </div>
            <div>
              <span className="text-gray-600">Duration:</span>
              <p className="text-gray-900">{formData.duration} minutes</p>
            </div>
            <div>
              <span className="text-gray-600">Start Time:</span>
              <p className="text-gray-900">{formatDateTime(formData.startTime)}</p>
            </div>
            <div>
              <span className="text-gray-600">End Time:</span>
              <p className="text-gray-900">{formatDateTime(formData.endTime)}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40">
          <h3 className="text-lg font-semibold text-purple-700 mb-3">Question Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">DSA Questions:</span>
              <p className="text-gray-900">{formData.DSA}%</p>
            </div>
            <div>
              <span className="text-gray-600">Development Questions:</span>
              <p className="text-gray-900">{formData.Dev}%</p>
            </div>
            <div>
              <span className="text-gray-600">Resume Questions:</span>
              <p className="text-gray-900">{formData.ask_questions_on_resume ? "Yes" : "No"}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
            <div>
              <span className="text-gray-600">Development Questions:</span>
              <p className="text-gray-900">{formData.questions.length} questions</p>
            </div>
            <div>
              <span className="text-gray-600">DSA Topics:</span>
              <p className="text-gray-900">{formData.dsa_topics.length} topics</p>
            </div>
          </div>
        </div>

        {formData.questions.length > 0 && (
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40">
            <h3 className="text-lg font-semibold text-purple-700 mb-3">Development Questions Preview</h3>
            <div className="max-h-40 overflow-y-auto space-y-2 text-sm">
              {formData.questions.slice(0, 3).map((q, i) => (
                <div key={i} className="text-gray-900">
                  <span className="text-gray-600">{i + 1}.</span>
                  <span className="ml-2">{q.question}</span>
                </div>
              ))}
              {formData.questions.length > 3 && (
                <div className="text-sm text-gray-600">... and {formData.questions.length - 3} more questions</div>
              )}
            </div>
          </div>
        )}

        {formData.dsa_topics.length > 0 && (
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40">
            <h3 className="text-lg font-semibold text-purple-700 mb-3">DSA Topics Preview</h3>
            <div className="max-h-40 overflow-y-auto space-y-2 text-sm">
              {formData.dsa_topics.map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-900">{t.topic}</span>
                  <div className="flex items-center gap-4 text-gray-600">
                    <span>Difficulty: {t.difficulty}</span>
                    <span>Questions: {t.number_of_questions}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={onBack} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-gray-50">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <GradientButton disabled={isLoading} onClick={onSubmit}>
          <Save className="w-4 h-4" />
          {isLoading ? (isEditMode ? "Updating Interview..." : "Creating Interview...") : isEditMode ? "Update Interview" : "Create Interview"}
        </GradientButton>
      </div>
    </Card>
  );
};

// ====== MAIN: InterviewCreation (full flow restored) ======
const InterviewCreation = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  const [formData, setFormData] = useState({
    desc: "",
    post: "",
    experience: 0,
    submissionDeadline: "",
    startTime: "",
    endTime: "",
    duration: 60,
    DSA: 60,
    Dev: 40,
    ask_questions_on_resume: true,
    questions: [],
    dsa_topics: [],
  });

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      loadInterviewData(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const showMessage = (msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
    }, 5000);
  };

  const clearMessage = () => setMessage("");

  const loadInterviewData = async (interviewId) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${baseUrl}interview/get-interview/${interviewId}/`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load interview data");
      const data = await res.json();
      setOriginalData(data);
      const toLocal = (iso) => new Date(iso).toISOString().slice(0, 16);
      setFormData({
        desc: data.desc || "",
        post: data.post || "",
        experience: data.experience || 0,
        submissionDeadline: toLocal(data.submissionDeadline),
        startTime: toLocal(data.startTime),
        endTime: toLocal(data.endTime),
        duration: data.duration || 60,
        DSA: data.DSA || 60,
        Dev: data.Dev || 40,
        ask_questions_on_resume: data.ask_questions_on_resume ?? true,
        questions: data.questions || [],
        dsa_topics: data.dsa_topics || [],
      });
    } catch (err) {
      console.error(err);
      showMessage("Error loading interview data", "error");
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (!formData.desc.trim()) return showMessage("Description is required", "error"), setIsLoading(false);
      if (!formData.post.trim()) return showMessage("Position is required", "error"), setIsLoading(false);

      const submissionDeadline = new Date(formData.submissionDeadline);
      const startTime = new Date(formData.startTime);
      const endTime = new Date(formData.endTime);
      if ([submissionDeadline, startTime, endTime].some((d) => isNaN(d.getTime()))) {
        showMessage("Invalid date format", "error");
        setIsLoading(false);
        return;
      }
      if (formData.DSA + formData.Dev !== 100) {
        showMessage("DSA and Dev percentages must total 100%", "error");
        setIsLoading(false);
        return;
      }

      const payload = {
        desc: formData.desc.trim(),
        post: formData.post.trim(),
        experience: parseInt(formData.experience),
        submissionDeadline: submissionDeadline.toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: parseInt(formData.duration),
        DSA: parseInt(formData.DSA),
        Dev: parseInt(formData.Dev),
        ask_questions_on_resume: Boolean(formData.ask_questions_on_resume),
        questions: formData.questions.filter((q) => q.question.trim() && q.answer.trim()),
        dsa_topics: formData.dsa_topics.filter((t) => t.topic.trim()),
      };

      const token = getAuthToken();
      if (!token) {
        showMessage("Authentication token not found. Please login again.", "error");
        setIsLoading(false);
        return;
      }

      const url = isEditMode
        ? `${baseUrl}interview/edit-interview/${id}/`
        : `${baseUrl}interview/create-interview/`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showMessage(isEditMode ? "Interview updated successfully!" : "Interview created successfully!", "success");
        setTimeout(() => {
          const queryParams = new URLSearchParams(window.location.search);
          const orgId = queryParams.get("orgId");
          if (isEditMode && orgId) navigate(`/org-dashboard/${orgId}`);
          else {
            setFormData({
              desc: "",
              post: "",
              experience: 0,
              submissionDeadline: "",
              startTime: "",
              endTime: "",
              duration: 60,
              DSA: 60,
              Dev: 40,
              ask_questions_on_resume: true,
              questions: [],
              dsa_topics: [],
            });
            setCurrentStep(1);
          }
        }, 1200);
      } else {
        let msg = isEditMode ? "Failed to update interview" : "Failed to create interview";
        try {
          const errData = await res.json();
          if (errData.detail) msg = errData.detail;
        } catch (_) {}
        showMessage(msg, "error");
      }
    } catch (err) {
      console.error("Error with interview:", err);
      showMessage("Server error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    const prefix = isEditMode ? "Edit " : "";
    switch (currentStep) {
      case 1:
        return `${prefix}Interview Setup`;
      case 2:
        return `${prefix}Questions Configuration`;
      case 3:
        return `${prefix}Review & Submit`;
      default:
        return `${prefix}Interview Creation`;
    }
  };

  // Simple progress indicator
  const steps = [1, 2, 3];

  return (
    <>
      <Header />
      <PageShell>
        {message && <MessageNotification message={message} messageType={messageType} onClose={clearMessage} />}

        {/* Progress */}
        <div className="max-w-5xl mx-auto mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {steps.map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      currentStep >= s ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white" : "bg-white border border-gray-200 text-gray-600"
                    }`}
                  >
                    {s}
                  </div>
                  {s < steps.length && <div className={`w-16 h-0.5 ml-2 ${currentStep > s ? "bg-gradient-to-r from-violet-400 to-indigo-500" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-600">Step {currentStep} of 3: {getStepTitle()}</div>
          </div>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          {currentStep === 1 && (
            <InterviewSetup onNext={() => setCurrentStep(2)} formData={formData} setFormData={setFormData} />)
          }
          {currentStep === 2 && (
            <QuestionsConfig onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} formData={formData} setFormData={setFormData} />)
          }
          {currentStep === 3 && (
            <ReviewSubmit onBack={() => setCurrentStep(2)} formData={formData} onSubmit={handleSubmit} isLoading={isLoading} isEditMode={isEditMode} />)
          }
        </div>
      </PageShell>
      <Footer />
    </>
  );
};

export default InterviewCreation;
