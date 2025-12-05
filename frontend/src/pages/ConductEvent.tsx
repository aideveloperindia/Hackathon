import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

interface Question {
  title: string;
  description: string;
  sampleInput: string;
  sampleOutput: string;
  testCases: Array<{ input: string; expectedOutput: string; score: number }>;
}

export default function ConductEvent() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'event' | 'questions'>('event');
  const [eventData, setEventData] = useState({
    title: '',
    language: '',
    description: '',
    maxParticipants: 120,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    title: '',
    description: '',
    sampleInput: '',
    sampleOutput: '',
    testCases: [],
  });
  const [currentTestCase, setCurrentTestCase] = useState({
    input: '',
    expectedOutput: '',
    score: 10,
  });
  const [eventId, setEventId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/events/admin', eventData);
      setEventId(response.data.event.id);
      setStep('questions');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const addTestCase = () => {
    if (!currentTestCase.input || !currentTestCase.expectedOutput) {
      alert('Please fill in both input and expected output');
      return;
    }
    setCurrentQuestion({
      ...currentQuestion,
      testCases: [...currentQuestion.testCases, currentTestCase],
    });
    setCurrentTestCase({ input: '', expectedOutput: '', score: 10 });
  };

  const addQuestion = async () => {
    if (!currentQuestion.title || !currentQuestion.description || currentQuestion.testCases.length === 0) {
      alert('Please fill in all required fields and add at least one test case');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/events/admin/${eventId}/questions`, currentQuestion);
      setQuestions([...questions, currentQuestion]);
      setCurrentQuestion({
        title: '',
        description: '',
        sampleInput: '',
        sampleOutput: '',
        testCases: [],
      });
      alert('Question added successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  const startEvent = async () => {
    if (questions.length === 0) {
      alert('Please add at least one question before starting the event');
      return;
    }

    if (!eventId) {
      alert('Event ID is missing. Please create the event first.');
      return;
    }

    if (!confirm('Are you sure you want to start this event? Once started, students can join.')) return;

    setLoading(true);
    try {
      await api.post(`/events/admin/${eventId}/start`);
      alert('Event started successfully! Students can now join.');
      navigate('/admin/dashboard');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to start event';
      alert(errorMsg);
      if (errorMsg.includes('active event')) {
        // If there's already an active event, refresh dashboard
        setTimeout(() => navigate('/admin/dashboard'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === 'event') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Create New Event</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Event Title *</label>
                <input
                  type="text"
                  value={eventData.title}
                  onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Language *</label>
                <select
                  value={eventData.language}
                  onChange={(e) => setEventData({ ...eventData, language: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Language</option>
                  <option value="C">C</option>
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  value={eventData.description}
                  onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Max Participants</label>
                <input
                  type="number"
                  value={eventData.maxParticipants}
                  onChange={(e) => setEventData({ ...eventData, maxParticipants: parseInt(e.target.value) })}
                  min={1}
                  max={500}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Event & Add Questions'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Add Questions</h2>
          <p className="text-gray-600 mb-6">
            Event: {eventData.title} ({eventData.language}) | Questions Added: {questions.length}
          </p>

          <div className="space-y-6 mb-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Question Title *</label>
              <input
                type="text"
                value={currentQuestion.title}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Description *</label>
              <textarea
                value={currentQuestion.description}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, description: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Sample Input</label>
                <textarea
                  value={currentQuestion.sampleInput}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, sampleInput: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Sample Output</label>
                <textarea
                  value={currentQuestion.sampleOutput}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, sampleOutput: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Test Cases</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Input *</label>
                  <textarea
                    value={currentTestCase.input}
                    onChange={(e) => setCurrentTestCase({ ...currentTestCase, input: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Expected Output *</label>
                  <textarea
                    value={currentTestCase.expectedOutput}
                    onChange={(e) => setCurrentTestCase({ ...currentTestCase, expectedOutput: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Score</label>
                  <input
                    type="number"
                    value={currentTestCase.score}
                    onChange={(e) => setCurrentTestCase({ ...currentTestCase, score: parseInt(e.target.value) })}
                    min={1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addTestCase}
                    className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Add Test Case
                  </button>
                </div>
              </div>

              {currentQuestion.testCases.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold mb-2">Added Test Cases ({currentQuestion.testCases.length}):</p>
                  <div className="space-y-2">
                    {currentQuestion.testCases.map((tc, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded text-sm">
                        Test Case {idx + 1}: Score {tc.score}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={addQuestion}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
              >
                Add Question to Event
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={startEvent}
              disabled={loading || questions.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50"
            >
              Start Event
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

