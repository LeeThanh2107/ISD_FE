import React, { useState } from 'react';
import '../../css/NewArticle.css'; // Import file CSS
import api from '../../api/api';

function NewArticle() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [abstract, setAbstract] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [responseData, setResponseData] = useState(null);

  const handleSubmitArticle = async function (e) {
    e.preventDefault(); // Ngăn reload trang
    const payload = {
      title,
      abstract,
      content,
    };

    try {
      const response = await api.post('/writer/article/create', payload);
      setResponseData(response.data.data); // Lưu dữ liệu phản hồi
      setModalOpen(true); // Mở modal
    } catch (error) {
      console.error('Error submitting article:', error);
      setResponseData({ error: 'Failed to submit article. Please try again.' });
      setModalOpen(true); // Mở modal với thông báo lỗi
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setResponseData(null); // Xóa dữ liệu khi đóng modal
  };

  return (
    <div className="new-article-container">
      <form onSubmit={handleSubmitArticle} className="article-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Please enter the title for your article here"
            className="title-input"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="abstract">Abstract</label>
          <textarea
            id="abstract"
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            placeholder="Enter your article's abstract here"
            className="abstract-textarea"
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your article's content here"
            className="content-textarea"
          />
        </div>
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>

      {/* Modal */}
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Submission Result</h2>
            {responseData ? (
              <div>
                {responseData.error ? (
                  <p style={{ color: 'red' }}>{responseData.error}</p>
                ) : (
                  <pre>{responseData}</pre>
                )}
              </div>
            ) : (
              <p>Loading...</p>
            )}
            <button onClick={closeModal} className="modal-close-button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewArticle;