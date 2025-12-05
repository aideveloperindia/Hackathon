import { useState, useEffect } from 'react';
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
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEventData();
    const interval = setInterval(() => {
      if (remainingTime !== null && remainingTime > 0) {
        setRemainingTime(remainingTime - 1);
      } else if (remainingTime === 0) {
        alert('Time is up!');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime]);

  const fetchEventData = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      setEvent(response.data.event);
      setRemainingTime(response.data.event.remainingTime);
      if (response.data.event.questions.length > 0) {
        setSelectedQuestion(response.data.event.questions[0]);
        setLanguage(response.data.event.language.toLowerCase());
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to load event');
      navigate('/student/dashboard');
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
      });

      setSubmissionResult(response.data.submission);
      if (response.data.submission.verdict === 'ACCEPTED') {
        alert('Congratulations! Your solution is correct!');
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
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
            <div className="text-sm text-gray-600 mb-1">Time Remaining</div>
            <div className={`text-2xl font-bold ${remainingTime && remainingTime < 300 ? 'text-red-600' : 'text-gray-800'}`}>
              {remainingTime !== null ? formatTime(remainingTime) : 'N/A'}
            </div>
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
                  onClick={() => setSelectedQuestion(q)}
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
              {submitting ? 'Submitting...' : remainingTime !== null && remainingTime <= 0 ? 'Time Up!' : 'Submit Code'}
            </button>

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

