import React, { useState, useRef } from 'react';
import '../../css/NewArticle.css';
import api from '../../api/api'
const ManuscriptSubmission = () => {
  const initialTitle = 'Nhập tiêu đề bài viết tại đây. Enter để xuống dòng. Tab để chuyển bài viết';
  const initialDescription = 'Nhập tóm tắt bài viết tại đây. Tab để chuyển tới khóa tiếp theo.';
  const initialContent = 'Gõ nội dung tại đây. Nhấn Tab hoặc Enter để tạo đoạn văn mới. Nhấn dòng thường Shift Enter để xuống dòng trong một đoạn văn mới.';

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [content, setContent] = useState(initialContent);
  const [editingFields, setEditingFields] = useState({
    title: false,
    description: false,
    content: false,
    notes: false,
  });
  const [saveStatus, setSaveStatus] = useState('');
  const [showEmptyModal, setShowEmptyModal] = useState(false); // For empty input warning
  const [showSuccessModal, setShowSuccessModal] = useState(false); // For success message

  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const contentRef = useRef(null);
  const notesRef = useRef(null);

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

  const handleFocus = (ref, value, placeholder, fieldName) => {
    if (value === placeholder) {
      ref.current.innerHTML = '';
    }
    setEditingFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleBlur = (ref, setter, placeholder, fieldName) => {
    const text = ref.current.innerText.trim();
    if (text === '') {
      ref.current.innerHTML = placeholder;
      setter(placeholder);
    } else {
      setter(ref.current.innerHTML);
    }
    setEditingFields((prev) => ({ ...prev, [fieldName]: false }));
  };

  const handleInput = (ref, setter) => {
    setter(ref.current.innerHTML);
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
          title: title !== initialTitle ? title : '',
          abstract: description !== initialDescription ? description : '',
          content: content !== initialContent ? content : '',
      });      
      if (response.status === 200) {
        setSaveStatus('');
        setShowSuccessModal(true); // Show success modal
      } else {
        const contentType = response.headers.get('content-type');
        let errorMessage = `Save failed: HTTP ${response.status}`;
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = `Save failed: ${errorData.message || 'Unknown error'}`;
        } else {
          const text = await response.text();
          errorMessage = `Save failed: Received non-JSON response (${response.status}): ${text.slice(0, 50)}...`;
        }
        setSaveStatus(errorMessage);
        setTimeout(() => setSaveStatus(''), 5000);
      }
    } catch (error) {
      setSaveStatus(`Save failed: ${error.message}`);
      setTimeout(() => setSaveStatus(''), 5000);
    }
  };

  const handleSaveClick = () => {
    // Check if all fields are placeholders
    if (
      title === initialTitle &&
      description === initialDescription &&
      content === initialContent
    ) {
      setShowEmptyModal(true); // Show warning modal
    } else {
      saveToDatabase();
    }
  };

  const handleRedirectHome = () => {
    window.location.href = '/writer/home'// Redirect to home screen
  };

  const renderEditable = (ref, value, placeholder, fieldName) => (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={`editable-input ${fieldName}-input`}
      onFocus={() => handleFocus(ref, value, placeholder, fieldName)}
      onInput={() => handleInput(ref, fieldName === 'title' ? setTitle : fieldName === 'description' ? setDescription :  setContent )}
      onBlur={() => handleBlur(ref, fieldName === 'title' ? setTitle : fieldName === 'description' ? setDescription : setContent, placeholder, fieldName)}
      onKeyDown={(e) => handleKeyDown(e, fieldName)}
      dangerouslySetInnerHTML={value === placeholder && !editingFields[fieldName] ? { __html: value } : undefined}
    />
  );

  return (
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
                >
                  {align}
                </button>
              ))}
              <button type="button" tabIndex={-1} onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormatting('bold')}>
                <b>B</b>
              </button>
              <button type="button" tabIndex={-1} onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormatting('italic')}>
                <i>I</i>
              </button>
              <button type="button" tabIndex={-1} onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormatting('underline')}>
                <u>U</u>
              </button>
            </div>

            <div className="form-group">
              {renderEditable(titleRef, title, initialTitle, 'title')}
              <p className="author">[Tên tác giả]</p>
            </div>

            <div className="form-group">
              {renderEditable(descriptionRef, description, initialDescription, 'description')}
            </div>

            <div className="editor-container">
              {renderEditable(contentRef, content, initialContent, 'content')}
            </div>

            <div className="save-button-container">
              <button type="button" className="save-button" onClick={handleSaveClick}>
                Save to Database
              </button>
              {saveStatus && <p className="save-status">{saveStatus}</p>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManuscriptSubmission;