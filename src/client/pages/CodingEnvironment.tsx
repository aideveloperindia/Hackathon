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
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const autoSubmitRef = useRef(false);

  // Define moveToNextQuestion first to avoid circular dependency
  const moveToNextQuestion = useCallback(() => {
    if (!event || !selectedQuestion) return;
    
    const currentIndex = event.questions.findIndex((q: any) => q.id === selectedQuestion.id);
    if (currentIndex < event.questions.length - 1) {
      const nextQuestion = event.questions[currentIndex + 1];
      setSelectedQuestion(nextQuestion);
      setCode('');
      setSubmissionResult(null);
      setAutoSubmitted(false);
      autoSubmitRef.current = false;
      
      // Start timer for next question
      const startTime = Date.now();
      setQuestionStartTime(startTime);
      localStorage.setItem(`question_start_${eventId}_${nextQuestion.id}`, startTime.toString());
      
      // Set remaining time for next question
      if (nextQuestion.timeLimitMinutes) {
        const timeLimitSeconds = nextQuestion.timeLimitMinutes * 60;
        setRemainingTime(timeLimitSeconds);
      }
    } else {
      // No more questions
      alert('All questions completed! Redirecting to dashboard...');
      navigate('/student/dashboard');
    }
  }, [event, selectedQuestion, eventId, navigate]);

  const handleAutoSubmit = useCallback(async () => {
    if (autoSubmitRef.current || !selectedQuestion) return;
    
    // Save code even if empty
    if (selectedQuestion) {
      localStorage.setItem(`code_${eventId}_${selectedQuestion.id}`, code);
    }
    
    // If no code, just move to next question
    if (!code.trim()) {
      setTimeout(() => {
        moveToNextQuestion();
      }, 1000);
      return;
    }
    
    autoSubmitRef.current = true;
    setAutoSubmitted(true);
    setSubmitting(true);
    
    try {
      const response = await api.post(`/submissions/events/${eventId}/questions/${selectedQuestion.id}`, {
        code,
        language: event?.language || 'python',
      });

      setSubmissionResult(response.data.submission);
      
      // Move to next question after 2 seconds
      setTimeout(() => {
        moveToNextQuestion();
      }, 2000);
    } catch (error: any) {
      console.error('Auto-submit error:', error);
      // Still move to next question even if submission fails
      setTimeout(() => {
        moveToNextQuestion();
      }, 2000);
    } finally {
      setSubmitting(false);
    }
  }, [selectedQuestion, code, eventId, event?.language, moveToNextQuestion]);

  const fetchEventData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/events/${eventId}`);
      const eventData = response.data.event;
      
      if (!eventData) {
        alert('Event not found');
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
        if (savedCode) {
          setCode(savedCode);
        }
        
        // Start timer for first question
        const storedStartTime = localStorage.getItem(`question_start_${eventId}_${firstQuestion.id}`);
        if (storedStartTime) {
          setQuestionStartTime(parseInt(storedStartTime));
        } else {
          const startTime = Date.now();
          setQuestionStartTime(startTime);
          localStorage.setItem(`question_start_${eventId}_${firstQuestion.id}`, startTime.toString());
        }
        // Initialize remaining time
        if (firstQuestion.timeLimitMinutes) {
          const elapsed = storedStartTime ? Math.floor((Date.now() - parseInt(storedStartTime)) / 1000) : 0;
          const timeLimitSeconds = firstQuestion.timeLimitMinutes * 60;
          setRemainingTime(Math.max(0, timeLimitSeconds - elapsed));
        }
      } else {
        alert('This event has no questions yet. Please contact the administrator.');
        navigate('/student/dashboard');
      }
    } catch (error: any) {
      console.error('Error fetching event:', error);
      const errorMessage = error.response?.data?.error || 'Failed to load event';
      alert(errorMessage);
      navigate('/student/dashboard');
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

  // Timer for question time limit
  useEffect(() => {
    const interval = setInterval(() => {
      if (questionStartTime && selectedQuestion?.timeLimitMinutes) {
        const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
        const timeLimitSeconds = selectedQuestion.timeLimitMinutes * 60;
        const remaining = Math.max(0, timeLimitSeconds - elapsed);
        setRemainingTime(remaining);
        
        // Auto-submit when time expires (even if code is empty)
        if (remaining === 0 && !autoSubmitRef.current) {
          handleAutoSubmit();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [questionStartTime, selectedQuestion, code, handleAutoSubmit]);


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
      });

      setSubmissionResult(response.data.submission);
      if (response.data.submission.verdict === 'ACCEPTED') {
        alert('Congratulations! Your solution is correct!');
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
    setAutoSubmitted(false);
    
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
      setQuestionStartTime(parseInt(storedStartTime));
      const elapsed = Math.floor((Date.now() - parseInt(storedStartTime)) / 1000);
      const timeLimitSeconds = question.timeLimitMinutes * 60;
      setRemainingTime(Math.max(0, timeLimitSeconds - elapsed));
    } else {
      const startTime = Date.now();
      setQuestionStartTime(startTime);
      localStorage.setItem(`question_start_${eventId}_${question.id}`, startTime.toString());
      if (question.timeLimitMinutes) {
        const timeLimitSeconds = question.timeLimitMinutes * 60;
        setRemainingTime(timeLimitSeconds);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
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
              {selectedQuestion ? `Time Remaining (Q${event.questions.findIndex((q: any) => q.id === selectedQuestion.id) + 1})` : 'Time Remaining'}
            </div>
            <div className={`text-2xl font-bold ${
              remainingTime !== null && remainingTime < 60 ? 'text-red-600' : 
              remainingTime !== null && remainingTime < 300 ? 'text-orange-600' : 
              'text-gray-800'
            }`}>
              {remainingTime !== null ? formatTime(remainingTime) : 'N/A'}
            </div>
            {selectedQuestion?.timeLimitMinutes && (
              <div className="text-xs text-gray-500 mt-1">
                Limit: {selectedQuestion.timeLimitMinutes} min
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
                  {q.timeLimitMinutes && (
                    <div className="text-sm text-gray-600 mt-1">Time Limit: {q.timeLimitMinutes} minutes</div>
                  )}
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
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !code.trim() || (remainingTime !== null && remainingTime <= 0)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : remainingTime !== null && remainingTime <= 0 ? 'Time Up! (Auto-submitted)' : 'Submit Code'}
            </button>
            
            {remainingTime !== null && remainingTime <= 0 && autoSubmitted && (
              <div className="mt-2 text-sm text-orange-600 font-semibold">
                ⏰ Time expired! Answer auto-saved. Moving to next question...
              </div>
            )}

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

