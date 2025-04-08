import React, { useState } from 'react';
import '../../css/NewArticle.css';

const ManuscriptSubmission = () => {
  // Initial placeholder texts
  const initialTitle = 'Nhập tiêu đề bài viết tại đây. Enter để xuông dòng. Tab để chuyển bài viết';
  const initialDescription = 'Nhập tóm tắt bài viết tại đây. Tab để chuyển tới khóa tiếp theo.';
  const initialContent =
    'Gõ nội dung tại đây. Nhấn Tab hoặc Enter để tạo đoạn văn mới. Nhấn dòng thường Shift Enter để xuống dòng trong một đoạn văn mới.';
  const initialNotes = 'Nhập ghi chú tại đây. Ctrl Enter để xuống dòng. Enter để lưu';

  // State management
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [content, setContent] = useState(initialContent);
  const [notes, setNotes] = useState(initialNotes);

  // State to control input visibility
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
  const [isContentEditing, setIsContentEditing] = useState(false);
  const [isNotesEditing, setIsNotesEditing] = useState(false);

  // Formatting states
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);

  // Clear placeholder on focus
  const handleFocus = (value, setter, initialValue) => {
    if (value === initialValue) {
      setter(''); // Clear placeholder when focused
    }
  };

  // Format text functions (Word-like behavior)
  const applyFormatting = (tag) => {
    const selectedText = content.substring(selectionStart, selectionEnd);

    if (selectedText) {
      let formattedText;
      switch (tag) {
        case 'bold':
          formattedText = `<b>${selectedText}</b>`;
          break;
        case 'italic':
          formattedText = `<i>${selectedText}</i>`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        default:
          formattedText = selectedText;
      }

      const newContent =
        content.substring(0, selectionStart) +
        formattedText +
        content.substring(selectionEnd);
      setContent(newContent);
    }
  };

  // Alignment functions
  const applyAlignment = (alignment) => {
    const selectedText = content.substring(selectionStart, selectionEnd);
    if (selectedText) {
      const newContent =
        content.substring(0, selectionStart) +
        `<div style="text-align: ${alignment}">${selectedText}</div>` +
        content.substring(selectionEnd);
      setContent(newContent);
    }
  };

  // Handle text selection
  const handleSelection = (e) => {
    setSelectionStart(e.target.selectionStart);
    setSelectionEnd(e.target.selectionEnd);
  };

  // Handle Enter key to create paragraphs and Tab to exit
  const handleKeyDown = (e, setter, setEditing) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (setter === setNotes) {
        setEditing(false); // For notes, Enter saves and exits
      } else {
        setter((prev) => prev + '\n\n'); // Add new paragraph
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setEditing(false); // Simulate "Tab để chuyển tới khóa tiếp theo"
    } else if (e.key === 'Enter' && e.shiftKey && setter !== setNotes) {
      e.preventDefault();
      setter((prev) => prev + '\n'); // Shift + Enter for new line within paragraph
    } else if (e.key === 'Enter' && e.ctrlKey && setter === setNotes) {
      e.preventDefault();
      setter((prev) => prev + '\n'); // Ctrl + Enter for new line in notes
    }
  };

  // Handle blur (exit editing) and restore placeholder if empty
  const handleBlur = (value, setter, setEditing, initialValue) => {
    if (value.trim() === '') {
      setter(initialValue); // Restore the initial placeholder text
    }
    setEditing(false); // Hide the input
  };

  // Render content with HTML formatting
  const renderContent = (text) => {
    return { __html: text.replace(/\n/g, '<br />') };
  };

  return (
    <div className="manuscript-container">
      <div className="main-content">
        <div className="content-wrapper">
          <form>
            {/* Toolbar */}
            <div className="toolbar">
              <button type="button" onClick={() => applyAlignment('left')}>
                <span>Left</span>
              </button>
              <button type="button" onClick={() => applyAlignment('center')}>
                <span>Center</span>
              </button>
              <button type="button" onClick={() => applyAlignment('right')}>
                <span>Right</span>
              </button>
              <button type="button" onClick={() => applyFormatting('bold')}>
                <b>B</b>
              </button>
              <button type="button" onClick={() => applyFormatting('italic')}>
                <i>I</i>
              </button>
              <button type="button" onClick={() => applyFormatting('underline')}>
                <u>U</u>
              </button>
            </div>

            {/* Title */}
            <div className="form-group">
              {isTitleEditing ? (
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={() => handleFocus(title, setTitle, initialTitle)}
                  onBlur={() => handleBlur(title, setTitle, setIsTitleEditing, initialTitle)}
                  onKeyDown={(e) => handleKeyDown(e, setTitle, setIsTitleEditing)}
                  className="editable-input title-input"
                  autoFocus
                />
              ) : (
                <h1 onClick={() => setIsTitleEditing(true)} className="title">
                  {title}
                </h1>
              )}
              <p className="author">[Tên tác giả]</p>
            </div>

            {/* Description */}
            <div className="form-group">
              {isDescriptionEditing ? (
                <div className="description-wrapper">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onFocus={() => handleFocus(description, setDescription, initialDescription)}
                    onBlur={() =>
                      handleBlur(description, setDescription, setIsDescriptionEditing, initialDescription)
                    }
                    onKeyDown={(e) => handleKeyDown(e, setDescription, setIsDescriptionEditing)}
                    className="editable-input description-input"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="description-wrapper">
                  <p onClick={() => setIsDescriptionEditing(true)} className="description">
                    {description}
                  </p>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="editor-container">
              {isContentEditing ? (
                <textarea
                  id="manuscript-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onFocus={() => handleFocus(content, setContent, initialContent)}
                  onSelect={handleSelection}
                  onBlur={() =>
                    handleBlur(content, setContent, setIsContentEditing, initialContent)
                  }
                  onKeyDown={(e) => handleKeyDown(e, setContent, setIsContentEditing)}
                  className="editable-input content-input"
                  autoFocus
                />
              ) : (
                <div
                  onClick={() => setIsContentEditing(true)}
                  className="content"
                  dangerouslySetInnerHTML={renderContent(content)}
                />
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Sidebar for Notes (unchanged) */}
      <div className="sidebar">
        <h3>Ghi chú</h3>
        {isNotesEditing ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onFocus={() => handleFocus(notes, setNotes, initialNotes)}
            onBlur={() => handleBlur(notes, setNotes, setIsNotesEditing, initialNotes)}
            onKeyDown={(e) => handleKeyDown(e, setNotes, setIsNotesEditing)}
            className="editable-input notes-input"
            autoFocus
          />
        ) : (
          <p onClick={() => setIsNotesEditing(true)} className="notes">
            {notes.split('\n').map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))}
          </p>
        )}
        <div className="notes-buttons">
          <button type="button">Đóng</button>
          <button type="button">Lưu</button>
          <button type="button">Gửi tới ban đọc</button>
          <button type="button">Gửi tới Supersdesk</button>
        </div>
      </div>
    </div>
  );
};

export default ManuscriptSubmission;