import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Play, Send, CheckCircle, XCircle, Code, AlertCircle } from 'lucide-react';
import { getAuthToken, fetchWithToken } from '../utils/handleToken';
import { useParams,useNavigate } from 'react-router-dom';
// Import token utilities (you'll need to add these to your project)


const TIME_LIMIT = 30 * 60; // 30 minutes in seconds
const LANGUAGES = ['Python', 'C++', 'Java'];
const CODE_TEMPLATES = {
  Python: `# Write your solution here
def solution():
    # Your code here
    pass

# Test your solution
if __name__ == "__main__":
    result = solution()
    print(result)`,
  'C++': `#include <iostream>
#include <vector>
using namespace std;

// Write your solution here
int solution() {
    // Your code here
    return 0;
}

int main() {
    int result = solution();
    cout << result << endl;
    return 0;
}`,
  Java: `public class Solution {
    // Write your solution here
    public static int solution() {
        // Your code here
        return 0;
    }
    
    public static void main(String[] args) {
        int result = solution();
        System.out.println(result);
    }
}`
};

const DSAInterviewPlatform = ({  navigate }) => {
  
  const params = useParams();
  const nav=useNavigate();
  const { sessionId } = params;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [dsaTopics, setDsaTopics] = useState([]); // Backend topics
  const [code, setCode] = useState(CODE_TEMPLATES.Python);
  const [selectedLanguage, setSelectedLanguage] = useState('Python');
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [submittedQuestions, setSubmittedQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [runResult, setRunResult] = useState(null);
  const [runsLeft, setRunsLeft] = useState({});
  const [error, setError] = useState(null);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleFinalSubmit(); // This now navigates directly
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch DSA topics from backend
  const fetchDSATopics = async () => {
    const token = getAuthToken();
    if (!token) {
      setError('Authentication required');
      return [];
    }

    try {
      const data = await fetchWithToken(
        `http://localhost:8000/api/interview/get-dsa-questions/${sessionId}/`,
        token,
        navigate,
      );
      console.log(data);
      if (data.length===0) {
        console.log('Fetched DSA topics:', data);
        nav('/');
        return data;
      }
      return data;
    } catch (error) {
      nav('/');
      console.error('Error fetching DSA topics:', error);
      setError('Failed to fetch DSA topics');
      return [];
    }
  };

  const callGroqAPI = async (prompt) => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Groq API Error:', error);
      setError('Failed to connect to API. Please check your connection.');
      return null;
    }
  };

  const generateQuestion = async (topic, difficulty) => {
    const prompt = `Generate a DSA coding problem for topic: ${topic} with difficulty: ${difficulty}. 
    Respond ONLY with a valid JSON object in this exact format, with no additional text, markdown, or explanations:
    {
      "title": "Problem Title",
      "description": "Problem description with clear constraints, examples, and what the function should do. Include input/output format.",
      "testCases": [
        {"input": "input1", "output": "expected_output1", "description": "test case 1 description"},
        {"input": "input2", "output": "expected_output2", "description": "test case 2 description"},
        {"input": "input3", "output": "expected_output3", "description": "test case 3 description"}
      ],
      "sampleInput": "sample input for testing",
      "sampleOutput": "expected sample output",
      "difficulty": "${difficulty}",
      "hints": ["hint1", "hint2"]
    }
    
    Make sure:
    1. The problem is clear and has examples
    2. Test cases cover edge cases
    3. Input/output format is specified
    4. Problem is language-agnostic
    5. Difficulty level matches: ${difficulty}`;

    const response = await callGroqAPI(prompt);
    if (response) {
      try {
        // Clean response to extract JSON
        let cleanResponse = response.trim();
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        const jsonStart = cleanResponse.indexOf('{');
        const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
        if (jsonStart === -1 || jsonEnd === 0) {
          throw new Error('No valid JSON found in response');
        }
        cleanResponse = cleanResponse.slice(jsonStart, jsonEnd);
        
        const parsedQuestion = JSON.parse(cleanResponse);
        if (!parsedQuestion.title || !parsedQuestion.description || !parsedQuestion.testCases) {
          throw new Error('Invalid question format');
        }
        
        return parsedQuestion;
      } catch (e) {
        console.error('Failed to parse question JSON:', e, 'Response:', response);
        return null;
      }
    }
    return null;
  };

  const initializeQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Fetch DSA topics from backend
    const backendTopics = await fetchDSATopics();
    if (!backendTopics || backendTopics.length === 0) {
      setError('No DSA topics found for this session');
      setLoading(false);
      return;
    }

    setDsaTopics(backendTopics);
    
    // Generate questions for each topic
    const generatedQuestions = [];
    
    for (let i = 0; i < Math.min(backendTopics.length, 3); i++) {
      const dsaTopic = backendTopics[i];
      const question = await generateQuestion(dsaTopic.topic, dsaTopic.difficulty);
      if (question) {
        generatedQuestions.push({ 
          ...question, 
          topic: dsaTopic.topic,
          difficulty: dsaTopic.difficulty,
          dsaTopicId: dsaTopic.id,
          id: i 
        });
      } else {
        generatedQuestions.push({
          id: i,
          topic: dsaTopic.topic,
          difficulty: dsaTopic.difficulty,
          dsaTopicId: dsaTopic.id,
          title: `${dsaTopic.topic.charAt(0).toUpperCase() + dsaTopic.topic.slice(1)} Problem`,
          description: `Solve a ${dsaTopic.topic} related problem with ${dsaTopic.difficulty} difficulty. Implement the solution function.`,
          testCases: [
            { input: "test1", output: "result1", description: "Basic test case" },
            { input: "test2", output: "result2", description: "Edge case" },
            { input: "test3", output: "result3", description: "Complex case" }
          ],
          sampleInput: "sample",
          sampleOutput: "expected",
          hints: ["Consider the problem constraints", "Think about edge cases"]
        });
      }
    }
    
    if (generatedQuestions.length === 0) {
      setError('Failed to generate questions. Please refresh the page.');
    } else {
      setQuestions(generatedQuestions);
      setCode(CODE_TEMPLATES.Python);
      const initialRuns = {};
      generatedQuestions.forEach((_, index) => {
        initialRuns[index] = 3;
      });
      setRunsLeft(initialRuns);
    }
    
    setLoading(false);
  }, [sessionId, navigate]);

  useEffect(() => {
    if (sessionId) {
      initializeQuestions();
    } else {
      setError('Session ID is required');
    }
  }, [initializeQuestions, sessionId]);

  const runSingleTest = async () => {
    if (!questions[currentQuestionIndex]) return;
    
    const remainingRuns = runsLeft[currentQuestionIndex] || 0;
    if (remainingRuns <= 0) {
      setRunResult({
        isOutput: false,
        message: 'No runs left for this question'
      });
      return;
    }
    
    setIsTestRunning(true);
    setRunResult(null);
    const question = questions[currentQuestionIndex];
    
    const prompt = `Execute this ${selectedLanguage} code with the given input and return ONLY the output.

    CRITICAL INSTRUCTIONS:
    - Run the code with the provided input
    - Return ONLY the actual output that the code produces
    - Do NOT include any explanations, descriptions, or additional text
    - Do NOT say "Output:" or "Result:" - just return the raw output
    - If there's an error, return only the error message

    Code:
    ${code}

    Input: ${question.sampleInput}

    Execute and return only the output:`;

    const result = await callGroqAPI(prompt);
    
    setRunsLeft(prev => ({
      ...prev,
      [currentQuestionIndex]: remainingRuns - 1
    }));
    
    if (result) {
      setRunResult({
        isOutput: true,
        message: result.trim(),
        expected: question.sampleOutput
      });
    } else {
      setRunResult({
        isOutput: false,
        message: 'Failed to execute code'
      });
    }
    setIsTestRunning(false);
  };

  const submitQuestion = async () => {
    if (!questions[currentQuestionIndex]) return;
    
    setIsTestRunning(true);
    setTestResult(null);
    const question = questions[currentQuestionIndex];
    
    let passedTests = 0;
    const testResults = [];
    
    for (let i = 0; i < question.testCases.length; i++) {
      const testCase = question.testCases[i];
      
      const prompt = `Execute this ${selectedLanguage} code with the given test case.

      CRITICAL: Respond ONLY with:
      - "PASS" (if code executes correctly and output matches expected)
      - "FAIL: [brief reason]" (if code fails or output is wrong)

      Do NOT include code descriptions, explanations, or additional commentary.

      Code:
      ${code}

      Test Input: ${testCase.input}
      Expected Output: ${testCase.output}

      Execute the code and compare actual output with expected output.`;
      
      const result = await callGroqAPI(prompt);
      if (result) {
        const passed = result.trim().toUpperCase().startsWith('PASS');
        if (passed) passedTests++;
        testResults.push({
          passed,
          message: result.trim(),
          testCase: testCase.description
        });
      } else {
        testResults.push({
          passed: false,
          message: 'Test execution failed',
          testCase: testCase.description
        });
      }
    }
    
    const allPassed = passedTests === question.testCases.length;
    const questionScore = allPassed ? 10 : Math.floor((passedTests / question.testCases.length) * 10);
    
    // Submit to backend
    await submitToBackend(question, questionScore);
    
    const newSubmission = {
      questionIndex: currentQuestionIndex,
      questionId: question.id,
      dsaTopicId: question.dsaTopicId,
      code,
      testResults,
      passedTests,
      totalTests: question.testCases.length,
      score: questionScore,
      allPassed,
      title: question.title,
      topic: question.topic
    };
    
    const updatedSubmissions = submittedQuestions.filter(sub => sub.questionIndex !== currentQuestionIndex);
    updatedSubmissions.push(newSubmission);
    setSubmittedQuestions(updatedSubmissions);
    
    const totalScore = updatedSubmissions.reduce((acc, sub) => acc + sub.score, 0);
    setScore(totalScore);
    
    setTestResult(newSubmission);
    setIsTestRunning(false);
  };

  const submitToBackend = async (question, questionScore) => {
    const token = getAuthToken();
    if (!token) {
      console.error('No auth token found');
      return;
    }

    try {
      const submissionData = {
        question: JSON.stringify({
          title: question.title,
          description: question.description,
          topic: question.topic,
          difficulty: question.difficulty
        }),
        code: code,
        score: questionScore
      };

      const response = await fetchWithToken(
        `http://localhost:8000/api/interview/add-dsa-scores/${sessionId}/${question.dsaTopicId}/`,
        token,
        navigate,
        'POST',
        submissionData
      );

      if (response) {
        console.log('Successfully submitted to backend:', response);
      } else {
        console.error('Failed to submit to backend');
      }
    } catch (error) {
      console.error('Error submitting to backend:', error);
    }
  };

  const handleQuestionSelect = (index) => {
    if (index === currentQuestionIndex) return;
    
    setCurrentQuestionIndex(index);
    const submitted = submittedQuestions.find(sub => sub.questionIndex === index);
    
    if (submitted) {
      setCode(submitted.code);
      setTestResult(submitted);
    } else {
      setCode(CODE_TEMPLATES[selectedLanguage]);
      setTestResult(null);
    }
    setRunResult(null);
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);
    
    const isSubmitted = submittedQuestions.some(sub => sub.questionIndex === currentQuestionIndex);
    if (!isSubmitted) {
      setCode(CODE_TEMPLATES[newLanguage]);
    }
    
    setTestResult(null);
    setRunResult(null);
  };

  const handleFinalSubmit = () => {
    
    
    const finalResults = {
      sessionId,
      totalScore: score,
      maxScore: questions.length * 10,
      questionsAttempted: submittedQuestions.length,
      questionsTotal: questions.length,
      timeUsed: TIME_LIMIT - timeLeft,
      timeLimit: TIME_LIMIT,
      submissions: submittedQuestions.map(sub => ({
        dsaTopicId: sub.dsaTopicId,
        questionId: sub.questionId,
        topic: sub.topic,
        title: sub.title,
        code: sub.code,
        score: sub.score,
        passed: sub.allPassed,
        testsPassed: sub.passedTests,
        totalTests: sub.totalTests
      })),
      timestamp: new Date().toISOString()
    };
    
    console.log('Final Interview Results:', finalResults);
    nav('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/50 to-white flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements matching Home page */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-60 h-60 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-200/20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/20 to-sky-400/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-lg text-slate-700">Loading interview session...</p>
          <p className="text-sm text-slate-500 mt-2">Fetching DSA topics and generating questions</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/50 to-white flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements matching Home page */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-60 h-60 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-200/20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/20 to-sky-400/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="text-center bg-white/70 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/30 max-w-md relative z-10 hover:scale-[1.01] transition-all duration-700">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              initializeQuestions();
            }}
            className="px-4 py-2 bg-gradient-to-r from-violet-400 to-indigo-500 hover:from-violet-500 hover:to-indigo-600 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/50 to-white flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements matching Home page */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-60 h-60 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-200/20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/20 to-sky-400/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="text-center relative z-10">
          <p className="text-lg text-slate-700">No questions available for this session.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isSubmitted = submittedQuestions.some(sub => sub.questionIndex === currentQuestionIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/50 to-white relative overflow-hidden">
      {/* Animated background elements matching Home page */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-60 h-60 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-200/20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/20 to-sky-400/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-gradient-to-br from-red-400/10 to-amber-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm shadow-lg border-b border-white/30 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">DSA Interview Platform</h1>
              <p className="text-sm text-slate-600">Session ID: {sessionId}</p>
            </div>
            <div className="flex items-center space-x-6 mt-2 sm:mt-0">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-slate-600" />
                <span className={`text-lg font-mono font-bold ${
                  timeLeft < 300 ? 'text-red-500' : timeLeft < 600 ? 'text-yellow-500' : 'text-green-600'
                }`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="text-lg font-semibold">
                Score: <span className="bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">{score}/{questions.length * 10}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Question Navigation */}
        <div className="mb-6 flex flex-wrap gap-2">
          {questions.map((q, index) => {
            const submission = submittedQuestions.find(sub => sub.questionIndex === index);
            return (
              <button
                key={index}
                onClick={() => handleQuestionSelect(index)}
                className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                  currentQuestionIndex === index
                    ? 'bg-gradient-to-r from-violet-400 to-indigo-500 text-white border-violet-400 shadow-lg'
                    : submission
                    ? submission.allPassed
                      ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 shadow-md'
                      : 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200 shadow-md'
                    : 'bg-white/70 backdrop-blur-sm text-slate-700 border-white/30 hover:bg-white/90 shadow-md hover:scale-105'
                }`}
              >
                <div className="font-medium">Q{index + 1}</div>
                <div className="text-xs opacity-75">{q.topic}</div>
                <div className="text-xs opacity-75">{q.difficulty}</div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Question Panel */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 hover:scale-[1.01] transition-all duration-700">
            <div className="p-6 border-b border-white/30">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-1">{currentQuestion.title}</h2>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="px-2 py-1 bg-gradient-to-r from-violet-100 to-indigo-100 text-indigo-800 rounded-lg">
                      {currentQuestion.difficulty}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-600 capitalize">{currentQuestion.topic}</span>
                  </div>
                </div>
                {isSubmitted && (
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-lg ${
                    testResult.allPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {testResult.allPassed ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    <span className="text-sm font-medium">
                      {testResult.allPassed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Problem Description</h3>
                <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {currentQuestion.description}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Sample Test Case</h3>
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 space-y-2 font-mono text-sm border border-white/30">
                  <div><span className="text-slate-600">Input:</span> <span className="text-slate-800">{currentQuestion.sampleInput}</span></div>
                  <div><span className="text-gray-600">Output:</span> <span className="text-slate-800">{currentQuestion.sampleOutput}</span></div>
                </div>
              </div>

              {currentQuestion.hints && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Hints</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 text-sm">
                    {currentQuestion.hints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {runResult && (
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <h4 className="font-medium text-slate-800 mb-2">
                    Your Output: ({runsLeft[currentQuestionIndex] || 0} runs left)
                  </h4>
                  {runResult.isOutput ? (
                    <div className="space-y-2">
                      <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg border border-white/30 font-mono text-sm">
                        <div className="text-slate-600 text-xs mb-1">Actual:</div>
                        <div className="text-slate-900">{runResult.message}</div>
                      </div>
                      <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg border border-white/30 font-mono text-sm">
                        <div className="text-slate-600 text-xs mb-1">Expected:</div>
                        <div className="text-slate-900">{runResult.expected}</div>
                      </div>
                      <div className={`text-sm ${
                        runResult.message.trim() === runResult.expected.trim() 
                          ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {String(runResult.message).trim() === String(runResult.expected).trim()
                          ? '✓ Output matches expected' 
                          : '⚠ Output differs from expected'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-600 text-sm">{runResult.message}</div>
                  )}
                </div>
              )}

              {testResult && (
                <div className={`p-4 rounded-xl border ${
                  testResult.allPassed 
                    ? 'bg-green-50/70 backdrop-blur-sm border-green-200/50 text-green-800' 
                    : 'bg-red-50/70 backdrop-blur-sm border-red-200/50 text-red-800'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {testResult.allPassed ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      <span className="font-medium">
                        {testResult.allPassed ? 'All Tests Passed!' : 'Some Tests Failed'}
                      </span>
                    </div>
                    <span className="font-bold">
                      {testResult.passedTests}/{testResult.totalTests} tests passed
                    </span>
                  </div>
                  <div className="text-sm">
                    Score: <span className="font-bold">{testResult.score}/10 points</span>
                  </div>
                </div>
              )}
            </div>
          </div>

                     {/* Code Editor Panel */}
           <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 hover:scale-[1.01] transition-all duration-700">
             <div className="p-6 border-b border-white/30">
               <div className="flex items-center justify-between">
                 <h3 className="text-lg font-bold text-slate-800 flex items-center">
                   <Code className="h-5 w-5 mr-2" />
                   Code Editor
                 </h3>
                 <select
                   value={selectedLanguage}
                   onChange={handleLanguageChange}
                   className="border border-white/30 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80 backdrop-blur-sm text-slate-800"
                   disabled={isSubmitted}
                 >
                   {LANGUAGES.map(lang => (
                     <option key={lang} value={lang}>{lang}</option>
                   ))}
                 </select>
               </div>
             </div>
            
                         <div className="p-6">
               <textarea
                 value={code}
                 onChange={(e) => setCode(e.target.value)}
                 className="w-full h-96 bg-white/80 backdrop-blur-sm text-slate-900 p-4 rounded-xl font-mono text-sm resize-none border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                 placeholder="Write your solution here..."
                 disabled={isSubmitted}
               />
               
               <div className="flex space-x-3 mt-4">
                 <button
                   onClick={runSingleTest}
                   disabled={isTestRunning || isSubmitted || !code.trim() || (runsLeft[currentQuestionIndex] || 0) <= 0}
                   className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                 >
                   <Play className="h-4 w-4 mr-2" />
                   {isTestRunning ? 'Running...' : `Run (${runsLeft[currentQuestionIndex] || 0} left)`}
                 </button>
                 
                 <button
                   onClick={submitQuestion}
                   disabled={isTestRunning || isSubmitted || !code.trim()}
                   className="flex items-center px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                 >
                   <Send className="h-4 w-4 mr-2" />
                   {isTestRunning ? 'Testing...' : isSubmitted ? 'Submitted' : 'Submit Solution'}
                 </button>
               </div>
             </div>
          </div>
        </div>

                 {/* Final Submit Section */}
         <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6 hover:scale-[1.01] transition-all duration-700">
           <div className="flex items-center justify-between">
             <div>
               <h3 className="text-lg font-semibold text-slate-800">Interview Progress</h3>
               <p className="text-slate-600">
                 {submittedQuestions.length} of {questions.length} questions completed • 
                 Score: {score}/{questions.length * 10}
               </p>
             </div>
             
             {submittedQuestions.length > 0 && (
               <button
                 onClick={handleFinalSubmit}
                 className="px-6 py-3 bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white rounded-xl disabled:bg-gray-400 font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                 disabled={isTestRunning}
               >
                 Final Submit
               </button>
             )}
           </div>
           
           <div className="mt-4">
             <div className="w-full bg-white/50 rounded-full h-2">
               <div
                 className="bg-gradient-to-r from-violet-400 to-indigo-500 h-2 rounded-full transition-all duration-300"
                 style={{ width: `${(submittedQuestions.length / questions.length) * 100}%` }}
               ></div>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
};

export default DSAInterviewPlatform;