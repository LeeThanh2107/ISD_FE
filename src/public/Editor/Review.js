import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../../css/Review.css';
import api from '../../api/api';

const ManuscriptSubmission = () => {
  const placeholderTitle = 'Nhập tiêu đề bài viết tại đây. Enter để xuống dòng. Tab để chuyển bài viết';
  const placeholderDescription = 'Nhập tóm tắt bài viết tại đây. Tab để chuyển tới khóa tiếp theo.';
  const placeholderContent = 'Gõ nội dung tại đây. Nhấn Tab hoặc Enter để tạo đoạn văn mới. Nhấn dòng thường Shift Enter để xuống dòng trong một đoạn văn mới.';
  const placeholderNotes = 'Nhập ghi chú tại đây. Ctrl Enter để xuống dòng. Enter để lưu';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState('');
  const [editingFields, setEditingFields] = useState({
    title: false,
    description: false,
    content: false,
    notes: false,
  });
  const [activeTab, setActiveTab] = useState('notes'); // For sidebar tabs
  const [saveStatus, setSaveStatus] = useState('');
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const contentRef = useRef(null);
  const notesRef = useRef(null);

  const { id } = useParams();

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.post('/editor/article/detail', { id });
        const data = response.data.data;
        setTitle(data.title || '');
        setDescription(data.summary || '');
        setContent(data.content || '');
      } catch (error) {
        console.error('Error fetching manuscript:', error);
        setSaveStatus('Failed to load manuscript data');
        setTimeout(() => setSaveStatus(''), 5000);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Set initial content only once when fetched data changes
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.innerHTML = title;
    }
  }, [title]);

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.innerHTML = description;
    }
  }, [description]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = content;
    }
  }, [content]);

  useEffect(() => {
    if (notesRef.current) {
      notesRef.current.innerHTML = notes;
    }
  }, [notes]);

  const getRefForField = (fieldName) => {
    switch (fieldName) {
      case 'title':
        return titleRef;
      case 'description':
        return descriptionRef;
      case 'content':
        return contentRef;
      case 'notes':
        return notesRef;
      default:
        return null;
    }
  };

  const applyFormatting = (tag) => {
    const activeField = Object.keys(editingFields).find((field) => editingFields[field]);
    if (activeField) {
      const ref = getRefForField(activeField);
      if (ref && ref.current) {
        ref.current.focus();
        document.execCommand(tag, false, null);
      }
    }
  };

  const applyAlignment = (alignment) => {
    const activeField = Object.keys(editingFields).find((field) => editingFields[field]);
    if (activeField) {
      const ref = getRefForField(activeField);
      if (ref && ref.current) {
        ref.current.focus();
        document.execCommand(`justify${alignment}`, false, null);
      }
    }
  };

  const handleFocus = (fieldName) => {
    setEditingFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleBlur = (ref, setter, fieldName) => {
    const text = ref.current.innerHTML.trim();
    setter(text);
    setEditingFields((prev) => ({ ...prev, [fieldName]: false }));
  };

  const handleKeyDown = (e, fieldName) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      setEditingFields((prev) => ({ ...prev, [fieldName]: false }));
    } else if (e.key === 'Enter' && fieldName === 'notes' && !e.ctrlKey) {
      e.preventDefault();
      setEditingFields((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const saveToDatabase = async () => {
    setSaveStatus('Saving...');
    try {
      const response = await api.post('/writer/article/create', {
        title: title !== placeholderTitle ? title : '',
        abstract: description !== placeholderDescription ? description : '',
        content: content !== placeholderContent ? content : '',
      });

      if (response.status === 200 || response.status === 201) {
        setSaveStatus('');
        setShowSuccessModal(true);
      } else {
        const errorMessage = `Save failed: HTTP ${response.status} - ${response.data.message || 'Unknown error'}`;
        setSaveStatus(errorMessage);
        setTimeout(() => setSaveStatus(''), 5000);
      }
    } catch (error) {
      const errorMessage = error.response
        ? `Save failed: ${error.response.data.message || error.response.statusText}`
        : `Save failed: ${error.message}`;
      setSaveStatus(errorMessage);
      setTimeout(() => setSaveStatus(''), 5000);
    }
  };

  const handleSaveClick = () => {
    // Blur the active field to update the state
    const activeField = Object.keys(editingFields).find((field) => editingFields[field]);
    if (activeField) {
      const ref = getRefForField(activeField);
      if (ref && ref.current) {
        ref.current.blur();
      }
    }

    if (!title.trim() && !description.trim() && !content.trim()) {
      setShowEmptyModal(true);
    } else {
      saveToDatabase();
    }
  };

  const handleRedirectHome = () => {
    window.location.href = '/writer/home';
  };

  const renderEditable = (ref, placeholder, fieldName) => (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={`editable-input ${fieldName}-input`}
      onFocus={() => handleFocus(fieldName)}
      onBlur={() => handleBlur(ref, fieldName === 'title' ? setTitle : fieldName === 'description' ? setDescription : fieldName === 'content' ? setContent : setNotes, fieldName)}
      onKeyDown={(e) => handleKeyDown(e, fieldName)}
    />
  );

  return (
    <div className="manuscript-page">
      <header className="page-header">
        <div className="header-left">
          <h1>PHÊ DUYỆT BÀI VIẾT</h1>
        </div>
        <div className="header-right">
          <Link to="/writer/home" className="back-link">QUAY LẠI TRƯỚC</Link>
        </div>
      </header>

      <div className="manuscript-container">
        {/* Warning Modal for Empty Input */}
        {showEmptyModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Cảnh báo</h3>
              <p>Bạn phải nhập nội dung vào tất cả các trường để lưu bản thảo.</p>
              <button type="button" onClick={() => setShowEmptyModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Thành công</h3>
              <p>Bản thảo của bạn đã được gửi thành công!</p>
              <button type="button" onClick={handleRedirectHome}>
                Về trang chủ
              </button>
            </div>
          </div>
        )}

        <div className="main-content">
          <div className="content-wrapper">
            <form>
              <div className="toolbar">
                {['Left', 'Center', 'Right'].map((align) => (
                  <button
                    key={align}
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyAlignment(align)}
                    className="toolbar-button"
                  >
                    {align === 'Left' && 'L'}
                    {align === 'Center' && 'C'}
                    {align === 'Right' && 'R'}
                  </button>
                ))}
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyFormatting('bold')}
                  className="toolbar-button"
                >
                  <b>B</b>
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyFormatting('italic')}
                  className="toolbar-button"
                >
                  <i>I</i>
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyFormatting('underline')}
                  className="toolbar-button"
                >
                  <u>U</u>
                </button>
              </div>

              <div className="form-group">
                {renderEditable(titleRef, placeholderTitle, 'title')}
                <p className="author">[Tên tác giả]</p>
              </div>

              <div className="form-group">
                {renderEditable(descriptionRef, placeholderDescription, 'description')}
              </div>

              <div className="editor-container">
                {renderEditable(contentRef, placeholderContent, 'content')}
              </div>
            </form>
          </div>

          <div className="sidebar-review">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                GHI CHÚ
              </button>
              <button
                className={`tab ${activeTab === 'edit' ? 'active' : ''}`}
                onClick={() => setActiveTab('edit')}
              >
                CHỈNH SỬA
              </button>
            </div>

            {activeTab === 'notes' && (
              <div className="tab-content">
                <h3>GHI CHÚ</h3>
                {renderEditable(notesRef, placeholderNotes, 'notes')}
              </div>
            )}

            {activeTab === 'edit' && (
              <div className="tab-content">
                <h3>CHỈNH SỬA</h3>
                <label>Chọn chuyên mục</label>
                <select>
                  <option>Chọn chuyên mục...</option>
                  <option>Bài viết đang trong luồng sách</option>
                  <option>Chọn đăng bài bot, chuyển hội</option>
                  <option>Chọn nhãn bot</option>
                </select>

                <label>Chọn nhãn</label>
                <select>
                  <option>Chọn nhãn bài viết...</option>
                  <option>Nhãn bài 1 - 1,000,000 đ</option>
                  <option>Nhãn bài 2 - 2,000,000 đ</option>
                  <option>Nhãn bài 3 - 3,000,000 đ</option>
                </select>

                <h3>Nhắn xét của BTV</h3>
                <textarea placeholder="Nhắn xét của bạn..."></textarea>
              </div>
            )}

            <div className="sidebar-buttons">
              <button className="btn-close">Đóng</button>
              <button className="btn-save">Lưu</button>
              <button className="btn-submit" onClick={handleSaveClick}>Gửi bài</button>
              <button className="btn-create-writer">Tạo bài trên Writer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManuscriptSubmission;