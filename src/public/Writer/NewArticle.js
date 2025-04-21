import React, { useState, useRef } from 'react';
// 1. Import CSS Module - Make sure you renamed the file to NewArticle.module.css
import styles from '../../css/NewArticle.module.css';
import api from '../../api/api'
import '@fortawesome/fontawesome-free/css/all.min.css'; // Keep Font Awesome import

const ManuscriptSubmission = () => {
  // --- All state, refs, and initial values remain unchanged ---
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
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const contentRef = useRef(null);
  const notesRef = useRef(null);

  // --- All functions (getRefForField, applyFormatting, applyAlignment, handleFocus, handleBlur, handleInput, handleKeyDown, saveToDatabase, handleSaveDraft, handleSendToEditor, handleRedirectHome) remain exactly the same as your original code ---

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
    // Ensure only the current field is marked as editing
    setEditingFields((prev) => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), [fieldName]: true }));
  };


  const handleBlur = (ref, setter, placeholder, fieldName) => {
    const text = ref.current.innerText.trim();
    if (text === '') {
      // If empty, reset state and innerHTML to placeholder
      ref.current.innerHTML = placeholder; // Restore placeholder HTML
      setter(placeholder); // Update state to placeholder
    } else {
      // If not empty, update state with current potentially formatted HTML
      setter(ref.current.innerHTML);
    }
     // Mark this field as not being edited
    setEditingFields((prev) => ({ ...prev, [fieldName]: false }));
  };


  const handleInput = (ref, setter) => {
    setter(ref.current.innerHTML); // Update state with current HTML content
  };

  const handleKeyDown = (e, fieldName) => {
    // Original Tab/Enter logic remains the same
     const ref = getRefForField(fieldName);
     if (!ref || !ref.current) return;

     // Handle Tab key for navigation
     if (e.key === 'Tab' && !e.shiftKey) {
         e.preventDefault();
         let nextField = null;
         if (fieldName === 'title') nextField = descriptionRef;
         else if (fieldName === 'description') nextField = contentRef;
         // Add more cases if notes field is rendered or other focusable elements exist

         if (nextField && nextField.current) {
             ref.current.blur(); // Important: Trigger blur to save state correctly
             nextField.current.focus();
         } else {
             ref.current.blur(); // Blur the last field
             // Optionally focus the first button in the sidebar or another element
         }
     }

      // Handle Shift+Tab for backward navigation (optional)
     if (e.key === 'Tab' && e.shiftKey) {
         e.preventDefault();
         let prevField = null;
         if (fieldName === 'description') prevField = titleRef;
         else if (fieldName === 'content') prevField = descriptionRef;
         // Add more cases

         if (prevField && prevField.current) {
            ref.current.blur(); // Trigger blur
            prevField.current.focus();
         } else {
            ref.current.blur();
         }
     }

     // Original Enter key logic for notes (if applicable)
     if (e.key === 'Enter' && fieldName === 'notes' && !e.shiftKey) {
        e.preventDefault();
        ref.current.blur(); // Blur on Enter for notes
        setEditingFields((prev) => ({ ...prev, [fieldName]: false }));
     }
  };


  const saveToDatabase = async (url) => {
    setSaveStatus('Saving...');
    // Original logic remains the same
    try {
      const response = await api.post(url, { // Use the passed URL
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
          errorMessage = `Save failed: Received non-JSON response (${response.status}): ${text.slice(0, 100)}...`;
        }
        setSaveStatus(errorMessage);
        setTimeout(() => setSaveStatus(''), 5000);
      }
    } catch (error) {
      setSaveStatus(`Save failed: ${error.message || 'Network error'}`);
      setTimeout(() => setSaveStatus(''), 5000);
    }
  };

  const handleSaveDraft = () => {
    // Original logic remains the same
    // Use state values for the check, as they should reflect the latest content after blur/input
    if (
      title === initialTitle &&
      description === initialDescription &&
      content === initialContent
    ) {
      setShowEmptyModal(true);
    } else {
      saveToDatabase('/writer/article/save-draft'); // Correct endpoint passed
    }
  };

  const handleSendToEditor = () => {
    // Original logic remains the same
    if (
      title === initialTitle || title.trim() === '' || // Also check if empty string
      description === initialDescription || description.trim() === '' ||
      content === initialContent || content.trim() === ''
    ) {
       setShowEmptyModal(true); // Show warning modal if any field is placeholder or empty
    } else {
      saveToDatabase('/writer/article/send-to-editor'); // Correct endpoint passed
    }
  };

  const handleRedirectHome = () => {
    // Original logic remains the same
    window.location.href = '/writer/home'// Redirect to home screen
  };

  const handleRedirectList = ()=> {
    window.location.href = 'writer/article-list'
  }
  // --- renderEditable function remains the same functionally, only className is changed ---
  const renderEditable = (ref, value, placeholder, fieldName) => (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      // 2. Apply CSS Module classes dynamically
      className={`${styles['editable-input']} ${styles[fieldName + '-input'] || ''}`}
      onFocus={() => handleFocus(ref, value, placeholder, fieldName)}
      onInput={() => handleInput(ref, fieldName === 'title' ? setTitle : fieldName === 'description' ? setDescription : setContent )}
      onBlur={() => handleBlur(ref, fieldName === 'title' ? setTitle : fieldName === 'description' ? setDescription : setContent, placeholder, fieldName)}
      onKeyDown={(e) => handleKeyDown(e, fieldName)}
      // IMPORTANT: Original conditional logic for dangerouslySetInnerHTML is preserved
      dangerouslySetInnerHTML={value === placeholder && !editingFields[fieldName] ? { __html: value } : undefined}
    />
  );

  return (
    // 3. Apply CSS Module classes to the main layout and elements
    <div className={styles['manuscript-container']}>
      {/* Warning Modal for Empty Input */}
      {showEmptyModal && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-content']}>
            <h3>Cảnh báo</h3>
             <p>Bạn phải nhập tiêu đề, tóm tắt và nội dung.</p> {/* Updated message */}
            <button type="button" onClick={() => setShowEmptyModal(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-content']}>
            <h3>Thành công</h3>
            <p>Bản thảo của bạn đã được lưu thành công!</p>
            <button type="button" onClick={handleRedirectHome}>
              Về trang chủ
            </button>
            <button type="button" onClick={handleRedirectList}>
              Hiển thị danh sách bài viết
            </button>
          </div>
        </div>
      )}

       {/* Display Save Status Optional Styling */}
       {saveStatus && (
            <div style={{ position: 'fixed', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px', borderRadius: '5px', zIndex: 1001 }}>
                {saveStatus}
            </div>
        )}


      <div className={styles['main-content']}>
        <div className={styles['wrapper']}>
        <div className={styles['content-wrapper']}>
           {/* Add onSubmit prevent default */}
          <form onSubmit={(e) => e.preventDefault()}>
            <div className={styles.toolbar}> {/* Assumes .toolbar class in CSS */}
              {/* Font Awesome icons remain as string class names */}
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyAlignment('Left')} title="Căn trái">
                <i className="fas fa-align-left"></i>
              </button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyAlignment('Center')} title="Căn giữa">
                <i className="fas fa-align-center"></i>
              </button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyAlignment('Right')} title="Căn phải">
                <i className="fas fa-align-right"></i>
              </button>

              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormatting('bold')} title="Đậm">
                <i className="fas fa-bold"></i>
              </button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormatting('italic')} title="Nghiêng">
                <i className="fas fa-italic"></i>
              </button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormatting('underline')} title="Gạch chân">
                <i className="fas fa-underline"></i>
              </button>
            </div>

            <div className={styles['form-group']}> {/* Assumes .form-group class */}
              {renderEditable(titleRef, title, initialTitle, 'title')}
              <p className={styles.author}>[Tên tác giả]</p> {/* Assumes .author class */}
            </div>

            <div className={styles['form-group']}> {/* Assumes .form-group class */}
              {renderEditable(descriptionRef, description, initialDescription, 'description')}
            </div>

            <div className={styles['editor-container']}> {/* Assumes .editor-container class */}
              {renderEditable(contentRef, content, initialContent, 'content')}
            </div>
          </form>
        </div>
        </div>

      </div>
      <div className={styles.sidebar}> {/* Assumes .sidebar class */}
        <div className={styles['notes-buttons']}> {/* Assumes .notes-buttons class */}
           {/* Ensure buttons have correct onClick handlers */}
           <button type="button" onClick={handleRedirectHome}>Đóng</button>
          <button type="button" onClick={handleSaveDraft}>Lưu nháp</button>
          <button type="button" onClick={handleSendToEditor}>Gửi tới ban biên tập</button>
        </div>
      </div>
    </div>
  );
};

export default ManuscriptSubmission;