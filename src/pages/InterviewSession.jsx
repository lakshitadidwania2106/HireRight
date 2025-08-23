// InterviewSession.jsx
"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuthToken, fetchWithToken } from "../utils/handleToken";
import { Loader2, Send, MessageCircle, User, Clock } from "lucide-react";

const InterviewSession = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const token = getAuthToken();

  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [endTime, setEndTime] = useState(null);
  const [interviewActive, setInterviewActive] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);

  const hasInitialized = useRef(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Smooth auto-scroll to bottom when history updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, questionLoading]);

  // Initialize session & guard rails
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initSession = async () => {
      try {
        const interviewData = await fetchWithToken(
          `http://localhost:8000/api/interview/get-all-interviews/`,
          token
        );
        const currentInterview = interviewData.find(
          (item) => item.id === parseInt(interviewId)
        );

        if (!currentInterview) {
          setError("Interview not found.");
          setLoading(false);
          return;
        }

        const now = new Date();
        const start = new Date(currentInterview.startTime);
        const end = new Date(currentInterview.endTime);
        setEndTime(end);

        if (now < start) {
          setError("Interview has not started yet.");
          setLoading(false);
          return;
        }
        if (now > end) {
          setError("Interview time has ended.");
          setLoading(false);
          return;
        }

        setInterviewActive(true);

        const data = await fetchWithToken(
          `http://localhost:8000/api/interview/interview-session-initializer/${interviewId}/`,
          token,
          null,
          "POST"
        );

        if (!data || !data.session_id) {
          setError(data?.error || "Failed to start interview.");
        } else {
          setSessionId(data.session_id);
          setCurrentQuestion(data.question);
        }
      } catch (err) {
        setError("Error initializing session.");
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, [interviewId, token, navigate]);

  // Auto-end by endTime
  useEffect(() => {
    if (!endTime) return;
    const timer = setInterval(() => {
      if (new Date() >= endTime) {
        setCompleted(true);
        setCurrentQuestion(null);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  // Redirect when completed
  useEffect(() => {
    if (completed && sessionId) {
      navigate(`/dsa-interview-platform/${sessionId}`);
    }
  }, [completed, sessionId, navigate]);

  // Time remaining (mm:ss)
  const timeLeft = useMemo(() => {
    if (!endTime) return null;
    const diff = Math.max(0, endTime.getTime() - new Date().getTime());
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [endTime, loading, questionLoading, chatHistory, currentQuestion]);

  // Submit answer
  const handleNext = async () => {
    if (!answer.trim()) return;

    // Append to chat
    setChatHistory((prev) => [...prev, { question: currentQuestion, answer }]);
    setAnswer("");
    setQuestionLoading(true);

    try {
      const data = await fetchWithToken(
        `http://localhost:8000/api/interview/interview-session/${sessionId}/?answer=${encodeURIComponent(
          answer
        )}`,
        token,
        null,
        "POST"
      );

      if (!data) {
        setError("Error submitting answer.");
        return;
      }

      if (data.completed) {
        setCompleted(true);
      } else {
        setCurrentQuestion(data.current_question);
      }
    } catch (err) {
      setError("Error submitting answer.");
    } finally {
      setQuestionLoading(false);
      // Focus back to input
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  // Welcome action
  const handleStartInterview = () => {
    setShowWelcome(false);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  // Keyboard handling: Enter to send, Shift+Enter for newline
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (answer.trim()) handleNext();
    }
  };

  // ---------- UI STATES ----------

  // Loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-white via-slate-50/50 to-white relative overflow-hidden">
        <BackdropDecor />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="animate-spin w-10 h-10 text-indigo-500" />
          <p className="text-slate-600">Preparing your interview…</p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-slate-800 bg-gradient-to-br from-white via-slate-50/50 to-white relative overflow-hidden">
        <BackdropDecor />
        <div className="relative z-10 text-center bg-white/70 backdrop-blur-xl border border-white/40 p-8 rounded-2xl shadow-xl">
          <p className="text-xl text-red-500">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 bg-gradient-to-r from-violet-400 to-indigo-500 hover:from-violet-500 hover:to-indigo-600 px-6 py-3 rounded-xl transition-all duration-300 text-white shadow-lg hover:shadow-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Welcome screen
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/50 to-white relative overflow-hidden flex items-center justify-center">
        <BackdropDecor withAmber />
        <div className="bg-white/70 backdrop-blur-xl p-12 rounded-3xl border border-white/40 shadow-2xl max-w-lg w-full mx-4 text-center relative z-10 hover:scale-[1.01] transition-all duration-700">
          <div className="bg-gradient-to-r from-violet-400/20 to-indigo-500/20 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <MessageCircle size={48} className="text-indigo-500" />
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent mb-3">
            Welcome to your Interview
          </h1>
          <p className="text-slate-600 mb-8 text-lg leading-relaxed">
            This is a timed session. You’ll see questions one by one. Answer
            clearly and press <span className="font-semibold">Enter</span> to
            submit (use <span className="font-semibold">Shift+Enter</span> for a
            new line).
          </p>
          <button
            onClick={handleStartInterview}
            className="bg-gradient-to-r from-violet-400 to-indigo-500 hover:from-violet-500 hover:to-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl text-white"
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  // Completion screen (kept your redirect effect)
  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/50 to-white relative overflow-hidden flex items-center justify-center">
        <BackdropDecor />
        <div className="bg-green-100/70 backdrop-blur-xl border border-green-300/50 p-12 rounded-3xl shadow-2xl max-w-md w-full mx-4 text-center relative z-10 hover:scale-[1.01] transition-all duration-700">
          <div className="bg-green-500/20 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <MessageCircle size={48} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-3">
            Thanks for completing the interview!
          </h1>
          <p className="text-green-700 text-base">Redirecting…</p>
          <div className="mt-6">
            <Loader2 className="animate-spin w-6 h-6 text-green-500 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // ---------- MAIN CHAT UI ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/50 to-white relative overflow-hidden">
      <BackdropDecor />

      {/* Top sticky info bar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-20">
        <div className="px-4 py-2 rounded-full backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-700 text-sm">
            Session <span className="font-semibold">{sessionId || "…"}</span>
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-700 text-sm flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Time left:{" "}
            <span className="font-semibold tabular-nums">{timeLeft}</span>
          </span>
        </div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto pt-24 pb-40 px-4 md:px-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Render prior Q/A as bubbles */}
            {chatHistory.map((item, idx) => (
              <React.Fragment key={`pair-${idx}`}>
                {/* System/Question bubble */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-1 w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shadow-md">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="max-w-[85%] md:max-w-[80%] bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg">
                    <p className="text-xs font-semibold text-indigo-600 mb-1">
                      Question {idx + 1}
                    </p>
                    <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {item.question}
                    </p>
                  </div>
                </div>
                {/* User/Answer bubble */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="max-w-[85%] md:max-w-[80%] bg-gradient-to-br from-indigo-500/90 to-violet-500/90 text-white border border-white/30 rounded-2xl rounded-tr-sm px-4 py-3 shadow-xl">
                    <p className="text-xs font-semibold text-white/90 mb-1">
                      Your Answer
                    </p>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {item.answer}
                    </p>
                  </div>
                  <div className="shrink-0 mt-1 w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
              </React.Fragment>
            ))}

            {/* Current question bubble */}
            {currentQuestion && (
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-1 w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shadow-md">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="max-w-[85%] md:max-w-[80%] bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg">
                  <p className="text-xs font-semibold text-indigo-600 mb-1">
                    Question {chatHistory.length + 1}
                  </p>
                  <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {currentQuestion}
                  </p>
                </div>
              </div>
            )}

            {/* Typing indicator while next question loads */}
            {questionLoading && (
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-1 w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shadow-md">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="max-w-[70%] bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 text-sm">Reviewing</span>
                    <TypingDots />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="fixed bottom-6 left-0 right-0 px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl p-3">
              <div className="flex items-end gap-3">
                <textarea
                  ref={inputRef}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={3}
                  placeholder="Type your answer…  (Enter to send • Shift+Enter for newline)"
                  className="flex-1 resize-none bg-transparent outline-none text-slate-800 placeholder:text-slate-400 p-3 rounded-xl"
                />
                <button
                  onClick={handleNext}
                  disabled={!answer.trim() || questionLoading || !currentQuestion}
                  className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-medium transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
                >
                  {questionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit
                    </>
                  )}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between px-1">
                <p className="text-xs text-slate-500">
                  Press <span className="font-semibold">Enter</span> to submit •{" "}
                  <span className="font-semibold">Shift+Enter</span> for a new line
                </p>
                <p className="text-xs text-slate-500">
                  Questions answered:{" "}
                  <span className="font-semibold tabular-nums">
                    {chatHistory.length}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tiny CSS for typing dots */}
      <style>{`
        @keyframes bounceDot {
          0%, 80%, 100% { transform: translateY(0); opacity: .35; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

/* ---------------- Decors & Small Components ---------------- */

const BackdropDecor = ({ withAmber = false }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
    <div className="absolute top-20 right-16 w-64 h-64 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-200/20 blur-3xl animate-pulse" />
    <div
      className="absolute bottom-16 left-16 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/20 to-sky-400/20 blur-3xl animate-pulse"
      style={{ animationDelay: "1.2s" }}
    />
    {withAmber && (
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[320px] bg-gradient-to-br from-red-400/10 to-amber-400/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "0.7s" }}
      />
    )}
  </div>
);

const TypingDots = () => (
  <div className="ml-1 inline-flex items-center gap-1">
    <span
      className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"
      style={{ animation: "bounceDot 1.2s infinite" }}
    />
    <span
      className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"
      style={{ animation: "bounceDot 1.2s infinite .15s" }}
    />
    <span
      className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"
      style={{ animation: "bounceDot 1.2s infinite .3s" }}
    />
  </div>
);

export default InterviewSession;
