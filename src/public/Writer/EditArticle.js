import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Added useNavigate
// 1. Import CSS Module
import styles from '../../css/Review.module.css'; // Using the Review styles as requested
import api from '../../api/api'; // Your configured API client
// Import Font Awesome CSS if using <i> tags directly
import '@fortawesome/fontawesome-free/css/all.min.css';

// Placeholder text constants
const placeholderTitle = 'Nhập tiêu đề bài viết tại đây...';
const placeholderDescription = 'Nhập tóm tắt bài viết tại đây...';
const placeholderContent = 'Gõ nội dung tại đây...';
const placeholderNotes = 'Nhập ghi chú tại đây...';

function ManuscriptSubmission() {
  // --- State ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState('');
  // Removed comments state as it seemed specific to editor view
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(''); // For user feedback
  const [editingFields, setEditingFields] = useState({
    title: false, description: false, content: false, notes: false,
  });
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [articleStatus, setArticleStatus] = useState(null); // State for article status

  // --- Refs ---
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const contentRef = useRef(null);
  const notesRef = useRef(null);

  // --- Router ---
  const { id } = useParams(); // Article ID from URL (if editing)
  const navigate = useNavigate(); // Hook for navigation

  // --- Determine Editability based on Status ---
  // Writer can edit if status is Draft (0) or Returned (4)
  // Adjust status codes (0, 1, 3, 4) based on your application's definitions
  const isEditable = articleStatus === 0 || articleStatus === 4 || articleStatus === null; // Allow edit for new (null) or draft/returned

  // --- Fetch Data Effect ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setArticleStatus(null);
      try {
        if (!id) { // New article scenario
          setTitle(''); // Start empty, placeholders handled by CSS/effects
          setDescription('');
          setContent('');
          setNotes('');
          setArticleStatus(0); // Default status for new article is Draft
          setIsLoading(false);
          return;
        }

        // Fetch existing article details - Using writer endpoint from original code
        const response = await api.post('/writer/article/detail', { id });

        // --- Response Data Parsing ---
        let data = null;
         if (response?.data?.data) {
             if (typeof response.data.data === 'object' && response.data.data !== null) {
                 const firstKey = Object.keys(response.data.data)[0];
                 if (!isNaN(firstKey) && response.data.data[firstKey]) { data = response.data.data[firstKey]; }
                 else { data = response.data.data; }
             } else { data = response.data.data; }
         } else if (response?.data) { data = response.data; }
        // --- End Parsing ---

        if (!data || typeof data !== 'object') {
            throw new Error('Fetched article data is not valid or missing.');
        }
        console.log("Fetched Data:", data);

        setArticleStatus(data.status);
        setTitle(data.title || ''); // Use empty string if null/undefined
        setDescription(data.summary || '');
        setContent(data.content || '');
        setNotes(data.notes || '');

      } catch (error) {
        console.error('Error fetching manuscript:', error);
        setError(error.response?.data?.message || error.message || "Could not load article data.");
        // Clear fields on error
        setTitle(''); setDescription(''); setContent(''); setNotes(''); setArticleStatus(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // --- Effects to Sync State to contentEditable innerHTML ---
  // Ensures initial content and placeholders are set correctly
  useEffect(() => {
    const currentVal = titleRef.current?.innerHTML;
    // Show placeholder only if state is empty AND not focused AND editable
    const stateVal = title || (!editingFields.title && isEditable ? placeholderTitle : '');
    if (titleRef.current && stateVal !== currentVal) {
      titleRef.current.innerHTML = stateVal;
      // Add/remove placeholder class for styling
      if (!title && !editingFields.title && isEditable) {
        titleRef.current.classList.add(styles.placeholder);
      } else {
        titleRef.current.classList.remove(styles.placeholder);
      }
    }
  }, [title, editingFields.title, isEditable]); // Depend on editability too

  useEffect(() => {
     const currentVal = descriptionRef.current?.innerHTML;
     const stateVal = description || (!editingFields.description && isEditable ? placeholderDescription : '');
     if (descriptionRef.current && stateVal !== currentVal) {
       descriptionRef.current.innerHTML = stateVal;
        if (!description && !editingFields.description && isEditable) {
            descriptionRef.current.classList.add(styles.placeholder);
        } else {
            descriptionRef.current.classList.remove(styles.placeholder);
        }
     }
   }, [description, editingFields.description, isEditable]);

  useEffect(() => {
     const currentVal = contentRef.current?.innerHTML;
     const stateVal = content || (!editingFields.content && isEditable ? placeholderContent : '');
     if (contentRef.current && stateVal !== currentVal) {
       contentRef.current.innerHTML = stateVal;
        if (!content && !editingFields.content && isEditable) {
            contentRef.current.classList.add(styles.placeholder);
        } else {
            contentRef.current.classList.remove(styles.placeholder);
        }
     }
   }, [content, editingFields.content, isEditable]);

  useEffect(() => {
     const currentVal = notesRef.current?.innerHTML;
     const stateVal = notes || (!editingFields.notes && isEditable ? placeholderNotes : '');
     if (notesRef.current && stateVal !== currentVal) {
       notesRef.current.innerHTML = stateVal;
       if (!notes && !editingFields.notes && isEditable) {
            notesRef.current.classList.add(styles.placeholder);
       } else {
            notesRef.current.classList.remove(styles.placeholder);
       }
     }
   }, [notes, editingFields.notes, isEditable]);
  // --- End Sync Effects ---

  // --- Helper to get Ref ---
  const getRefForField = (fieldName) => { /* ... (keep as before) ... */ };

  // --- Toolbar Actions ---
  const applyFormatting = (tag) => { /* ... (keep as before, including isEditable check) ... */ };
  const applyAlignment = (alignment) => { /* ... (keep as before, including isEditable check) ... */ };

  // --- Focus / Blur / KeyDown Handlers ---
  const handleFocus = (fieldName) => {
    if (!isEditable) return;
    setEditingFields({ title: false, description: false, content: false, notes: false, [fieldName]: true });
    const ref = getRefForField(fieldName);
    // Clear visual placeholder text on focus if it's currently showing
    if (ref?.current?.classList.contains(styles.placeholder)) {
        ref.current.innerHTML = '';
        ref.current.classList.remove(styles.placeholder);
    }
  };

  const handleBlur = (ref, setter, fieldName) => {
    setEditingFields((prev) => ({ ...prev, [fieldName]: false })); // Mark as not editing regardless of editable status

    if (!isEditable) return; // Don't save if read-only

    if (ref?.current) {
        const currentHTML = ref.current.innerHTML;
        const plainText = ref.current.innerText;

        if (plainText.trim() === '') {
            // If visually empty, set state to empty string
            setter('');
            // Add placeholder class back visually (effect hook will handle innerHTML)
            ref.current.classList.add(styles.placeholder);
        } else {
            // If not empty, save the HTML content to state
            setter(currentHTML);
            ref.current.classList.remove(styles.placeholder); // Ensure placeholder class is removed
        }
    }
  };

  const handleKeyDown = (e, fieldName) => { /* ... (keep as before, including isEditable check) ... */ };
  // --- End Handlers ---

  // --- Save/Send/Redirect ---
  const saveToDatabase = async (status) => {
    setSaveStatus('Đang lưu...');
    setError(null);

    // Use state values (updated by blur handlers)
    const titleToSend = title; // Send actual content, even if empty
    const summaryToSend = description;
    const contentToSend = content;
    const notesToSend = notes;

    // Validation specific to sending (status 1)
    if (status === 1 && (!titleToSend.trim() || !summaryToSend.trim() || !contentToSend.trim())) {
        setShowEmptyModal(true);
        setSaveStatus(''); // Clear saving status
        console.log("Validation failed: Title, Summary, or Content is empty when sending.");
        return;
    }

    setIsLoading(true); // Indicate network activity

    try {
        let url = '';
        // Determine URL based on status (0 for draft, 1 for send to editor)
        if (status === 0) {
            url = '/writer/article/save-draft';
        } else if (status === 1) {
            url = '/writer/article/send-to-editor';
        } else {
            throw new Error(`Invalid status for save operation: ${status}`);
        }

        const payload = {
            ...(id && { id: id }), // Conditionally add id if editing
            title: titleToSend,
            summary: summaryToSend, // Ensure backend expects 'summary'
            content: contentToSend,
            notes: notesToSend,
            status: status, // Status is always sent now
        };

        console.log("Sending payload:", payload, "to URL:", url);
        const response = await api.post(url, payload);

        if (response.status === 200 || response.status === 201) {
            setSaveStatus('Đã lưu!');
            // If sending to editor was successful, show success modal
            if (status === 1) {
                setShowSuccessModal(true);
            }
            // Optionally update state with returned data if backend sends it back
            // const savedData = response.data.data; // Adapt if needed
            // if (savedData) {
            //    setTitle(savedData.title || '');
            //    // ... update other fields if necessary
            //    setArticleStatus(savedData.status); // Update status if returned
            // }
        } else {
            throw new Error(`Save/Send failed with status: ${response.status}`);
        }
    } catch (err) {
        console.error("Error during save/send:", err);
        const errorMsg = err.response?.data?.message || err.message || "Could not save article.";
        setError(errorMsg); // Show error to user
        setSaveStatus('Lỗi!');
    } finally {
        setIsLoading(false); // Stop loading indicator
        // Optionally clear save status after a delay
        setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleSave = () => { // Save as Draft (status 0)
    if (!isEditable) return;
    const activeField = Object.keys(editingFields).find((field) => editingFields[field]);
    if (activeField) getRefForField(activeField)?.current?.blur(); // Blur active field first

    setTimeout(() => { // Allow blur to update state
        saveToDatabase(0);
    }, 50);
  };

  const handleSendToEditor = () => { // Send to Editor (status 1)
    if (!isEditable) return;
    const activeField = Object.keys(editingFields).find((field) => editingFields[field]);
    if (activeField) getRefForField(activeField)?.current?.blur();

    setTimeout(() => { // Allow blur to update state
        // Validation happens inside saveToDatabase for status 1
        saveToDatabase(1);
    }, 50);
  };

  const handleRedirectHome = () => {
    navigate('/writer/home'); // Use navigate for SPA routing
  };
  const handleRedirectList = () => {
    navigate('/writer/article-list'); // Use navigate
  };
  // --- End Save/Send/Redirect ---

  // --- Final Render ---
  const controlsDisabled = !isEditable || isLoading; // Disable buttons if not editable or loading/saving

  return (
    <div className={styles['manuscript-page']}>
      <header className={styles['page-header']}>
        <div className={styles['header-left']}>
          <h1>{id ? 'CHỈNH SỬA BÀI VIẾT' : 'VIẾT BÀI MỚI'}</h1>
          {/* Optional: Display status if editing */}
          {id && articleStatus !== null && (
            <span style={{ marginLeft: '15px', fontSize: '14px', color: isEditable ? '#007bff' : '#6c757d', fontWeight: '500' }}>
              (Trạng thái: {articleStatus === 0 ? 'Bản nháp' : articleStatus === 1 ? 'Đã gửi BTV' : articleStatus === 3 ? 'Đã xuất bản' : articleStatus === 4 ? 'Bị trả lại' : 'Không xác định'})
              {articleStatus === 3 ? '(Bài viết đã xuất bản không thể sửa đổi)':''}
            </span>
          )}
        </div>
        <div className={styles['header-right']}>
          {/* Use Link for internal navigation */}
          <Link to="/writer/home" className={styles['back-link']}>QUAY LẠI TRANG TRƯỚC</Link>
        </div>
      </header>

      <div className={styles['manuscript-container']}>
        {/* Warning Modal */}
        {showEmptyModal && (
          <div className={styles['modal-overlay']}>
            <div className={styles['modal-content']}>
              <h3>Cảnh báo</h3>
              <p>Tiêu đề, tóm tắt và nội dung không được để trống khi gửi cho Ban Biên Tập.</p>
              <button type="button" onClick={() => setShowEmptyModal(false)}> Đóng </button>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className={styles['modal-overlay']}>
            <div className={styles['modal-content']}>
              <h3>Thành công</h3>
              <p>Bài viết đã được gửi thành công!</p>
              <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                 <button type="button" onClick={handleRedirectHome}> Về trang chủ </button>
                 <button type="button" onClick={handleRedirectList}> Xem danh sách </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className={styles['main-content']}>
          <div className={styles['editor-wrapper']}>
            <div className={styles['bai-viet-label']}>Bài viết</div>

            {/* Toolbar */}
            <div className={styles.toolbar}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyAlignment('Left')} title="Căn trái" disabled={!isEditable}> <i className="fas fa-align-left"></i> </button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyAlignment('Center')} title="Căn giữa" disabled={!isEditable}> <i className="fas fa-align-center"></i> </button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyAlignment('Right')} title="Căn phải" disabled={!isEditable}> <i className="fas fa-align-right"></i> </button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormatting('bold')} title="Đậm" disabled={!isEditable}> <i className="fas fa-bold"></i> </button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormatting('italic')} title="Nghiêng" disabled={!isEditable}> <i className="fas fa-italic"></i> </button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormatting('underline')} title="Gạch chân" disabled={!isEditable}> <i className="fas fa-underline"></i> </button>
            </div>

            {/* Control bar */}
            <div className={styles['control-bar']}>
              <div className={styles['word-count']}>0 từ, 0 ký tự</div> {/* Implement word count if needed */}
              <div className={styles['control-bar-right']}>
                 <button disabled={controlsDisabled}>Bản nháp</button> {/* Link to handleSave? */}
                 <button>Xem thử</button>
                 <button><i className="fas fa-expand"></i></button>
                 <button><i className="fas fa-cog"></i></button>
              </div>
            </div>

            {/* Editor container */}
            <div className={styles['editor-container']}>
              <div className={styles['content-input-container']}>
                <div className={styles['content-input']}>
                  {/* Title */}
                  <div
                    ref={titleRef}
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    className={`${styles['title-input']} ${!isEditable ? styles['read-only'] : ''}`}
                    onFocus={() => handleFocus('title')}
                    onBlur={() => handleBlur(titleRef, setTitle, 'title')}
                    onKeyDown={(e) => handleKeyDown(e, 'title')}
                    data-placeholder={placeholderTitle} // Use data-placeholder for CSS
                  />
                  {/* Author Tag - Populate dynamically if possible */}
                  <div className={styles['author-tag']}>[Tên tác giả]</div>
                  {/* Description */}
                  <div
                    ref={descriptionRef}
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    className={`${styles['description-input']} ${styles['intro-text']} ${!isEditable ? styles['read-only'] : ''}`}
                    onFocus={() => handleFocus('description')}
                    onBlur={() => handleBlur(descriptionRef, setDescription, 'description')}
                    onKeyDown={(e) => handleKeyDown(e, 'description')}
                    data-placeholder={placeholderDescription}
                  />
                  {/* Content */}
                  <div
                    ref={contentRef}
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    className={`${styles['content-input-text']} ${styles['vietnamese-text']} ${!isEditable ? styles['read-only'] : ''}`}
                    onFocus={() => handleFocus('content')}
                    onBlur={() => handleBlur(contentRef, setContent, 'content')}
                    onKeyDown={(e) => handleKeyDown(e, 'content')}
                    data-placeholder={placeholderContent}
                   />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className={styles['sidebar-review']}>
             {/* Display general error messages */}
             {error && <p className={styles['error-message']}>{error}</p>}
             {/* Display save status */}
             {saveStatus && <p className={styles['save-status']}>{saveStatus}</p>}

            {/* Notes Area */}
            <div className={styles['form-group']} style={{flexGrow: 0.5, display: 'flex', flexDirection: 'column' }}> {/* Allow notes to grow */}
              <h3 className={styles['notes-title']}>
                <i className="fas fa-comment" style={{ marginRight: '5px' }}></i> Ghi chú {/* Added icon */}
              </h3>
              <div
                ref={notesRef}
                contentEditable={isEditable} // Notes also follow editability
                suppressContentEditableWarning
                className={`${styles['notes-area']} ${!isEditable ? styles['read-only'] : ''}`} // Use notes-area style
                onFocus={() => handleFocus('notes')}
                onBlur={() => handleBlur(notesRef, setNotes, 'notes')}
                onKeyDown={(e) => handleKeyDown(e, 'notes')}
                data-placeholder={placeholderNotes}
                style={{ flexGrow: 1 }} // Allow textarea div to grow
              />
              <div className={styles['notes-helper']} style={{fontSize: '11px', color: '#666', marginTop: '5px'}}>Ghi chú đã lưu sẽ không thể xóa hay chỉnh sửa.</div>
            </div>

            {/* Sidebar buttons */}
            <div className={styles['sidebar-buttons']}>
              <button className={styles['btn-dong']} onClick={handleRedirectHome} disabled={isLoading}>Đóng</button>
              {/* Use handleSave for Lưu nháp */}
              <button className={styles['btn-luu']} onClick={handleSave} disabled={controlsDisabled}>Lưu nháp</button>
               {/* Use handleSendToEditor for Gửi */}
              <button className={styles['btn-doi-editor']} onClick={handleSendToEditor} disabled={controlsDisabled}>Gửi ban biên tập</button>
              {/* Removed Reject button as it's editor action */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManuscriptSubmission;
