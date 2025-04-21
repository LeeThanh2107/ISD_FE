import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// 1. Import CSS Module - Ensure file is renamed to Review.module.css
import styles from '../../css/Review.module.css';
import api from '../../api/api';
// Assuming Font Awesome is needed for toolbar icons, ensure it's loaded globally or imported here if not already
import '@fortawesome/fontawesome-free/css/all.min.css'; // Added Font Awesome import if needed

const ManuscriptSubmission = () => {
  // --- State, Refs, Placeholders, Handlers, Effects, etc. remain UNCHANGED ---
  const placeholderTitle = 'Nhập tiêu đề bài viết tại đây. Enter để xuống dòng. Tab để chuyển bài viết';
  const placeholderDescription = 'Nhập tóm tắt bài viết tại đây. Tab để chuyển tới khóa tiếp theo.';
  const placeholderContent = 'Gõ nội dung tại đây. Nhấn Tab hoặc Enter để tạo đoạn văn mới. Nhấn dòng thường Shift Enter để xuống dòng trong một đoạn văn mới.';
  const placeholderNotes = 'Nhập ghi chú tại đây. Ctrl Enter để xuống dòng. Enter để lưu';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState('');
  const [comments, setComments] = useState('');
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

  // --- All functions (useEffect, getRefForField, applyFormatting, applyAlignment, handleFocus, handleBlur, handleKeyDown, handleReject, saveToDatabase, handleSaveClick, handleRedirectHome, renderEditable) remain exactly the same as your original code ---

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.post('/editor/article/detail', { id });
        const data = response.data.data;
        // Original logic for status check - kept as is
        if(data.status === 3 || data.status === 4){
           // You might want to disable editing or show a message here based on status
        }
        // Populate state, use placeholder if fetched data is null/empty
        setTitle(data.title || placeholderTitle);
        setDescription(data.summary || placeholderDescription);
        setContent(data.content || placeholderContent);
        // Fetch comments and notes if available from API
        setComments(data.comments || ''); // Assuming comments come from API
        setNotes(data.notes || placeholderNotes); // Assuming notes come from API
      } catch (error) {
        console.error('Error fetching manuscript:', error);
         // Set placeholders on error?
        setTitle(placeholderTitle);
        setDescription(placeholderDescription);
        setContent(placeholderContent);
        setNotes(placeholderNotes);
      } finally {
        setIsLoading(false); // Set to false after loading finishes
      }
    };

    if (id) {
      setIsLoading(true); // Set before fetch
      fetchData();
    } else {
         // Set placeholders if no ID
        setTitle(placeholderTitle);
        setDescription(placeholderDescription);
        setContent(placeholderContent);
        setNotes(placeholderNotes);
    }
  }, [id]); // Dependency array is correct

  // This useEffect updates the contentEditable div *after* state changes.
  // Crucial for initially populating the divs from fetched data.
  useEffect(() => {
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

  // Note: Your original code didn't render a notes editable area,
  // but this effect is here if you add one.
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
     // Clear placeholder text on focus IF the current content IS the placeholder
     const ref = getRefForField(fieldName);
     const placeholder = fieldName === 'title' ? placeholderTitle :
                       fieldName === 'description' ? placeholderDescription :
                       fieldName === 'content' ? placeholderContent :
                       fieldName === 'notes' ? placeholderNotes : ''; // Add notes placeholder case if needed
     if (ref && ref.current && ref.current.innerHTML === placeholder) {
         ref.current.innerHTML = '';
     }
   };


   const handleBlur = (ref, setter, fieldName) => {
     if (ref && ref.current) { // Check if ref.current exists
         const currentHTML = ref.current.innerHTML;
         const plainText = ref.current.innerText; // Use innerText to check for visual emptiness
         const placeholder = fieldName === 'title' ? placeholderTitle :
                           fieldName === 'description' ? placeholderDescription :
                           fieldName === 'content' ? placeholderContent :
                           fieldName === 'notes' ? placeholderNotes : '';

         if (plainText.trim() === '') {
             // If visually empty, restore placeholder in div and state
             ref.current.innerHTML = placeholder;
             setter(placeholder);
         } else {
             // If not empty, save the potentially formatted HTML to state
             setter(currentHTML);
         }
     }
     // Mark field as not editing
     setEditingFields((prev) => ({ ...prev, [fieldName]: false }));
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
            else if (fieldName === 'content') {
                // Decide where to tab next - maybe the first sidebar element?
                // For example, find the first select element:
                const firstSelect = document.querySelector(`.${styles['sidebar-review']} select`);
                if (firstSelect) {
                    ref.current.blur();
                    firstSelect.focus();
                    return; // Exit early
                }
            }


            if (nextField && nextField.current) {
                ref.current.blur(); // Important: Trigger blur to save state correctly
                nextField.current.focus();
            } else {
                ref.current.blur(); // Blur the last field
            }
        }

         // Handle Shift+Tab for backward navigation (optional)
        if (e.key === 'Tab' && e.shiftKey) {
            e.preventDefault();
            let prevField = null;
             // Basic example, needs extension if sidebar elements are included
            if (fieldName === 'description') prevField = titleRef;
            else if (fieldName === 'content') prevField = descriptionRef;


            if (prevField && prevField.current) {
               ref.current.blur(); // Trigger blur
               prevField.current.focus();
            } else {
               ref.current.blur();
               // Focus last element before editor?
            }
        }

        // Original Enter key logic for notes (if applicable and notes field exists)
        if (e.key === 'Enter' && fieldName === 'notes' && !e.ctrlKey) {
           e.preventDefault();
           ref.current.blur(); // Blur on Enter for notes
           setEditingFields((prev) => ({ ...prev, [fieldName]: false }));
        }
   };

   const handleReject = () => {
     // Trigger blur before saving
     const activeField = Object.keys(editingFields).find(field => editingFields[field]);
      if (activeField) {
         const ref = getRefForField(activeField);
         if (ref && ref.current) ref.current.blur();
      }
     // Optionally add a confirmation modal here
     saveToDatabase(4); // Status 4 for rejected/returned
   }

   const saveToDatabase = async (status) => {
        // Directly use state values, assuming handleBlur updates them correctly
        const titleToSend = title === placeholderTitle ? '' : title;
        const abstractToSend = description === placeholderDescription ? '' : description;
        const contentToSend = content === placeholderContent ? '' : content;
        const notesToSend = notes === placeholderNotes ? '' : notes; // Include notes if applicable


       // Optional: Basic validation before sending
       if (status === 3 && (!titleToSend || !abstractToSend || !contentToSend || notesToSend)) {
           setShowEmptyModal(true);
           console.log("Validation failed: Title, Abstract, or Content is empty.");
           return; // Stop submission if required fields are empty for "Publish" (status 3)
       }


     try {
       const response = await api.post('/editor/article/review', {
         article: {
           title: titleToSend,
           abstract: abstractToSend,
           content: contentToSend,
           status: status,
           notes: notesToSend,
         },
         id: id,
         comments: comments // Send comments separately
       });

       if (response.status === 200 || response.status === 201) {
         setShowSuccessModal(true);
       } else {
           // Handle non-200/201 success statuses if necessary
           console.error("Review save/update failed with status:", response.status);
           // Potentially show an error message to the user
       }
     } catch (error) {
        console.error('Error saving review:', error);
        // Show error message to the user
     }
   };

    const handleSaveClick = () => {
      // Trigger blur before saving
      const activeField = Object.keys(editingFields).find(field => editingFields[field]);
      if (activeField) {
         const ref = getRefForField(activeField);
         if (ref && ref.current) ref.current.blur();
      }
      // Use a timeout to allow blur event/state update to complete before saving
      setTimeout(() => {
         // Check state values after blur potentially updated them
          const titleToSend = title === placeholderTitle ? '' : title;
          const abstractToSend = description === placeholderDescription ? '' : description;
          const contentToSend = content === placeholderContent ? '' : content;


          if (!titleToSend || !abstractToSend || !contentToSend) {
             setShowEmptyModal(true); // Show modal if required fields are empty
         } else {
             saveToDatabase(3); // Status 3 for approved/published
         }
      }, 0); // Timeout 0 allows event queue to process blur first
   };

   const handleRedirectHome = () => {
     window.location.href = '/editor/home'; // Or editor dashboard route
   };
   const handleRedirectList = ()=>{
    window.location.href = '/editor/article-list'
   }
   // --- renderEditable function is defined but NOT USED in the current JSX for content ---
   // --- It remains here unchanged as per instructions ---
   const renderEditable = (ref, placeholder, fieldName) => (
     <div
       ref={ref}
       contentEditable
       suppressContentEditableWarning
       // This className usage assumes renderEditable IS used, applying it here for completeness
       // based on the function signature, although the main content divs below have their own classes.
       className={`${styles['editable-input']} ${styles[fieldName + '-input'] || ''}`}
       onFocus={() => handleFocus(fieldName)}
       onBlur={() => handleBlur(ref, fieldName === 'title' ? setTitle : fieldName === 'description' ? setDescription : fieldName === 'content' ? setContent : setNotes, fieldName)}
       onKeyDown={(e) => handleKeyDown(e, fieldName)}
       // dangerouslySetInnerHTML logic would go here if this function was used for rendering
     />
   );

  // --- Render ---
  if (isLoading) {
     return <div>Loading...</div>; // Basic loading state
  }


  return (
    // 2. Apply CSS Module class names
    <div className={styles['manuscript-page']}>
      <header className={styles['page-header']}>
        <div className={styles['header-left']}>
          <h1>PHÊ DUYỆT BÀI VIẾT</h1>
        </div>
        <div className={styles['header-right']}>
           {/* Link component usage is fine */}
          <Link to="/editor/home" className={styles['back-link']}>QUAY LẠI TRANG TRƯỚC</Link>
        </div>
      </header>

      <div className={styles['manuscript-container']}>
        {/* Warning Modal for Empty Input */}
        {showEmptyModal && (
          <div className={styles['modal-overlay']}>
            <div className={styles['modal-content']}>
              <h3>Cảnh báo</h3>
               <p>Tiêu đề, tóm tắt và nội dung không được để trống khi xuất bản.</p>
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
              <p>Thao tác của bạn đã được thực hiện thành công!</p>
              <button type="button" onClick={handleRedirectHome}>
                Về trang chủ
              </button>
              <button type="button" onClick={handleRedirectList}>
                Hiển thị danh sách bài viết
              </button>
            </div>
          </div>
        )}

        <div className={styles['main-content']}>
          <div className={styles['editor-wrapper']}>
            <div className={styles['bai-viet-label']}>Bài viết</div>

            <div className={styles.toolbar}> {/* Assumes .toolbar */}
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

            {/* Control bar - classes converted */}
            <div className={styles['control-bar']}>
              <div className={styles['word-count']}>0 từ, 0 ký tự</div> {/* TODO: Implement word count */}
              <div className={styles['control-bar-right']}>
                <button>Bản nháp</button> {/* Add onClick handlers if needed */}
                <button>Xem thử</button> {/* Add onClick handlers if needed */}
                <button>
                  <i className="fas fa-expand"></i> {/* Font Awesome */}
                </button>
                <button>
                  <i className="fas fa-cog"></i> {/* Font Awesome */}
                </button>
              </div>
            </div>

            {/* Editor container - classes converted */}
            <div className={styles['editor-container']}>
              <div className={styles['content-input-container']}>
                 {/* This div seems intended as the main input area */}
                <div className={styles['content-input']}>
                    {/* Title Input Div */}
                    <div
                        ref={titleRef}
                        contentEditable
                        suppressContentEditableWarning
                        className={styles['title-input']} // Apply CSS Module class
                        onFocus={() => handleFocus('title')}
                        onBlur={() => handleBlur(titleRef, setTitle, 'title')}
                        onKeyDown={(e) => handleKeyDown(e, 'title')}
                     >{renderEditable(titleRef, title, 'title')}</div>

                     {/* Author Tag Div */}
                    <div className={styles['author-tag']}>[Tên tác giả]</div>

                    {/* Description Input Div */}
                    <div
                        ref={descriptionRef}
                        contentEditable
                        suppressContentEditableWarning
                        // Combine multiple classes using template literal
                        className={`${styles['description-input']} ${styles['intro-text']}`}
                        onFocus={() => handleFocus('description')}
                        onBlur={() => handleBlur(descriptionRef, setDescription, 'description')}
                        onKeyDown={(e) => handleKeyDown(e, 'description')}
                         // Similar structural issue as title - kept as is.
                         // dangerouslySetInnerHTML={{ __html: description }} // Use this instead of the below call
                     >{renderEditable(descriptionRef, description, 'description')}</div>

                    {/* Content Input Div */}
                    <div
                        ref={contentRef}
                        contentEditable
                        suppressContentEditableWarning
                        // Combine multiple classes using template literal
                        className={`${styles['content-input-text']} ${styles['vietnamese-text']}`}
                        onFocus={() => handleFocus('content')}
                        onBlur={() => handleBlur(contentRef, setContent, 'content')}
                        onKeyDown={(e) => handleKeyDown(e, 'content')}
                         // Similar structural issue as title - kept as is.
                         // dangerouslySetInnerHTML={{ __html: content }} // Use this instead of the below call
                     >{renderEditable(contentRef, content, 'content')}}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - classes converted */}
          <div className={styles['sidebar-review']}>
             {/* Form group for category */}
            <div className={styles['form-group']}>
              <label>Chọn chuyên mục</label> {/* Label styling can be done via tag or parent */}
              <select className={styles['notes-select']}>
                <option>Chọn chuyên mục...</option>
                <option>Bài viết đang trong luồng sách</option>
                <option>Chọn đăng bài bot, chuyển hội</option>
                <option>Chọn nhãn bot</option>
              </select>
            </div>

             {/* Form group for tags */}
            <div className={styles['form-group']}>
              <label>Chọn nhãn</label>
              <select className={styles['notes-select']}>
                <option>Chọn nhãn bài viết...</option>
                <option>Nhãn bài 1 - 1,000,000 đ</option>
                <option>Nhãn bài 2 - 2,000,000 đ</option>
                <option>Nhãn bài 3 - 3,000,000 đ</option>
              </select>
            </div>

            {/* Form group for comments */}
            <div className={styles['form-group']}>
              <h3 className={styles['comments-title']}>Nhận xét của BTV</h3>
              <textarea
                className={styles['comments-area']}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Nhận xét của bạn..."
              ></textarea>
            </div>

            {/* Sidebar buttons - classes converted */}
            <div className={styles['sidebar-buttons']}>
                {/* Add onClick for Close button if needed */}
              <button className={styles['btn-dong']} onClick={handleRedirectHome}>Đóng</button>
              <button className={styles['btn-luu']}>Lưu</button>
              <button className={styles['btn-doi-editor']} onClick={handleSaveClick}>Xuất bản</button>
              <button className={styles['btn-create-writer']} onClick={handleReject}>Trả bài cho tác giả</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManuscriptSubmission;