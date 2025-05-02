import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// Import CSS Module
import styles from '../../css/Review.module.css'; // Adjust path if needed
import api from '../../api/api'; // Your configured API client
// Import Font Awesome CSS if using <i> tags directly
import '@fortawesome/fontawesome-free/css/all.min.css';

// Placeholder text constants
const placeholderTitle = 'Nhập tiêu đề bài viết tại đây...';
const placeholderDescription = 'Nhập tóm tắt bài viết tại đây...';
const placeholderContent = 'Gõ nội dung tại đây...';
const placeholderNotes = 'Nhập ghi chú tại đây...'; // If using notes field

function ManuscriptSubmission() {
  // --- State ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState(''); // Keep if notes are used
  const [comments, setComments] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Start loading initially
  const [error, setError] = useState(null); // For fetch/save errors
  const [editingFields, setEditingFields] = useState({ // Track focused field
    title: false,
    description: false,
    content: false,
    notes: false,
  });
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [articleStatus, setArticleStatus] = useState(null); // State for article status

  // --- Refs ---
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const contentRef = useRef(null);
  const notesRef = useRef(null); // Keep if notes field exists

  // --- Router Params ---
  const { id } = useParams(); // Article ID from URL

  // --- Determine Editability based on Status ---
  // Editable if status is NOT 3 (Published) or 4 (Rejected/Returned)
  // Adjust status codes (3, 4) based on your application's definitions
  const isEditable = articleStatus !== 3 && articleStatus !== 4;

  // --- Fetch Data Effect ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setArticleStatus(null); // Reset status on new fetch
      try {
        if (!id) {
          // Set defaults and stop if no ID
          setTitle(placeholderTitle);
          setDescription(placeholderDescription);
          setContent(placeholderContent);
          setNotes(placeholderNotes);
          setComments('');
          setIsLoading(false);
          console.log("No article ID provided.");
          return;
        }

        // Fetch article details - Use POST as per original code
        const response = await api.post('/editor/article/detail', { id });

        // --- Response Data Parsing (Adapt as needed) ---
        let data = null;
         if (response?.data?.data) {
             if (typeof response.data.data === 'object' && response.data.data !== null) {
                 // Handle potential nesting under numeric key like "0" or "1"
                 const firstKey = Object.keys(response.data.data)[0];
                 if (!isNaN(firstKey) && response.data.data[firstKey]) {
                     data = response.data.data[firstKey];
                 } else { data = response.data.data; } // Assume it's the object itself
             } else { data = response.data.data; } // Fallback
         } else if (response?.data) { data = response.data; } // If data is the direct response body
        // --- End Parsing ---

        if (!data || typeof data !== 'object') {
            throw new Error('Fetched article data is not valid or missing.');
        }

        console.log("Fetched Data:", data); // Log fetched data

        // Store Status
        setArticleStatus(data.status); // Assuming 'status' field exists

        // Populate state, using fetched data or fallback to empty string (or placeholder if preferred)
        setTitle(data.title || '');
        setDescription(data.summary || '');
        setContent(data.content || '');
        setComments(data.comments || '');
        setNotes(data.notes || ''); // Populate notes if field exists

        // Initial content setting for contentEditable divs happens in separate effects below

      } catch (error) {
        console.error('Error fetching manuscript:', error);
        setError(error.message || "Could not load article data.");
        // Set placeholders or empty on error
        setTitle(placeholderTitle);
        setDescription(placeholderDescription);
        setContent(placeholderContent);
        setNotes(placeholderNotes);
        setComments('');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]); // Re-run if ID changes

  // --- Effects to Sync State to contentEditable innerHTML ---
  // These run *after* state is updated (including initial fetch)
  // Use dangerouslySetInnerHTML might be slightly cleaner but potentially less safe
  useEffect(() => {
    const currentVal = titleRef.current?.innerHTML;
    const stateVal = title || (editingFields.title ? '' : placeholderTitle); // Show placeholder if not editing and empty
    if (titleRef.current && stateVal !== currentVal) {
      titleRef.current.innerHTML = stateVal;
    }
  }, [title, editingFields.title]); // Depend on state and editing status

  useEffect(() => {
    const currentVal = descriptionRef.current?.innerHTML;
    const stateVal = description || (editingFields.description ? '' : placeholderDescription);
    if (descriptionRef.current && stateVal !== currentVal) {
      descriptionRef.current.innerHTML = stateVal;
    }
  }, [description, editingFields.description]);

  useEffect(() => {
    const currentVal = contentRef.current?.innerHTML;
    const stateVal = content || (editingFields.content ? '' : placeholderContent);
    if (contentRef.current && stateVal !== currentVal) {
      contentRef.current.innerHTML = stateVal;
    }
  }, [content, editingFields.content]);

  // Example for notes - uncomment/adapt if you have a notes ref and state
  // useEffect(() => {
  //   const currentVal = notesRef.current?.innerHTML;
  //   const stateVal = notes || (editingFields.notes ? '' : placeholderNotes);
  //   if (notesRef.current && stateVal !== currentVal) {
  //     notesRef.current.innerHTML = stateVal;
  //   }
  // }, [notes, editingFields.notes]);
  // --- End Sync Effects ---


  // --- Helper to get Ref based on field name ---
  const getRefForField = (fieldName) => {
    switch (fieldName) {
      case 'title': return titleRef;
      case 'description': return descriptionRef;
      case 'content': return contentRef;
      case 'notes': return notesRef; // If notes field exists
      default: return null;
    }
  };

  // --- Toolbar Actions ---
  const applyFormatting = (tag) => {
    if (!isEditable) return; // Don't apply if not editable
    const activeField = Object.keys(editingFields).find((field) => editingFields[field]);
    if (activeField) {
      const ref = getRefForField(activeField);
      if (ref?.current) {
        ref.current.focus();
        document.execCommand(tag, false, null);
        // Update state after execCommand (important!)
        handleBlur(ref, activeField === 'title' ? setTitle : activeField === 'description' ? setDescription : setContent, activeField, true); // Pass true to force update from innerHTML
      }
    }
  };

  const applyAlignment = (alignment) => {
    if (!isEditable) return; // Don't apply if not editable
    const activeField = Object.keys(editingFields).find((field) => editingFields[field]);
    if (activeField) {
      const ref = getRefForField(activeField);
      if (ref?.current) {
        ref.current.focus();
        document.execCommand(`justify${alignment}`, false, null);
         // Update state after execCommand
        handleBlur(ref, activeField === 'title' ? setTitle : activeField === 'description' ? setDescription : setContent, activeField, true);
      }
    }
  };
  // --- End Toolbar Actions ---


  // --- Focus / Blur / KeyDown Handlers ---
  const handleFocus = (fieldName) => {
    if (!isEditable) return; // Prevent focus logic if not editable
    setEditingFields({ title: false, description: false, content: false, notes: false, [fieldName]: true });
    const ref = getRefForField(fieldName);
    const placeholder = fieldName === 'title' ? placeholderTitle :
                        fieldName === 'description' ? placeholderDescription :
                        fieldName === 'content' ? placeholderContent :
                        fieldName === 'notes' ? placeholderNotes : '';
    // Clear placeholder only if current content IS the placeholder
    if (ref?.current && ref.current.innerHTML === placeholder) {
        ref.current.innerHTML = '';
    } else if (ref?.current && ref.current.innerHTML === '') {
         // If it's already empty (e.g., user deleted text), don't restore placeholder on focus
    }
  };

  const handleBlur = (ref, setter, fieldName, forceUpdateFromHTML = false) => {
    // No need to run blur logic if not editable, but we still need to mark as not editing
    setEditingFields((prev) => ({ ...prev, [fieldName]: false }));

    if (!isEditable) return; // Don't save/update placeholders if read-only

    if (ref?.current) {
        const currentHTML = ref.current.innerHTML;
        const plainText = ref.current.innerText; // Use innerText for emptiness check

        const placeholder = fieldName === 'title' ? placeholderTitle :
                            fieldName === 'description' ? placeholderDescription :
                            fieldName === 'content' ? placeholderContent :
                            fieldName === 'notes' ? placeholderNotes : '';

        if (plainText.trim() === '' && !forceUpdateFromHTML) {
            // If visually empty AND not forced update, restore placeholder
            ref.current.innerHTML = placeholder;
            setter(''); // Set state to empty string, not placeholder
        } else {
            // If not empty or forced update (after execCommand), save the current HTML
            setter(currentHTML);
        }
    }
  };

  const handleKeyDown = (e, fieldName) => {
    if (!isEditable) return; // Prevent keyboard actions if not editable

    const ref = getRefForField(fieldName);
    if (!ref?.current) return;

    // Handle Tab key for navigation
    if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        let nextFieldRef = null;
        let nextFieldName = null;
        if (fieldName === 'title') { nextFieldRef = descriptionRef; nextFieldName = 'description'; }
        else if (fieldName === 'description') { nextFieldRef = contentRef; nextFieldName = 'content'; }
        else if (fieldName === 'content') {
            // Tab out to the first interactive element in the sidebar (e.g., category select)
             const firstSelect = document.querySelector(`.${styles['sidebar-review']} select`);
             if (firstSelect) {
                 handleBlur(ref, setContent, 'content'); // Trigger blur to save state
                 firstSelect.focus(); return;
             }
        }
        if (nextFieldRef?.current) {
            handleBlur(ref, fieldName === 'title' ? setTitle : setDescription, fieldName); // Trigger blur
            handleFocus(nextFieldName); // Trigger focus on next field
            nextFieldRef.current.focus(); // Move browser focus
        } else {
            handleBlur(ref, setContent, 'content'); // Blur the last editable field
        }
    }
    // Handle Shift+Tab (simplified - adapt as needed)
    else if (e.key === 'Tab' && e.shiftKey) {
         e.preventDefault();
         let prevFieldRef = null;
         let prevFieldName = null;
         if (fieldName === 'description') { prevFieldRef = titleRef; prevFieldName = 'title'; }
         else if (fieldName === 'content') { prevFieldRef = descriptionRef; prevFieldName = 'description'; }
         // Add logic to tab back from sidebar elements if needed

         if (prevFieldRef?.current) {
             handleBlur(ref, fieldName === 'description' ? setDescription : setContent, fieldName);
             handleFocus(prevFieldName);
             prevFieldRef.current.focus();
         } else {
              handleBlur(ref, setTitle, 'title'); // Blur first field
         }
    }
    // Handle Enter/Ctrl+Enter for notes if applicable
    else if (e.key === 'Enter' && fieldName === 'notes' && !e.ctrlKey) {
        e.preventDefault();
        handleBlur(notesRef, setNotes, 'notes');
    }
  };
  // --- End Handlers ---


  // --- Save/Reject/Redirect ---
  const handleReject = () => {
    if (!isEditable) return; // Prevent reject if not editable
    // Blur active field before potentially saving
    const activeField = Object.keys(editingFields).find(field => editingFields[field]);
    if (activeField) getRefForField(activeField)?.current?.blur();

    // Use timeout to allow state update from blur
    setTimeout(() => {
        // Optionally add a confirmation modal
        if (window.confirm('Bạn có chắc chắn muốn trả lại bài viết này cho tác giả?')) {
             saveToDatabase(4); // Status 4 for rejected/returned
        }
    }, 0);
  }

  const handleSaveClick = () => {
    if (!isEditable) return; // Prevent save if not editable
    // Blur active field before saving
    const activeField = Object.keys(editingFields).find(field => editingFields[field]);
     if (activeField) getRefForField(activeField)?.current?.blur();

    // Use a timeout to allow blur event/state update to complete before validation/saving
    setTimeout(() => {
        // Validate using the latest state values
        const titleToValidate = title === placeholderTitle ? '' : titleRef.current?.innerText.trim() || '';
        const descriptionToValidate = description === placeholderDescription ? '' : descriptionRef.current?.innerText.trim() || '';
        const contentToValidate = content === placeholderContent ? '' : contentRef.current?.innerText.trim() || '';

        if (!titleToValidate || !descriptionToValidate || !contentToValidate) {
            setShowEmptyModal(true); // Show modal if required fields are visually empty
        } else {
            saveToDatabase(3); // Status 3 for approved/published
        }
    }, 50); // Short timeout
  };

  const saveToDatabase = async (status) => {
    // Use state values which should be up-to-date after blur
    const titleToSend = title === placeholderTitle ? '' : title;
    const summaryToSend = description === placeholderDescription ? '' : description;
    const contentToSend = content === placeholderContent ? '' : content;
    const notesToSend = notes === placeholderNotes ? '' : notes; // Use if notes field is active

    // Re-check required fields before sending (belt and suspenders)
    if (status === 3 && (!titleToSend || !summaryToSend || !contentToSend)) {
        setShowEmptyModal(true);
        console.log("Validation failed just before API call.");
        return;
    }

    setIsLoading(true); // Indicate saving process
    setError(null);
    console.log("Saving to DB with status:", status, "Data:", { title: titleToSend, summary: summaryToSend, content: contentToSend, comments });

    try {
      // Adjust API endpoint and payload structure as needed by your backend
      const response = await api.post('/editor/article/review', {
          id: id, // Make sure ID is sent correctly

          article:{          
            title: titleToSend,
            abstract: summaryToSend, // API likely expects 'summary' not 'abstract'
            content: contentToSend,
            status: status,
          },
          notes: notesToSend, // Include if notes field exists
          comments: comments // Send latest comments state
      });

      if (response.status === 200 || response.status === 201) {
        setShowSuccessModal(true);
      } else {
          throw new Error(`Review save/update failed with status: ${response.status}`);
      }
    } catch (err) {
        console.error('Error saving review:', err);
        setError(err.response?.data?.message || err.message || "Could not save review.");
        // Keep modals closed on error, show error message via `error` state
        setShowEmptyModal(false);
        setShowSuccessModal(false);
    } finally {
        setIsLoading(false);
    }
  };

  const handleRedirectHome = () => {
    window.location.href = '/editor/home'; // Consider using useNavigate for SPA navigation
  };
  const handleRedirectList = () => {
    window.location.href = '/editor/article-list'; // Consider using useNavigate
  };
  // --- End Save/Reject/Redirect ---


  // --- Final Render ---
  // Determine if the main save/reject buttons should be disabled
  const controlsDisabled = !isEditable || isLoading;


  return (
    <div className={styles['manuscript-page']}>
      <header className={styles['page-header']}>
        <div className={styles['header-left']}>
          <h1>PHÊ DUYỆT BÀI VIẾT</h1>
        </div>
        <div className={styles['header-right']}>
          <Link to="/editor/home" className={styles['back-link']}>QUAY LẠI TRANG TRƯỚC</Link>
        </div>
      </header>

      <div className={styles['manuscript-container']}>
        {/* Warning Modal */}
        {showEmptyModal && (
          <div className={styles['modal-overlay']}>
            <div className={styles['modal-content']}>
              <h3>Cảnh báo</h3>
              <p>Tiêu đề, tóm tắt và nội dung không được để trống khi xuất bản.</p>
              <button type="button" onClick={() => setShowEmptyModal(false)}> Đóng </button>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className={styles['modal-overlay']}>
            <div className={styles['modal-content']}>
              <h3>Thành công</h3>
              <p>Thao tác của bạn đã được thực hiện thành công!</p>
              {/* Add spacing between buttons */}
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
              <div className={styles['word-count']}>0 từ, 0 ký tự</div> {/* Add word count logic if needed */}
              <div className={styles['control-bar-right']}>
                 {/* Add functionality to these buttons if required */}
                 <button disabled={!isEditable}>Bản nháp</button>
                 <button>Xem thử</button>
                 <button> <i className="fas fa-expand"></i> </button>
                 <button> <i className="fas fa-cog"></i> </button>
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
                    onBlur={(e) => handleBlur(titleRef, setTitle, 'title')}
                    onKeyDown={(e) => handleKeyDown(e, 'title')}
                    // Initial content set by useEffect
                  />
                  {/* Author Tag */}
                  <div className={styles['author-tag']}>[Tên tác giả]</div> {/* TODO: Populate dynamically */}
                  {/* Description */}
                  <div
                    ref={descriptionRef}
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    className={`${styles['description-input']} ${styles['intro-text']} ${!isEditable ? styles['read-only'] : ''}`}
                    onFocus={() => handleFocus('description')}
                    onBlur={(e) => handleBlur(descriptionRef, setDescription, 'description')}
                    onKeyDown={(e) => handleKeyDown(e, 'description')}
                    // Initial content set by useEffect
                  />
                  {/* Content */}
                  <div
                    ref={contentRef}
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    className={`${styles['content-input-text']} ${styles['vietnamese-text']} ${!isEditable ? styles['read-only'] : ''}`}
                    onFocus={() => handleFocus('content')}
                    onBlur={(e) => handleBlur(contentRef, setContent, 'content')}
                    onKeyDown={(e) => handleKeyDown(e, 'content')}
                    // Initial content set by useEffect
                   />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Review Area */}
          <div className={styles['sidebar-review']}>
             {/* Display general error messages */}
             {error && <p className={styles['error-message']}>{error}</p>}

            {/* Disable sidebar form controls if not editable */}
            <fieldset disabled={!isEditable} className={styles.fieldset}>
                <div className={styles['form-group']}>
                    <label>Chọn chuyên mục</label>
                    <select className={styles['notes-select']} /* Add value/onChange */ >
                        <option>Chọn chuyên mục...</option>
                        <option>Bài viết đang trong luồng sách</option>
                        <option>Chọn đăng bài bot, chuyển hội</option>
                        <option>Chọn nhãn bot</option>
                    </select>
                </div>
                <div className={styles['form-group']}>
                    <label>Chọn nhãn</label>
                    <select className={styles['notes-select']} /* Add value/onChange */ >
                        <option>Chọn nhãn bài viết...</option>
                        <option>Nhãn bài 1 - 1,000,000 đ</option>
                        <option>Nhãn bài 2 - 2,000,000 đ</option>
                        <option>Nhãn bài 3 - 3,000,000 đ</option>
                    </select>
                </div>
            </fieldset>

            {/* Comments Area - Optionally disable */}
            <div className={styles['form-group']}>
              <h3 className={styles['comments-title']}>Nhận xét của BTV</h3>
              <textarea
                className={styles['comments-area']}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Nhận xét của bạn..."
                // disabled={!isEditable} // Uncomment to disable comments when not editable
              ></textarea>
            </div>

            {/* Sidebar buttons */}
            <div className={styles['sidebar-buttons']}>
              <button className={styles['btn-dong']} onClick={handleRedirectHome} disabled={isLoading}>Đóng</button>
              <button className={styles['btn-luu']} disabled={controlsDisabled}>Lưu</button> {/* Add save draft logic */}
              <button className={styles['btn-doi-editor']} onClick={handleSaveClick} disabled={controlsDisabled}>Xuất bản</button>
              <button className={styles['btn-create-writer']} onClick={handleReject} disabled={controlsDisabled}>Trả bài cho tác giả</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManuscriptSubmission;