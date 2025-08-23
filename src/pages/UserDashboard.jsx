"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuthToken, fetchWithToken } from "../utils/handleToken";
import { Loader2, Github, Brain, Pencil, Upload, CheckCircle, Clock, Star, Award, Code, Briefcase, TrendingUp, Sparkles, Menu, X, User } from "lucide-react";
import { toast } from 'react-toastify';

// User Dashboard specific header component
const Header = ({ viewerType }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <section className="fixed top-5 left-1/2 z-50 w-[min(90%,900px)] -translate-x-1/2 lg:top-8">
      <nav className="glassmorphic rounded-full border border-white/30 bg-gradient-to-r from-violet-300 via-purple-200 to-white backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <a href="/" className="flex shrink-0 items-center gap-2" title="InterXAI">
            <div className="flex relative">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
              <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full -ml-3 animate-pulse delay-150"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
              InterXAI
            </span>
          </a>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-black/80 hover:text-black transition-all duration-300 hover:scale-105">
              Dashboard
            </a>
            <a href="#" className="text-sm font-medium text-black/80 hover:text-black transition-all duration-300 hover:scale-105">
              Interviews
            </a>
            <a href="#" className="text-sm font-medium text-black/80 hover:text-black transition-all duration-300 hover:scale-105">
              Profile
            </a>
          </div>
          
          {/* User Welcome Section */}
          <div className="flex items-center gap-3">
            {viewerType !== "guest" && (
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">Welcome back!</span>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-5 h-5 flex flex-col justify-center items-center">
                <span className={`block w-full h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-0.5' : '-translate-y-1'}`}></span>
                <span className={`block w-full h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block w-full h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-0.5' : 'translate-y-1'}`}></span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/20 bg-white/95 backdrop-blur-xl p-6 shadow-xl">
            <div className="flex flex-col space-y-4">
              <a href="#" className="text-base font-medium text-slate-700 hover:text-indigo-500 transition-colors py-2">
                Dashboard
              </a>
              <a href="#" className="text-base font-medium text-slate-700 hover:text-indigo-500 transition-colors py-2">
                Interviews
              </a>
              <a href="#" className="text-base font-medium text-slate-700 hover:text-indigo-500 transition-colors py-2">
                Profile
              </a>
            </div>
          </div>
        )}
      </nav>
    </section>
  );
};

// Simple footer component
const Footer = () => (
  <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <p className="text-gray-600">© 2024 DevPortal. Built with ❤️ for developers.</p>
    </div>
  </footer>
);

export default function UserDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({});
  const [viewerType, setViewerType] = useState("guest");
  const [interviews, setInterviews] = useState([]);
  const [resumeFiles, setResumeFiles] = useState({});
  const [uploadingResume, setUploadingResume] = useState({});
  const [applyingToInterview, setApplyingToInterview] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getAuthToken();

      const data = await fetchWithToken(
        `http://localhost:8000/api/users/profile/${id}/`,
        token,
        navigate
      );

      if (data) {
        setProfile(data.profile);
        setFormData(data.profile);
        setTimeout(() => setVisible(true), 200);
      }

      if (token) {
        try {
          const res = await fetch(`http://localhost:8000/api/users/check-user/${id}/`, {
            headers: { Authorization: `Token ${token}` },
          });

          const result = await res.json();
          const isOwner = res.ok && result.success;
          setViewerType(isOwner ? "owner" : "authenticated");

          const interviewsRes = await fetch("http://localhost:8000/api/interview/get-all-interviews/", {
            headers: { Authorization: `Token ${token}` },
          });
          const interviewData = await interviewsRes.json();
          if (interviewsRes.ok) setInterviews(interviewData);
        } catch {
          setViewerType("guest");
        }
      } else {
        setViewerType("guest");
      }

      setLoading(false);
    };

    fetchProfile();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (field) => {
    const token = getAuthToken();
    try {
      const response = await fetch("http://localhost:8000/api/users/profile/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ [field]: formData[field] }),
      });

      const data = await response.json();

      if (data.success) {
        setProfile((prev) => ({ ...prev, [field]: formData[field] }));
        setEditingField(null);
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Update failed: " + JSON.stringify(data.errors));
      }
    } catch (error) {
      toast.error("Server error while updating.");
    }
  };

  const handleResumeUpload = async (e, interviewId) => {
    const file = e.target.files[0];
    if (!file) return;
  
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file only.");
      return;
    }
  
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should not exceed 5MB.");
      return;
    }
  
    setUploadingResume(prev => ({ ...prev, [interviewId]: true }));
  
    // Upload directly to Pinata
    const formData = new FormData();
    formData.append("file", file);
    
    // Optional: Add metadata
    const metadata = JSON.stringify({
      name: `resume_${interviewId}_${file.name}`,
      keyvalues: {
        interview_id: interviewId,
        uploaded_at: new Date().toISOString()
      }
    });
    formData.append("pinataMetadata", metadata);
  
    const options = JSON.stringify({
      cidVersion: 1,
    });
    formData.append("pinataOptions", options);
  
    try {
      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT_TOKEN}`,
        },
        body: formData,
      });
  
      const data = await res.json();
      
      if (res.ok && data.IpfsHash) {
        const fileUrl = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
        
        setResumeFiles((prev) => ({
          ...prev,
          [interviewId]: fileUrl
        }));
        
        toast.success("Resume uploaded successfully!");
        
      } else {
        toast.error("Failed to upload resume.");
      }
    } catch (err) {
      toast.error("Error uploading resume.");
    } finally {
      setUploadingResume(prev => ({ ...prev, [interviewId]: false }));
    }
  };

  const handleApply = async (interviewId) => {
    const token = getAuthToken();
    const resumeUrl = resumeFiles[interviewId];
    if (!resumeUrl) return toast.error("Please upload your resume first.");

    setApplyingToInterview(prev => ({ ...prev, [interviewId]: true }));

    try {
      const response = await fetch(`http://localhost:8000/api/interview/apply-interview/${interviewId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ resume_url: resumeUrl }),

      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Application submitted successfully!");
        setResumeFiles((prev) => ({ ...prev, [interviewId]: null }));
        // Refresh interviews to update the UI
        const interviewsRes = await fetch("http://localhost:8000/api/interview/get-all-interviews/", {
          headers: { Authorization: `Token ${token}` },
        });
        const interviewData = await interviewsRes.json();
        if (interviewsRes.ok) setInterviews(interviewData);
      } else {
        toast.error("Failed to apply: " + (data.error || JSON.stringify(data)));
      }
    } catch (err) {
      toast.error("Error applying to interview.");
    } finally {
      setApplyingToInterview(prev => ({ ...prev, [interviewId]: false }));
    }
  };

  const renderInterviewActions = (interview) => {
    const hasApplied = interview.has_applied || false;
    const applicationStatus = interview.application_status || false;
    const hasAttempted = interview.attempted || false;
    const interviewId = interview.id;

    if (hasApplied) {
      if (applicationStatus) {
        if (hasAttempted) {
          return (
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">Interview completed! Results coming soon ✨</p>
            </div>
          );
        } else {
          return (
            <button
              onClick={() => navigate(`/interview/start/${interviewId}`)}
              className="mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-5 h-5" />
              Start Interview
            </button>
          );
        }
      } else {
        return (
          <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
            <Clock className="w-5 h-5 text-amber-600" />
            <p className="text-amber-800 font-medium">Application under review 📝</p>
          </div>
        );
      }
    } else {
      const resumeUploaded = resumeFiles[interviewId];
      const isUploading = uploadingResume[interviewId];
      const isApplying = applyingToInterview[interviewId];

      return (
        <div className="mt-4 space-y-3 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200">
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => handleResumeUpload(e, interviewId)}
              className="text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-purple-500 file:to-indigo-600 file:text-white hover:file:from-purple-600 hover:file:to-indigo-700 file:cursor-pointer file:transition-all file:duration-300"
              disabled={isUploading || isApplying}
            />
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </div>
            )}
            {resumeUploaded && !isUploading && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                Resume uploaded
              </div>
            )}
          </div>
          
          <button
            onClick={() => handleApply(interviewId)}
            disabled={!resumeUploaded || isUploading || isApplying}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium ${
              !resumeUploaded || isUploading || isApplying
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white hover:shadow-xl"
            }`}
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Apply Now
              </>
            )}
          </button>
        </div>
      );
    }
  };

  const githubUsername = profile?.github || "";
  const leetcodeUsername = profile?.leetcode || "";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50 to-lavender-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-purple-600" />
          <p className="text-gray-700 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50 to-lavender-50">
        <div className="text-center text-red-600">
          <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-gray-600">The user profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-200/40 to-lavender-200/40 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-20 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-200/30 to-blue-200/30 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-br from-violet-100/20 to-purple-100/20 blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Floating sparkles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-purple-400/30 rounded-full animate-ping`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
      
      <Header viewerType={viewerType} />

      <div className="flex flex-col items-center justify-center py-20 px-4 relative z-10">
        {/* Profile Header */}
        <div className={`max-w-6xl w-full transform transition-all duration-1000 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-purple-100/50 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/70 to-transparent"></div>

              <div className="flex flex-col items-center space-y-6">
                {/* Profile Picture */}
                <div className="relative group">
                  {viewerType === "owner" && editingField === "photo" ? (
                    <div className="flex flex-col items-center space-y-3">
                      <input
                        type="text"
                        name="photo"
                        value={formData.photo}
                        onChange={handleChange}
                        className="bg-gray-50 border border-purple-200 text-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                        placeholder="Enter photo URL"
                      />
                      <div className="flex gap-3">
                        <button onClick={() => handleSave("photo")} className="text-sm bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all">Save</button>
                        <button onClick={() => setEditingField(null)} className="text-sm bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                      <img
                        src={profile.photo}
                        alt="User Profile"
                        className={`relative w-32 h-32 rounded-full border-4 border-white shadow-xl ${viewerType === "owner" ? "cursor-pointer hover:scale-105 transition-transform duration-300" : ""}`}
                        onClick={() => viewerType === "owner" && setEditingField("photo")}
                      />
                      {viewerType === "owner" && (
                        <div className="absolute bottom-2 right-2 bg-purple-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Pencil className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Username */}
                <div className="text-center">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3 justify-center">
                    <Star className="w-8 h-8 text-purple-500" />
                    @{profile.username || "Anonymous"}
                    <Star className="w-8 h-8 text-indigo-500" />
                  </h1>
                </div>

                {/* Bio Section */}
                <div className="text-center w-full max-w-2xl">
                  {viewerType === "owner" && editingField === "bio" ? (
                    <div className="space-y-4">
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="bg-gray-50 border border-purple-200 text-gray-800 p-4 rounded-xl w-full focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                        placeholder="Tell us about yourself..."
                        rows="4"
                      />
                      <div className="flex gap-3 justify-center">
                        <button onClick={() => handleSave("bio")} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all">Save</button>
                        <button onClick={() => setEditingField(null)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-all">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {profile.bio || "This user has not added a bio yet."}
                      </p>
                      {viewerType === "owner" && (
                        <button 
                          onClick={() => setEditingField("bio")}
                          className="absolute top-2 right-2 text-purple-400 hover:text-purple-600 transition-colors p-1 rounded-full hover:bg-purple-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mt-8">
                  {/* GitHub Card */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-gray-600 to-gray-900 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
                    <div className="relative bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-800 text-xl font-bold flex items-center gap-3">
                          <div className="p-2 bg-black rounded-lg">
                            <Github className="w-6 h-6 text-white" />
                          </div>
                          GitHub Stats
                        </h3>
                        {viewerType === "owner" && editingField !== "github" && (
                          <button 
                            onClick={() => setEditingField("github")}
                            className="text-gray-400 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-purple-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      {viewerType === "owner" && editingField === "github" ? (
                        <div className="space-y-4">
                          <input
                            name="github"
                            value={formData.github}
                            onChange={handleChange}
                            className="bg-white border border-gray-300 text-gray-800 p-3 rounded-xl w-full focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                            placeholder="Enter GitHub username"
                          />
                          <div className="flex gap-3">
                            <button onClick={() => handleSave("github")} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all">Save</button>
                            <button onClick={() => setEditingField(null)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2 mb-4">
                            <p className="text-sm text-gray-600 font-medium">Username:</p>
                            <a
                              href={`https://github.com/${githubUsername}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 transition-colors font-mono text-lg hover:underline break-all"
                            >
                              {githubUsername || "Not set"}
                            </a>
                          </div>
                          {githubUsername && (
                            <div className="rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
                              <img
                                src={`https://github-readme-stats.vercel.app/api?username=${githubUsername}&show_icons=true&theme=default&bg_color=ffffff&title_color=7c3aed&text_color=374151&icon_color=6366f1`}
                                alt="GitHub Stats"
                                className="w-full object-cover"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* LeetCode Card */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
                    <div className="relative bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-800 text-xl font-bold flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                            <Brain className="w-6 h-6 text-white" />
                          </div>
                          LeetCode Stats
                        </h3>
                        {viewerType === "owner" && editingField !== "leetcode" && (
                          <button 
                            onClick={() => setEditingField("leetcode")}
                            className="text-gray-400 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-purple-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      {viewerType === "owner" && editingField === "leetcode" ? (
                        <div className="space-y-4">
                          <input
                            name="leetcode"
                            value={formData.leetcode}
                            onChange={handleChange}
                            className="bg-white border border-yellow-300 text-gray-800 p-3 rounded-xl w-full focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                            placeholder="Enter LeetCode username"
                          />
                          <div className="flex gap-3">
                            <button onClick={() => handleSave("leetcode")} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all">Save</button>
                            <button onClick={() => setEditingField(null)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2 mb-4">
                            <p className="text-sm text-gray-600 font-medium">Username:</p>
                            <a
                              href={`https://leetcode.com/${leetcodeUsername}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-600 hover:text-orange-800 transition-colors font-mono text-lg hover:underline break-all"
                            >
                              {leetcodeUsername || "Not set"}
                            </a>
                          </div>
                          {leetcodeUsername && (
                            <div className="rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
                              <img
                                src={`https://leetcard.jacoblin.cool/${leetcodeUsername}?theme=light&font=baloo&show_rank=true`}
                                alt="LeetCode Card"
                                className="w-full object-cover"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interviews Section */}
        {viewerType === "owner" && interviews.length > 0 && (
          <div className="max-w-6xl w-full mt-16 space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
                <Briefcase className="w-8 h-8 text-purple-500" />
                Available Interviews
                <TrendingUp className="w-8 h-8 text-indigo-500" />
              </h2>
              <p className="text-gray-600 text-lg">Discover exciting opportunities and showcase your skills</p>
            </div>
            
            <div className="grid gap-8">
              {interviews.map((interview, index) => (
                <div key={interview.id} className={`relative group transform transition-all duration-700 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
                  <div className="relative bg-white/90 backdrop-blur-xl p-8 rounded-2xl border border-purple-100/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <div className="space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
                              <Code className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <span className="text-purple-600 font-semibold text-sm">Position:</span>
                              <h3 className="text-gray-800 text-xl font-bold">{interview.post}</h3>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <span className="text-purple-600 font-semibold text-sm">Description:</span>
                            <p className="text-gray-700 leading-relaxed">{interview.desc}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <div className="flex items-center gap-2">
                              <Award className="w-5 h-5 text-indigo-500" />
                              <div>
                                <span className="text-purple-600 font-semibold text-sm">Experience Required:</span>
                                <p className="text-gray-800 font-medium">{interview.experience} years</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-5 h-5 text-amber-500" />
                              <div>
                                <span className="text-purple-600 font-semibold text-sm">Deadline:</span>
                                <p className="text-gray-800 font-medium">{new Date(interview.submissionDeadline).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {renderInterviewActions(interview)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}