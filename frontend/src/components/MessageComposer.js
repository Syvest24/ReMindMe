import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { messageAPI, contactAPI } from '../utils/api';
import { FiSend, FiCopy, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';

const MessageComposer = () => {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [occasionType, setOccasionType] = useState('birthday');
  const [tone, setTone] = useState('friendly');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [editedMessage, setEditedMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchContact();
  }, [contactId]);

  const fetchContact = async () => {
    try {
      const response = await contactAPI.getOne(contactId);
      setContact(response.data);
    } catch (error) {
      toast.error('Failed to load contact');
      console.error(error);
    }
  };

  const handleGenerateMessage = async () => {
    setLoading(true);
    try {
      const response = await messageAPI.generate({
        contact_id: contactId,
        occasion_type: occasionType,
        tone: tone
      });
      setGeneratedMessage(response.data.message);
      setEditedMessage(response.data.message);
      toast.success('Message generated successfully!');
    } catch (error) {
      toast.error('Failed to generate message');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(editedMessage);
    toast.success('Message copied to clipboard!');
  };

  const handleSendEmail = async () => {
    if (!contact?.email) {
      toast.error('Contact does not have an email address');
      return;
    }

    setSending(true);
    try {
      await messageAPI.sendEmail({
        to_email: contact.email,
        subject: `${occasionType.charAt(0).toUpperCase() + occasionType.slice(1)} Message`,
        body: editedMessage
      });
      toast.info('Email feature is configured as placeholder. Message copied to clipboard instead.');
      handleCopyMessage();
    } catch (error) {
      toast.error('Failed to send email');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  if (!contact) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="message-composer">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Message</h1>
        <p className="text-gray-600">Create a personalized message for {contact.name}</p>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Message Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Occasion Type</label>
            <select
              data-testid="occasion-type-select"
              value={occasionType}
              onChange={(e) => setOccasionType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="birthday">Birthday</option>
              <option value="anniversary">Anniversary</option>
              <option value="follow-up">Follow-up / Check-in</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
            <select
              data-testid="tone-select"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="friendly">Friendly</option>
              <option value="professional">Professional</option>
              <option value="warm">Warm</option>
              <option value="concise">Concise</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateMessage}
          data-testid="generate-message-button"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50"
        >
          <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Generating...' : 'Generate Message'}</span>
        </button>
      </div>

      {/* Message Preview/Editor */}
      {generatedMessage && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Message</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              AI-Generated (Editable)
            </span>
          </div>
          
          <textarea
            data-testid="message-editor"
            value={editedMessage}
            onChange={(e) => setEditedMessage(e.target.value)}
            rows="8"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            placeholder="Your message will appear here..."
          />

          <div className="mt-4 text-sm text-gray-600 bg-indigo-50 p-3 rounded-lg">
            <strong>Note:</strong> This is a template message. Email sending requires SMTP configuration. 
            For now, you can copy the message and send it manually.
          </div>
        </div>
      )}

      {/* Actions */}
      {generatedMessage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleCopyMessage}
            data-testid="copy-message-button"
            className="flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            <FiCopy className="w-5 h-5" />
            <span>Copy to Clipboard</span>
          </button>
          
          <button
            onClick={handleSendEmail}
            data-testid="send-email-button"
            disabled={!contact.email || sending}
            className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSend className="w-5 h-5" />
            <span>{sending ? 'Sending...' : contact.email ? 'Send via Email' : 'No Email Available'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageComposer;