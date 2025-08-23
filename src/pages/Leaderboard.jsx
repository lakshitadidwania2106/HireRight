"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Medal, 
  Award, 
  User, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Eye, 
  FileText, 
  Download, 
  ArrowLeft, 
  Star, 
  BookOpen, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Target, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from "lucide-react";

// Mock components for demonstration
const Header = ({ viewerType }) => (
  <div className="fixed top-0 w-full bg-white/60 backdrop-blur-md border-b border-white/10 z-40 px-6 py-4">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <h1 className="text-lg md:text-xl font-semibold text-slate-900">Interview Platform</h1>
      <div className="text-sm text-slate-700">Viewer: <span className="font-medium">{viewerType}</span></div>
    </div>
  </div>
);

const Footer = () => (
  <div className="bg-transparent text-slate-700 py-8 px-6 text-center">
    <p className="text-sm">&copy; 2025 Interview Platform. All rights reserved.</p>
  </div>
);

// Mock auth function
const getAuthToken = () => "mock-token";

const Leaderboard = () => {
  // Mock interview ID for demonstration
  const interviewId = "123";
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showApplication, setShowApplication] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [resumeView, setResumeView] = useState('extracted');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetchLeaderboardData();
    setTimeout(() => setVisible(true), 120);
  }, [interviewId]);

  const fetchLeaderboardData = async () => {
    try {
      // Mock data for demonstration
      const mockData = [
        {
          id: 1,
          score: 92.5,
          status: "completed",
          start_time: "2025-08-21T10:00:00Z",
          end_time: "2025-08-21T11:30:00Z",
          feedback: "Excellent technical skills and problem-solving approach.",
          strengths: "Strong coding skills, good communication, logical thinking",
          recommendation: "Highly Recommended",
          session: [
            {
              score: 95,
              feedback: "Great understanding of algorithms",
              Customquestion: {
                question: "Explain the time complexity of binary search",
                answer: "O(log n) - divides search space in half each iteration"
              },
              followups: [
                { question: "What about space complexity?", answer: "O(1) for iterative, O(log n) for recursive" }
              ]
            }
          ],
          Application: {
            id: 101,
            user: { username: "john_doe" },
            score: 88.0,
            applied_at: "2025-08-20T09:00:00Z",
            shortlisting_decision: true,
            feedback: "Strong technical background with relevant experience.",
            resume: "https://example.com/resume1.pdf",
            extractedResume: `### Personal Details
- Name: John Doe
- Email: john.doe@email.com
- Phone: +1-234-567-8900

### Skills
- JavaScript, React, Node.js
- Python, Django
- PostgreSQL, MongoDB
- AWS, Docker

### Experience
- Senior Developer at Tech Corp (2022-2025)
 - Led team of 5 developers
 - Implemented microservices architecture
 - Reduced system latency by 40%

### Education
- Computer Science, MIT (2018-2022)
- GPA: 3.8/4.0

### Projects
- E-commerce Platform (GitHub) | React, Node.js (2024)
 - Built full-stack application
 - Integrated payment gateway
 - Deployed on AWS`
          }
        },
        {
          id: 2,
          score: 78.3,
          status: "completed",
          start_time: "2025-08-21T14:00:00Z",
          end_time: "2025-08-21T15:45:00Z",
          feedback: "Good technical knowledge, needs improvement in communication.",
          strengths: "Problem-solving, attention to detail",
          recommendation: "Recommended",
          session: [],
          Application: {
            id: 102,
            user: { username: "jane_smith" },
            score: 82.5,
            applied_at: "2025-08-19T14:30:00Z",
            shortlisting_decision: null,
            feedback: "Good experience but lacking in leadership skills.",
            resume: null,
            extractedResume: `### Personal Details
- Name: Jane Smith
- Email: jane.smith@email.com

### Skills
- Python, Flask
- Machine Learning
- Data Analysis

### Experience
- Data Scientist at Analytics Inc (2021-2025)

### Education
- Data Science, Stanford (2017-2021)`
          }
        },
        {
          id: 3,
          score: 65.7,
          status: "ongoing",
          start_time: "2025-08-21T16:00:00Z",
          end_time: null,
          feedback: null,
          strengths: null,
          recommendation: null,
          session: [],
          Application: {
            id: 103,
            user: { username: "bob_wilson" },
            score: 70.0,
            applied_at: "2025-08-18T11:15:00Z",
            shortlisting_decision: false,
            feedback: "Lacks required experience for senior role.",
            resume: "https://example.com/resume3.pdf",
            extractedResume: null
          }
        }
      ];
      
      setLeaderboardData(mockData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-500" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-slate-600 font-bold">
            {rank}
          </span>
        );
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-700 bg-green-100/70";
    if (score >= 60) return "text-yellow-700 bg-yellow-100/70";
    if (score >= 40) return "text-orange-700 bg-orange-100/70";
    return "text-red-700 bg-red-100/70";
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      completed: "bg-green-50 text-green-600 border-green-200",
      ongoing: "bg-blue-50 text-blue-600 border-blue-200",
      scheduled: "bg-slate-50 text-slate-600 border-slate-200",
      cancelled: "bg-red-50 text-red-600 border-red-200",
      cheated: "bg-red-50 text-red-600 border-red-200",
    };

    const colorClass = statusColors[status] || "bg-slate-50 text-slate-600 border-slate-200";

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getDecisionBadge = (decision) => {
    if (decision === true) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Approved
        </span>
      );
    } else if (decision === false) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Rejected
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Pending
        </span>
      );
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowHistory(true);
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowApplication(true);
    setResumeView('extracted');
  };

  const parseExtractedResume = (resumeText) => {
    if (!resumeText) return null;
    
    const sections = {
      personalDetails: [],
      skills: [],
      experience: [],
      education: [],
      certifications: [],
      projects: [],
      achievements: []
    };
  
    const lines = resumeText.split('\n');
    let currentSection = '';
  
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('### Personal Details')) {
        currentSection = 'personalDetails';
      } else if (trimmedLine.startsWith('### Skills')) {
        currentSection = 'skills';
      } else if (trimmedLine.startsWith('### Experience')) {
        currentSection = 'experience';
      } else if (trimmedLine.startsWith('### Education')) {
        currentSection = 'education';
      } else if (trimmedLine.startsWith('### Certifications')) {
        currentSection = 'certifications';
      } else if (trimmedLine.startsWith('### Projects')) {
        currentSection = 'projects';
      } else if (trimmedLine.startsWith('### Achievements')) {
        currentSection = 'achievements';
      } else if (currentSection && trimmedLine) {
        if (line.startsWith('- ')) {
          sections[currentSection].push(trimmedLine.substring(1).trim());
        } else if (line.startsWith(' - ') && (currentSection === 'projects' || currentSection === 'experience')) {
          if (sections[currentSection].length > 0) {
            const lastIndex = sections[currentSection].length - 1;
            sections[currentSection][lastIndex] += '\n' + trimmedLine;
          }
        } else if (trimmedLine.startsWith('-') && currentSection !== 'projects' && currentSection !== 'experience') {
          sections[currentSection].push(trimmedLine.substring(1).trim());
        } else if (currentSection && trimmedLine && !trimmedLine.startsWith('###')) {
          if (currentSection === 'projects' || currentSection === 'experience') {
            if (sections[currentSection].length > 0) {
              const lastIndex = sections[currentSection].length - 1;
              sections[currentSection][lastIndex] += '\n' + trimmedLine;
            } else {
              sections[currentSection].push(trimmedLine);
            }
          } else {
            sections[currentSection].push(trimmedLine);
          }
        }
      }
    });
  
    return sections;
  };

  const parseProjectName = (projectText) => {
    if (!projectText) return 'Unnamed Project';
    
    const firstLine = projectText.split('\n')[0];
    
    let match = firstLine.match(/^(.+?)\s*\(GitHub\)/);
    if (match) {
      return match[1].trim();
    }
    
    match = firstLine.match(/^(.+?)\s*\|/);
    if (match) {
      return match[1].trim();
    }
    
    match = firstLine.match(/^(.+?)\s*[-–]/);
    if (match) {
      return match[1].trim();
    }
    
    match = firstLine.match(/^([^|\-–(]+)/);
    if (match) {
      return match[1].trim();
    }
    
    return firstLine.trim();
  };

  const renderResumeSection = (title, items, icon) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <h5 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          {icon}
          {title}
        </h5>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="text-slate-700">
              {title === 'Projects' ? (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h6 className="font-semibold text-purple-600 mb-2">
                    {parseProjectName(item)}
                  </h6>
                  <div className="text-sm whitespace-pre-line">{item}</div>
                </div>
              ) : title === 'Experience' ? (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="text-sm whitespace-pre-line">{item}</div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{item}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-white relative overflow-hidden">
        <Header viewerType="owner" />
        <div className="flex items-center justify-center min-h-screen pt-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-white relative overflow-hidden">
        <Header viewerType="owner" />
        <div className="flex items-center justify-center min-h-screen pt-24">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            Error: {error}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const sortedData = [...leaderboardData].sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-white to-slate-50 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-24 right-24 w-72 h-72 rounded-full bg-gradient-to-br from-violet-300/30 to-purple-200/20 blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
          <div className="absolute bottom-24 left-16 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-400/20 to-sky-300/20 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" style={{ animationDelay: '1.2s' }} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[520px] h-[360px] rounded-full bg-gradient-to-br from-rose-200/6 to-amber-200/6 blur-3xl" style={{ animationDelay: '0.6s' }} />
          </div>
        </div>
        
        <Header viewerType="owner" />
        
        <div className="container mx-auto px-4 relative z-10 pt-32 pb-20">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className={`transform transition-all duration-700 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
              <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 mb-8 p-8 relative overflow-hidden hover:scale-[1.01] transition-all duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-400/40 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3 mb-2">
                      <Trophy className="w-10 h-10 text-yellow-400" />
                      Interview Leaderboard
                    </h1>
                    <p className="text-slate-700 text-base">
                      Performance rankings for all candidates in this interview
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-indigo-700 font-medium">Total Candidates</p>
                    <p className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                      {sortedData.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className={`transform transition-all duration-700 delay-150 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
              <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-400/40 to-transparent"></div>
                
                <div className="px-6 py-5 bg-slate-100/40 border-b border-white/10">
                  <h2 className="text-2xl font-semibold text-indigo-700">Rankings</h2>
                </div>

                {sortedData.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <User className="w-16 h-16 mx-auto mb-6 text-slate-600" />
                    <p className="text-lg">No candidates found for this interview.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50/60">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Rank</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Candidate</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Score</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Start Time</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">End Time</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {sortedData.map((candidate, index) => (
                          <tr
                            key={candidate.id}
                            className={`transition-colors duration-200 hover:bg-white/30 ${
                              index < 3 ? "bg-gradient-to-r from-violet-100/40 to-transparent" : ""
                            }`}
                          >
                            <td className="px-6 py-5 whitespace-nowrap align-top">
                              <div className="flex items-center">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full shadow-sm"
                                  style={{
                                    background: index === 0 ? "linear-gradient(90deg,#ffd54a,#ffb74d)" : index === 1 ? "linear-gradient(90deg,#e0e0e0,#bdbdbd)" : index === 2 ? "linear-gradient(90deg,#f6ad55,#f59e0b)" : undefined
                                  }}>
                                  {getRankIcon(index + 1)}
                                </div>
                                <span className="ml-3 text-lg font-semibold text-slate-800">#{index + 1}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12">
                                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                                    <User className="w-6 h-6 text-white" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-lg font-semibold text-slate-800">
                                    {candidate.Application?.user?.username || "Anonymous"}
                                  </div>
                                  <div className="text-sm text-slate-500">ID: {candidate.Application?.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className={`inline-flex items-center px-4 py-2 rounded-full text-base font-semibold border ${getScoreColor(candidate.score || 0)}`}>
                                {candidate.score ? candidate.score.toFixed(1) : "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              {getStatusBadge(candidate.status)}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-indigo-500" />
                                {formatDateTime(candidate.start_time)}
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-500" />
                                {candidate.end_time ? formatDateTime(candidate.end_time) : "In Progress"}
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleViewDetails(candidate)}
                                  className="flex items-center gap-2 text-indigo-700 hover:text-white hover:bg-indigo-600 px-3 py-2 rounded-lg transition-all duration-200 border border-indigo-200"
                                >
                                  <Eye className="w-4 h-4" />
                                  Interview
                                </button>
                                <button
                                  onClick={() => handleViewApplication(candidate.Application)}
                                  className="flex items-center gap-2 text-green-700 hover:text-white hover:bg-green-600 px-3 py-2 rounded-lg transition-all duration-200 border border-green-200"
                                >
                                  <FileText className="w-4 h-4" />
                                  Application
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Insights */}
            {sortedData.length > 0 && (
              <div className={`mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 transform transition-all duration-700 delay-200 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400/40 to-transparent"></div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700 uppercase tracking-wide">Highest Score</p>
                      <p className="text-2xl font-extrabold text-slate-800 mt-1">
                        {Math.max(...sortedData.map((c) => c.score || 0)).toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <Trophy className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">Average Score</p>
                      <p className="text-2xl font-extrabold text-slate-800 mt-1">
                        {(sortedData.reduce((sum, c) => sum + (c.score || 0), 0) / sortedData.length).toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent"></div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <User className="w-8 h-8 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-700 uppercase tracking-wide">Completed</p>
                      <p className="text-2xl font-extrabold text-slate-800 mt-1">
                        {sortedData.filter((c) => c.status === "completed").length}
                        <span className="text-base text-slate-500 ml-2">/{sortedData.length}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interview Details Modal */}
        {showHistory && selectedCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
              <div className="sticky top-0 bg-white/90 px-6 py-4 flex justify-between items-center border-b border-white/30">
                <h3 className="text-lg font-semibold text-slate-900">
                  Interview Details - {selectedCandidate.Application?.user?.username}
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-slate-500 hover:text-slate-700 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6 text-slate-700">
                <div className="bg-white rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 border border-slate-100">
                  <div>
                    <p className="text-sm text-slate-500">Final Score</p>
                    <p className="text-xl font-bold text-indigo-700">
                      {selectedCandidate.score?.toFixed(1) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Status</p>
                    <p className="mt-1">{getStatusBadge(selectedCandidate.status)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Recommendation</p>
                    <p className="text-sm font-medium">
                      {selectedCandidate.recommendation || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Duration</p>
                    <p className="text-sm font-medium">
                      {selectedCandidate.start_time && selectedCandidate.end_time
                        ? `${Math.round(
                            (new Date(selectedCandidate.end_time) -
                              new Date(selectedCandidate.start_time)) /
                              (1000 * 60)
                          )} min`
                        : "In Progress"}
                    </p>
                  </div>
                </div>

                {selectedCandidate.feedback && (
                  <div>
                    <h4 className="text-md font-semibold text-slate-900 mb-2">Overall Feedback</h4>
                    <div className="bg-blue-50 border-l-4 border-blue-300 p-4 rounded">
                      <p className="text-sm">{selectedCandidate.feedback}</p>
                    </div>
                  </div>
                )}

                {selectedCandidate.strengths && (
                  <div>
                    <h4 className="text-md font-semibold text-slate-900 mb-2">Strengths</h4>
                    <div className="bg-green-50 border-l-4 border-green-300 p-4 rounded">
                      <p className="text-sm">{selectedCandidate.strengths}</p>
                    </div>
                  </div>
                )}

                {selectedCandidate.session && selectedCandidate.session.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-slate-900 mb-4">Question-wise Performance</h4>
                    <div className="space-y-4">
                      {selectedCandidate.session.map((item, index) => (
                        <div key={index} className="border border-slate-100 rounded-lg p-4 bg-white">
                          <div className="flex justify-between items-start mb-3">
                            <h5 className="font-medium text-slate-900">Question {index + 1}</h5>
                            {item.score && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(item.score)}`}>
                                {item.score.toFixed(1)}
                              </span>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-violet-600">Main Question:</p>
                              <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">
                                {item.Customquestion?.question}
                              </p>
                            </div>

                            {item.Customquestion?.answer && (
                              <div>
                                <p className="text-sm font-medium text-violet-600">Expected Answer:</p>
                                <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">
                                  {item.Customquestion.answer}
                                </p>
                              </div>
                            )}

                            {item.followups && item.followups.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-violet-600 mb-2">Follow-up Questions:</p>
                                <div className="space-y-2">
                                  {item.followups.map((qa, qaIndex) => (
                                    <div key={qaIndex} className="bg-slate-50 p-3 rounded">
                                      <p className="text-sm font-medium text-indigo-700">Q: {qa.question}</p>
                                      <p className="text-sm text-slate-700 mt-1">A: {qa.answer}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {item.feedback && (
                              <div>
                                <p className="text-sm font-medium text-violet-600">Feedback:</p>
                                <p className="text-sm text-slate-700 bg-yellow-50 p-2 rounded">{item.feedback}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Application Details Modal */}
        {showApplication && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-white/95 px-6 py-4 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowApplication(false)}
                    className="text-slate-500 hover:text-slate-700 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Application Details - {selectedApplication.user?.username}
                  </h3>
                </div>
                <button
                  onClick={() => setShowApplication(false)}
                  className="text-slate-500 hover:text-slate-700 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                {/* Application Summary */}
                <div className="bg-white rounded-xl p-6 mb-6 border border-slate-100 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* User */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900">{selectedApplication.user?.username}</h4>
                      <p className="text-sm text-slate-500">Application ID: {selectedApplication.id}</p>
                    </div>

                    {/* Score */}
                    <div className="text-center">
                      <div className="mb-3">
                        <Star className="w-8 h-8 text-yellow-500 mx-auto" />
                      </div>
                      <p className="text-sm text-slate-500">Application Score</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {selectedApplication.score?.toFixed(1) || "N/A"}
                      </p>
                    </div>

                    {/* Applied On */}
                    <div className="text-center">
                      <div className="mb-3">
                        <Calendar className="w-8 h-8 text-indigo-600 mx-auto" />
                      </div>
                      <p className="text-sm text-slate-500">Applied On</p>
                      <p className="text-sm font-medium text-slate-900">
                        {formatDateTime(selectedApplication.applied_at)}
                      </p>
                    </div>

                    {/* Decision */}
                    <div className="text-center">
                      <div className="mb-3">
                        <Target className="w-8 h-8 text-green-600 mx-auto" />
                      </div>
                      <p className="text-sm text-slate-500">Decision</p>
                      <div className="flex justify-center mt-2">
                        {getDecisionBadge(selectedApplication.shortlisting_decision)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feedback */}
                {selectedApplication.feedback && (
                  <div className="bg-white rounded-xl p-6 mb-6 border border-slate-100">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-violet-700" /> Application Feedback
                    </h4>
                    <div className="bg-blue-50 border-l-4 border-blue-300 p-4 rounded">
                      <p className="text-slate-700 leading-relaxed">{selectedApplication.feedback}</p>
                    </div>
                  </div>
                )}

                {/* Resume Section */}
                <div className="bg-white rounded-xl p-6 border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" /> Resume
                    </h4>
                    <div className="flex bg-slate-100 rounded-lg p-1">
                      <button
                        onClick={() => setResumeView("extracted")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${resumeView === "extracted" ? "bg-violet-600 text-white shadow" : "text-slate-600 hover:text-slate-800 hover:bg-slate-200"}`}
                      >
                        Extracted Resume
                      </button>
                      <button
                        onClick={() => setResumeView("original")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${resumeView === "original" ? "bg-violet-600 text-white shadow" : "text-slate-600 hover:text-slate-800 hover:bg-slate-200"}`}
                      >
                        Original Resume
                      </button>
                    </div>
                  </div>

                  {/* Resume Content */}
                  {resumeView === "extracted" ? (
                    <div className="space-y-8">
                      {selectedApplication.extractedResume ? (
                        (() => {
                          const parsedResume = parseExtractedResume(selectedApplication.extractedResume);
                          return (
                            <div className="grid grid-cols-1 gap-6">
                              {renderResumeSection("Personal Details", parsedResume?.personalDetails, <User className="w-5 h-5 text-blue-600" />)}
                              {renderResumeSection("Skills", parsedResume?.skills, <Code className="w-5 h-5 text-purple-600" />)}
                              {renderResumeSection("Experience", parsedResume?.experience, <Briefcase className="w-5 h-5 text-green-600" />)}
                              {renderResumeSection("Education", parsedResume?.education, <GraduationCap className="w-5 h-5 text-indigo-600" />)}
                              {renderResumeSection("Projects", parsedResume?.projects, <Code className="w-5 h-5 text-orange-600" />)}
                              {renderResumeSection("Certifications", parsedResume?.certifications, <Award className="w-5 h-5 text-red-600" />)}
                              {renderResumeSection("Achievements", parsedResume?.achievements, <Trophy className="w-5 h-5 text-yellow-600" />)}
                            </div>
                          );
                        })()
                      ) : (
                        <div className="bg-slate-50 rounded-lg p-8 text-center">
                          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-600">No extracted resume data available</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Original Resume */
                    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                      {selectedApplication.resume ? (
                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                          <p className="text-slate-600 text-sm mb-4">
                            View the embedded resume or click download to access the original PDF.
                          </p>
                          <div className="aspect-[4/5] bg-white rounded-lg border border-slate-300 overflow-hidden">
                            <iframe
                              src={`https://docs.google.com/gview?url=${encodeURIComponent(selectedApplication.resume)}&embedded=true`}
                              className="w-full h-full"
                              frameBorder="0"
                              title="Resume PDF"
                            ></iframe>
                          </div>
                          <div className="mt-4 flex justify-center">
                            <a
                              href={selectedApplication.resume}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Download Original
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 rounded-lg p-8 text-center">
                          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-600">No original resume available</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Leaderboard;
