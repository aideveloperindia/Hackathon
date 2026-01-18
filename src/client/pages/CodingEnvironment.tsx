import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../utils/api';

export default function CodingEnvironment() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('python');
  const [elapsedTime, setElapsedTime] = useState<number>(0); // Timer that counts up
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Start with true to show loading initially
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testOutput, setTestOutput] = useState<string>('');
  const [testInput, setTestInput] = useState<string>('');
  const [timerRunning, setTimerRunning] = useState<boolean>(true);

  // Define moveToNextQuestion first to avoid circular dependency
  const moveToNextQuestion = useCallback(() => {
    if (!event || !selectedQuestion) return;
    
    const currentIndex = event.questions.findIndex((q: any) => q.id === selectedQuestion.id);
    if (currentIndex < event.questions.length - 1) {
      const nextQuestion = event.questions[currentIndex + 1];
      setSelectedQuestion(nextQuestion);
      setCode('');
      setSubmissionResult(null);
      setTestOutput('');
      setTestInput('');
      
      // Reset timer for next question
      const startTime = Date.now();
      setQuestionStartTime(startTime);
      setElapsedTime(0);
      setTimerRunning(true);
      localStorage.setItem(`question_start_${eventId}_${nextQuestion.id}`, startTime.toString());
    } else {
      // No more questions
      alert('All questions completed! Redirecting to dashboard...');
      navigate('/student/dashboard');
    }
  }, [event, selectedQuestion, eventId, navigate]);


  const fetchEventData = useCallback(async () => {
    if (!eventId) {
      console.error('No eventId provided');
      navigate('/student/dashboard');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching event data for eventId:', eventId);
      const response = await api.get(`/events/${eventId}`);
      console.log('Event response:', response.data);
      const eventData = response.data.event;
      
      if (!eventData) {
        console.error('Event data not found in response');
        alert('Event not found');
        setLoading(false);
        navigate('/student/dashboard');
        return;
      }
      
      setEvent(eventData);
      
      if (eventData.questions && eventData.questions.length > 0) {
        const firstQuestion = eventData.questions[0];
        setSelectedQuestion(firstQuestion);
        setLanguage(eventData.language.toLowerCase());
        
        // Load saved code for first question if exists
        const savedCode = localStorage.getItem(`code_${eventId}_${firstQuestion.id}`);
        setCode(savedCode || ''); // Always set code, even if empty
        console.log('Code initialized:', savedCode ? 'from localStorage' : 'empty string');
        
        // Start timer for first question
        const storedStartTime = localStorage.getItem(`question_start_${eventId}_${firstQuestion.id}`);
        if (storedStartTime) {
          setQuestionStartTime(parseInt(storedStartTime));
        } else {
          const startTime = Date.now();
          setQuestionStartTime(startTime);
          localStorage.setItem(`question_start_${eventId}_${firstQuestion.id}`, startTime.toString());
        }
        // Initialize elapsed time
        if (storedStartTime) {
          const elapsed = Math.floor((Date.now() - parseInt(storedStartTime)) / 1000);
          setElapsedTime(elapsed);
        } else {
          setElapsedTime(0);
        }
        setTimerRunning(true);
      } else {
        alert('This event has no questions yet. Please contact the administrator.');
        setLoading(false);
        navigate('/student/dashboard');
        return;
      }
    } catch (error: any) {
      console.error('Error fetching event:', error);
      console.error('Error response:', error.response);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load event';
      console.error('Error message:', errorMessage);
      setLoading(false);
      // Show error but don't navigate immediately - let user see the error
      alert(`Error loading event: ${errorMessage}\n\nPlease check:\n1. Event exists and is ACTIVE\n2. You have joined the event\n3. Network connection is working`);
    } finally {
      setLoading(false);
    }
  }, [eventId, navigate]);

  // Fetch event data on mount
  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  // Auto-save code periodically
  useEffect(() => {
    if (selectedQuestion && code.trim()) {
      const saveInterval = setInterval(() => {
        localStorage.setItem(`code_${eventId}_${selectedQuestion.id}`, code);
      }, 30000); // Auto-save every 30 seconds

      return () => clearInterval(saveInterval);
    }
  }, [code, selectedQuestion, eventId]);

  // Timer that counts up (no limit, stops when code is correct)
  useEffect(() => {
    if (!timerRunning || !questionStartTime) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [questionStartTime, timerRunning]);


  const handleTestCode = async () => {
    if (!code.trim()) {
      alert('Please write some code before testing');
      return;
    }

    // Validate code is not just a number or output value
    const trimmedCode = code.trim();
    if (/^\d+$/.test(trimmedCode)) {
      alert('Please write actual code, not just the output number. For example:\n\na = int(input())\nb = int(input())\nprint(a + b)');
      return;
    }

    console.log('Testing code:', { code: trimmedCode.substring(0, 100), language: event.language, input: testInput });
    setTesting(true);
    setTestOutput('');

    try {
      const response = await api.post('/submissions/test', {
        code: trimmedCode,
        language: event.language.toLowerCase(),
        input: testInput,
      });

      console.log('Test response:', response.data);
      setTestOutput(response.data.output || 'No output');
    } catch (error: any) {
      console.error('Test code error:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Execution failed';
      setTestOutput(`Error: ${errorMsg}`);
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Please write some code before submitting');
      return;
    }

    if (!selectedQuestion) {
      alert('Please select a question');
      return;
    }

    setSubmitting(true);
    setSubmissionResult(null);

    try {
      const response = await api.post(`/submissions/events/${eventId}/questions/${selectedQuestion.id}`, {
        code,
        language: event.language,
        questionStartTime: questionStartTime || Date.now(),
      });

      setSubmissionResult(response.data.submission);
      
      // Stop timer if code is correct and matches admin's answer (locked)
      if (response.data.submission.verdict === 'ACCEPTED') {
        setTimerRunning(false);
        const isLocked = response.data.submission.executionDetails?.some((detail: any) => 
          detail.matchesCorrectAnswer === true
        ) || response.data.submission.matchesCorrectAnswer;
        
        if (isLocked) {
          alert(`🎉 Perfect! Your answer matches the correct solution and is now LOCKED! Time taken: ${formatTime(response.data.submission.timeTakenSeconds || elapsedTime)}`);
        } else {
          alert(`Congratulations! Your solution is correct! Time taken: ${formatTime(response.data.submission.timeTakenSeconds || elapsedTime)}`);
        }
      }
      
      // Option to move to next question after manual submit
      const shouldMove = window.confirm('Move to next question?');
      if (shouldMove) {
        moveToNextQuestion();
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuestionSelect = (question: any) => {
    // Save current code before switching
    if (code.trim() && selectedQuestion) {
      // Optionally auto-save code when switching questions
      localStorage.setItem(`code_${eventId}_${selectedQuestion.id}`, code);
    }
    
    setSelectedQuestion(question);
    setSubmissionResult(null);
    setTestOutput('');
    setTestInput('');
    
    // Load saved code for this question if exists
    const savedCode = localStorage.getItem(`code_${eventId}_${question.id}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode('');
    }
    
    // Start timer for selected question
    const storedStartTime = localStorage.getItem(`question_start_${eventId}_${question.id}`);
    if (storedStartTime) {
      const startTime = parseInt(storedStartTime);
      setQuestionStartTime(startTime);
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
    } else {
      const startTime = Date.now();
      setQuestionStartTime(startTime);
      setElapsedTime(0);
      localStorage.setItem(`question_start_${eventId}_${question.id}`, startTime.toString());
    }
    setTimerRunning(true);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event data...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <p className="text-red-600 mb-4 text-lg font-semibold">Failed to load event</p>
          <p className="text-gray-600 mb-4 text-sm">
            The event may not exist, may not be active, or you may not have joined it yet.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg mr-2"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!event.questions || event.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <p className="text-red-600 mb-4 text-lg font-semibold">No Questions Available</p>
          <p className="text-gray-600 mb-4">This event has no questions yet. Please contact the administrator.</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
            <p className="text-gray-600">{event.language}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">
              {selectedQuestion ? `Time Elapsed (Q${event.questions.findIndex((q: any) => q.id === selectedQuestion.id) + 1})` : 'Time Elapsed'}
            </div>
            <div className={`text-2xl font-bold ${
              timerRunning ? 'text-blue-600' : 'text-green-600'
            }`}>
              {formatTime(elapsedTime)}
            </div>
            {!timerRunning && (
              <div className="text-xs text-green-600 mt-1">
                ✓ Solution Accepted
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Left Panel - Questions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Questions</h2>
            <div className="space-y-2 mb-6">
              {event.questions.map((q: any, idx: number) => (
                <button
                  key={q.id}
                  onClick={() => handleQuestionSelect(q)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition duration-200 ${
                    selectedQuestion?.id === q.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-400'
                  }`}
                >
                  <div className="font-semibold text-gray-800">Question {idx + 1}: {q.title}</div>
                </button>
              ))}
            </div>

            {selectedQuestion && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{selectedQuestion.title}</h3>
                <div className="text-gray-700 mb-4 whitespace-pre-wrap">{selectedQuestion.description}</div>

                {selectedQuestion.sampleInput && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Sample Input:</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm">{selectedQuestion.sampleInput}</pre>
                  </div>
                )}

                {selectedQuestion.sampleOutput && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Sample Output:</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm">{selectedQuestion.sampleOutput}</pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Code Editor */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Code Editor</h2>
              <div className="text-sm text-gray-600 mb-4">
                Language: <span className="font-semibold">{event.language}</span>
              </div>
            </div>

            <div className="border border-gray-300 rounded-lg overflow-hidden mb-4" style={{ height: '400px' }}>
              <Editor
                height="100%"
                language={language}
                value={code}
                onChange={(value) => {
                  const newCode = value || '';
                  setCode(newCode);
                  // Auto-save to localStorage
                  if (selectedQuestion) {
                    localStorage.setItem(`code_${eventId}_${selectedQuestion.id}`, newCode);
                  }
                }}
                theme="vs-light"
                loading={<div className="flex items-center justify-center h-full text-gray-600"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div><p>Loading editor...</p></div></div>}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true,
                  readOnly: false, // Ensure editor is not read-only
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                }}
              />
            </div>

            {/* Test Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Input (Optional)
              </label>
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter test input here..."
              />
            </div>

            {/* Test Output */}
            {testOutput && (
              <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output:
                </label>
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">{testOutput}</pre>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={handleTestCode}
                disabled={testing || !code.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? 'Running...' : 'Run Code'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !code.trim()}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Code'}
              </button>
            </div>

            {submissionResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                submissionResult.verdict === 'ACCEPTED'
                  ? 'bg-green-50 border border-green-200'
                  : submissionResult.verdict === 'PARTIAL'
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className="font-bold text-gray-800 mb-2">Submission Result</h3>
                <p className="font-semibold mb-2">
                  Verdict: <span className={
                    submissionResult.verdict === 'ACCEPTED' ? 'text-green-600' :
                    submissionResult.verdict === 'PARTIAL' ? 'text-yellow-600' : 'text-red-600'
                  }>{submissionResult.verdict}</span>
                </p>
                <p className="text-gray-700">
                  Score: {submissionResult.score} | Passed: {submissionResult.passedTests}/{submissionResult.totalTests} test cases
                </p>
                {submissionResult.executionDetails && (
                  <div className="mt-2 text-sm">
                    {submissionResult.executionDetails.map((detail: any, idx: number) => (
                      <div key={idx} className={`p-2 mb-1 rounded ${
                        detail.passed ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        Test Case {detail.testCase}: {detail.passed ? '✓ Passed' : '✗ Failed'}
                        {detail.error && <div className="text-red-600 text-xs mt-1">{detail.error}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => navigate('/student/dashboard')}
              className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

