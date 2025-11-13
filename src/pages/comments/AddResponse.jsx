// src/components/comments/AddResponse.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import commentService from "../../services/api/commentService";
import { useAuth } from "../../context/AuthContext";
import { showSuccess, showError } from "../../utils/alerts";

/**
 * AddResponse Component
 * Form for county officials to add official responses to reports
 */
const AddResponse = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Handle form submission for adding response
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      showError("Response cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        report: reportId,          // UUID of the related report
        user: user.id,             // logged-in user UUID
        comment_type: "official",  // county official response
        content: content.trim(),
        parent: null,              // top-level response, not a reply
      };

      await commentService.createComment(payload);
      showSuccess("Response added successfully!", "Comment");
      navigate(-1); // Go back to previous page
    } catch (error) {
      console.error("Error adding response:", error);
      showError("Failed to add response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Add Official Response</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your official response..."
          className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Submitting..." : "Submit Response"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddResponse;