import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function EditEventQuestions() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      const [eventRes, questionsRes] = await Promise.all([
        api.get(`/events/admin/${eventId}`),
        api.get(`/events/admin/${eventId}/questions`),
      ]);
      setEvent(eventRes.data.event);
      setQuestions(questionsRes.data.questions);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to load event data');
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question: any) => {
    setEditingQuestion({ ...question });
  };

  const handleSave = async () => {
    if (!editingQuestion) return;

    setSaving(true);
    try {
      await api.put(`/events/admin/${eventId}/questions/${editingQuestion.id}`, {
        title: editingQuestion.title,
        description: editingQuestion.description,
        sampleInput: editingQuestion.sampleInput || '',
        sampleOutput: editingQuestion.sampleOutput || '',
        testCases: editingQuestion.testCases || [],
        correctAnswer: editingQuestion.correctAnswer || '',
      });
      alert('Question updated successfully!');
      setEditingQuestion(null);
      fetchEventData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update question');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingQuestion(null);
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
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Event Questions</h1>
            {event && (
              <p className="text-gray-600">
                {event.title} - {event.language} ({event.status})
              </p>
            )}
          </div>

          <div className="mb-6">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              ← Back to Dashboard
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No questions found for this event.</p>
              <button
                onClick={() => navigate('/admin/conduct-event')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Add Questions
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, idx) => (
                <div key={question.id} className="border border-gray-300 rounded-lg p-6">
                  {editingQuestion?.id === question.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={editingQuestion.title}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={editingQuestion.description}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, description: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sample Input</label>
                        <textarea
                          value={editingQuestion.sampleInput || ''}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, sampleInput: e.target.value })}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sample Output</label>
                        <textarea
                          value={editingQuestion.sampleOutput || ''}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, sampleOutput: e.target.value })}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer/Output *</label>
                        <textarea
                          value={editingQuestion.correctAnswer || ''}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          placeholder="Enter the expected output/correct answer..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">Question {idx + 1}: {question.title}</h3>
                          <p className="text-gray-600 mt-2 whitespace-pre-wrap">{question.description}</p>
                        </div>
                        <button
                          onClick={() => handleEdit(question)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                        >
                          Edit
                        </button>
                      </div>
                      {question.sampleInput && (
                        <div className="mb-2">
                          <span className="font-semibold text-gray-700">Sample Input: </span>
                          <pre className="inline bg-gray-100 p-2 rounded text-sm">{question.sampleInput}</pre>
                        </div>
                      )}
                      {question.sampleOutput && (
                        <div className="mb-2">
                          <span className="font-semibold text-gray-700">Sample Output: </span>
                          <pre className="inline bg-gray-100 p-2 rounded text-sm">{question.sampleOutput}</pre>
                        </div>
                      )}
                      {question.correctAnswer && (
                        <div className="mb-2">
                          <span className="font-semibold text-gray-700">Correct Answer: </span>
                          <pre className="inline bg-green-100 p-2 rounded text-sm">{question.correctAnswer}</pre>
                        </div>
                      )}
                      <div className="text-sm text-gray-500 mt-2">
                        Test Cases: {Array.isArray(question.testCases) ? question.testCases.length : 0}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={() => navigate('/admin/conduct-event')}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              + Add New Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
