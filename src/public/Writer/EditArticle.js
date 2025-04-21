import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// 1. Import CSS Module - Ensure file is renamed to Review.module.css
import styles from '../../css/Review.module.css';
import api from '../../api/api';
// Assuming Font Awesome is needed for toolbar icons
import '@fortawesome/fontawesome-free/css/all.min.css'; // Added Font Awesome import if needed

const ManuscriptSubmission = () => {
  // --- State, Refs, Placeholders, Handlers, Effects, etc. remain UNCHANGED ---
  const placeholderNotes = 'Nhập ghi chú tại đây. Ctrl Enter để xuống dòng. Enter để lưu';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingFields, setEditingFields] = useState({
    title: false,
    description: false,
    content: false,
    notes: false,
  });
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const contentRef = useRef(null);
  const notesRef = useRef(null);

  const { id } = useParams();

  // --- All functions (useEffect, getRefForField, applyFormatting, applyAlignment, handleFocus, handleBlur, handleKeyDown, saveToDatabase, handleSave, handleRedirectHome, handleSendToEditor, renderEditable) remain exactly the same as your original code ---

  useEffect(() => {
    const fetchData = async () => {
      try {
        // API endpoint seems different here compared to the previous version
        const response = await api.post('/writer/article/detail', { id });
        const data = response.data.data;
        // Populate state, use empty string if null/undefined from API
        setTitle(data.title || ''); // No placeholder fallback here in original code
        setDescription(data.summary || '');
        setContent(data.content || '');
         // Assuming notes might be fetched too for a writer's draft
        setNotes(data.notes || ''); // Use empty string as default if fetched notes are null/undefined
      } catch (error) {
        console.error('Error fetching manuscript:', error);
        // Set to empty strings on error? Or show error message?
        setTitle('');
        setDescription('');
        setContent('');
        setNotes('');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      setIsLoading(true);
      fetchData();
    } else {
        // Set initial state to empty strings if no ID (new article)
        setTitle('');
        setDescription('');
        setContent('');
        setNotes('');
    }
  }, [id]); // Dependency array is correct


  // Effects to update innerHTML from state remain the same
  useEffect(() => {
    // Update innerHTML only if it differs from state to avoid cursor jumps
    if (titleRef.current && title !== titleRef.current.innerHTML) {
      titleRef.current.innerHTML = title;
    }
  }, [title]);

  useEffect(() => {
    if (descriptionRef.current && description !== descriptionRef.current.innerHTML) {
      descriptionRef.current.innerHTML = description;
    }
  }, [description]);

  useEffect(() => {
    if (contentRef.current && content !== contentRef.current.innerHTML) {
      contentRef.current.innerHTML = content;
    }
  }, [content]);

  useEffect(() => {
    if (notesRef.current && notes !== notesRef.current.innerHTML) {
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
     // Set only the current field as active
     setEditingFields((prev) => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), [fieldName]: true }));
     // Note: Original code here doesn't clear placeholders on focus. It relies on user typing.
  };


  const handleBlur = (ref, setter, fieldName) => {
    // Original blur logic - saves innerHTML (including formatting) to state
    if (ref && ref.current) { // Added check for ref.current
      const currentHTML = ref.current.innerHTML; // Save HTML
      // Trim check might be better on plain text for deciding if it's "empty"
      const plainText = ref.current.innerText;
      if (plainText.trim() === '' && fieldName !== 'notes') { // Don't reset notes to empty string automatically? Or use placeholder?
          // Handle potentially resetting to placeholder if needed, original just saves the (potentially empty) HTML
          // setter(''); // Or maybe setter(placeholderVariable) if you want placeholders back
          setter(currentHTML); // Original just saves the current HTML
      } else {
           setter(currentHTML); // Save current HTML content
      }
    }
    setEditingFields((prev) => ({ ...prev, [fieldName]: false }));
  };


  const handleKeyDown = (e, fieldName) => {
    // Original keydown logic remains the same
        const ref = getRefForField(fieldName);
        if (!ref || !ref.current) return;

        // Handle Tab key for navigation
        if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            let nextField = null;
            if (fieldName === 'title') nextField = descriptionRef;
            else if (fieldName === 'description') nextField = contentRef;
            else if (fieldName === 'content') nextField = notesRef; // Tab from content to notes
            else if (fieldName === 'notes') {
                // Tab from notes to the first button in sidebar?
                 const firstButton = document.querySelector(`.${styles['sidebar-buttons']} button:first-of-type`);
                 if (firstButton) {
                    ref.current.blur();
                    firstButton.focus();
                    return;
                 }
            }


            if (nextField && nextField.current) {
                ref.current.blur();
                nextField.current.focus();
            } else {
                ref.current.blur();
            }
        }

         // Handle Shift+Tab for backward navigation
        if (e.key === 'Tab' && e.shiftKey) {
            e.preventDefault();
            let prevField = null;
             // Example backward navigation
            if (fieldName === 'notes') prevField = contentRef;
            else if (fieldName === 'content') prevField = descriptionRef;
            else if (fieldName === 'description') prevField = titleRef;
            // Add case for tabbing back from title? Or from sidebar buttons?


            if (prevField && prevField.current) {
               ref.current.blur();
               prevField.current.focus();
            } else {
               ref.current.blur();
            }
        }

        // Original Enter key logic for notes
        if (e.key === 'Enter' && fieldName === 'notes' && !e.ctrlKey) {
           e.preventDefault();
           ref.current.blur(); // Blur on Enter for notes
           // Optionally trigger save here if Enter means save for notes?
           // handleSave(); // Or a specific saveNotes function
           setEditingFields((prev) => ({ ...prev, [fieldName]: false }));
        }
  };

  const saveToDatabase = async (status) => {
    // Original save logic for writer remains the same
     try {
        let url = '';
        // Determine URL based on status (0 for draft, 1 for send to editor)
        if (status === 0) {
            url = '/writer/article/save-draft';
        } else { // Assuming status 1 or any other non-zero status means send to editor
            url = '/writer/article/send-to-editor';
        }

        // Use state values, assuming blur handlers keep them up-to-date
        const titleToSend = title; // Send current title (might be empty)
        const abstractToSend = description; // Send current description
        const contentToSend = content; // Send current content
        const notesToSend = notes; // Send current notes

        const payload = {
             // Include id only if it exists (editing existing draft)
             ...(id && { id: id }), // Conditionally add id
            title: titleToSend,
            abstract: abstractToSend,
            content: contentToSend,
            notes: notesToSend, // Include notes in payload
            status: status,
        };


        const response = await api.post(url, payload);

        if (response.status === 200 || response.status === 201) {
            setShowSuccessModal(true);
        } else {
            // Handle potential errors reported in response body
            console.error("Save/Send failed with status:", response.status, response.data);
            // Show error message to user
        }
    } catch (error) {
        console.error("Error during save/send:", error);
         // Show error message to user
    }
  };

  const handleSave = () => {
    // Original save (draft) logic remains the same
    const activeField = Object.keys(editingFields).find((field) => editingFields[field]);
    if (activeField) {
      // Original code commented out the blur, keeping it commented
      // const ref = getRefForField(activeField);
      // if (ref && ref.current) {
      //   ref.current.blur();
      // }
    }
    console.log('handleSave triggered'); // Original log

    // Check based on state, original code checked against empty strings only
     if (!title.trim() && !description.trim() && !content.trim()) {
      setShowEmptyModal(true);
    } else {
      saveToDatabase(0); // Status 0 for saving draft
    }
  };

   const handleSendToEditor = () => { // Renamed from async to sync if await not needed directly
     // Original send to editor logic remains the same
     const activeField = Object.keys(editingFields).find((field) => editingFields[field]);
     if (activeField) {
        const ref = getRefForField(activeField);
        if (ref && ref.current) {
           ref.current.blur(); // Ensure blur happens before check
        }
     }

    // Use a timeout to allow state updates from blur to settle before checking
    setTimeout(() => {
        // Check state values after potential blur update
        if (!title.trim() || !description.trim() || !content.trim()) {
             setShowEmptyModal(true); // Show warning if required fields are empty
         } else {
             saveToDatabase(1); // Status 1 for sending to editor
         }
    }, 0);
   };


  const handleRedirectHome = () => {
    // Original redirect logic remains the same
    window.location.href = '/writer/home';
  };
  const handleRedirectList = ()=> {
    window.location.href = 'writer/article-list'
  }
  // --- renderEditable function is defined but NOT USED in the current JSX for content ---
  // --- It remains here unchanged as per instructions ---
  const renderEditable = (ref, placeholder, fieldName) => (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      // Applying styles here based on function signature, though it's not used for main content divs below
      className={`${styles['editable-input']} ${styles[fieldName + '-input'] || ''}`}
      onFocus={() => handleFocus(fieldName)}
      onBlur={() => handleBlur(ref, fieldName === 'title' ? setTitle : fieldName === 'description' ? setDescription : fieldName === 'content' ? setContent : setNotes, fieldName)}
      onKeyDown={(e) => handleKeyDown(e, fieldName)}
      // Placeholder logic (like dangerouslySetInnerHTML) was not present in this version's original renderEditable
    />
  );


  // --- Render ---
   if (isLoading && id) { // Show loading only when fetching existing article
     return <div>Loading...</div>;
   }

  return (
    // 2. Apply CSS Module class names
    <div className={styles['manuscript-page']}>
      {/* Header remains the same structurally */}
      <header className={styles['page-header']}>
        <div className={styles['header-left']}>
           {/* Title changes based on whether it's a new or existing article */}
          <h1>{id ? 'CHỈNH SỬA BÀI VIẾT' : 'VIẾT BÀI MỚI'}</h1>
        </div>
        <div className={styles['header-right']}>
          <Link to="/writer/home" className={styles['back-link']}>QUAY LẠI TRANG TRƯỚC</Link>
        </div>
      </header>

      <div className={styles['manuscript-container']}>
        {/* Modals remain the same structurally */}
        {showEmptyModal && (
          <div className={styles['modal-overlay']}>
            <div className={styles['modal-content']}>
              <h3>Cảnh báo</h3>
               <p>Tiêu đề, tóm tắt và nội dung không được để trống.</p> {/* Adjusted message */}
              <button type="button" onClick={() => setShowEmptyModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        )}
        {showSuccessModal && (
          <div className={styles['modal-overlay']}>
            <div className={styles['modal-content']}>
              <h3>Thành công</h3>
              <p>Thao tác thành công!</p> {/* Adjusted message */}
              <button type="button" onClick={handleRedirectHome}>
                Về trang chủ
              </button>
              <button type="button" onClick={handleRedirectList}>
                Hiển thị danh sách bài viết
              </button>
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className={styles['main-content']}>
          <div className={styles['wrapper']}>
            <div className={styles['header-wrapper']}>
            <div className={styles['bai-viet-label']}>Bài viết</div>      
              <div className={styles.toolbar}>
                {/* Font Awesome icons are NOT part of CSS Modules */}
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
              <div className={styles['control-bar']}>
                <div className={styles['word-count']}>0 từ, 0 ký tự</div> {/* TODO: Implement word count */}
                <div className={styles['control-bar-right']}>
                  {/* These buttons likely need onClick handlers */}
                  <button>Bản nháp</button>
                  <button>Xem thử</button>
                  <button><i className="fas fa-expand"></i></button>
                  <button><i className="fas fa-cog"></i></button>
                </div>
              </div>
            </div>
          <div className={styles['editor-wrapper']}>


            <div className={styles['editor-container']}>
              <div className={styles['content-input-container']}>
                <div className={styles['content-input']}>
                  {/* Title Input Div */}
                  <div
                    ref={titleRef}
                    contentEditable
                    suppressContentEditableWarning
                    className={styles['title-input']} // Use CSS Module class
                    onFocus={() => handleFocus('title')}
                    onBlur={() => handleBlur(titleRef, setTitle, 'title')}
                    onKeyDown={(e) => handleKeyDown(e, 'title')}
                    // Original code had the renderEditable call here - kept as is per instructions
                    // dangerouslySetInnerHTML={{ __html: title }} // Use this if renderEditable call is removed
                  >{renderEditable(titleRef, title, 'title')}</div>

                  <div className={styles['author-tag']}>[Tên tác giả]</div>

                  {/* Description Input Div */}
                  <div
                    ref={descriptionRef}
                    contentEditable
                    suppressContentEditableWarning
                    // Combine classes
                    className={`${styles['description-input']} ${styles['intro-text']}`}
                    onFocus={() => handleFocus('description')}
                    onBlur={() => handleBlur(descriptionRef, setDescription, 'description')}
                    onKeyDown={(e) => handleKeyDown(e, 'description')}
                    // Original code had the renderEditable call here - kept as is per instructions
                    // dangerouslySetInnerHTML={{ __html: description }} // Use this if renderEditable call is removed
                  >{renderEditable(descriptionRef, description, 'description')}</div>

                  {/* Content Input Div */}
                  <div
                    ref={contentRef}
                    contentEditable
                    suppressContentEditableWarning
                    // Combine classes
                    className={`${styles['content-input-text']} ${styles['vietnamese-text']}`}
                    onFocus={() => handleFocus('content')}
                    onBlur={() => handleBlur(contentRef, setContent, 'content')}
                    onKeyDown={(e) => handleKeyDown(e, 'content')}
                     // Original code had the renderEditable call here - kept as is per instructions
                     // dangerouslySetInnerHTML={{ __html: content }} // Use this if renderEditable call is removed
                  >{renderEditable(contentRef, content, 'content')}</div>
                </div>
              </div>
            </div>
          </div>
          </div>


          {/* Sidebar area - classes converted */}
          {/* The class name sidebar-review might be misleading for writer view, but kept as is */}
          <div className={styles['sidebar-review']}>
            <div className={styles['notes-section']}>
              <h3 className={styles['notes-title']}>
                <i className="fas fa-comment"></i> Ghi chú {/* Font Awesome icon */}
              </h3>
              <div className={styles['notes-area-container']}>
                 {/* Notes Input Div */}
                <div
                  ref={notesRef}
                  contentEditable
                  suppressContentEditableWarning
                  className={styles['notes-area']} // Use CSS Module class
                  onFocus={() => handleFocus('notes')}
                  onBlur={() => handleBlur(notesRef, setNotes, 'notes')}
                  onKeyDown={(e) => handleKeyDown(e, 'notes')}
                  placeholder={placeholderNotes} // Original placeholder text added
                  // Set initial content using innerHTML effect hook
                  // dangerouslySetInnerHTML={{ __html: notes }} // Can use this too
                ></div>
                <div className={styles['notes-helper']}>Ghi chú đã lưu sẽ không thể xóa hay chỉnh sửa.</div>
              </div>
            </div>

            <div className={styles['sidebar-buttons']}>
               {/* Add onClick for Close button */}
              <button className={styles['btn-dong']} onClick={handleRedirectHome}>Đóng</button>
              <button className={styles['btn-luu']} onClick={handleSave}>Lưu nháp</button> {/* Changed label for clarity */}
              <button className={styles['btn-doi-editor']} onClick={handleSendToEditor}>Gửi ban biên tập</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManuscriptSubmission;