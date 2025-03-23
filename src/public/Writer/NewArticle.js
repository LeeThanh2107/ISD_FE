import React, { useState } from 'react';
import '../../css/NewArticle.css';

const ManuscriptSubmission = () => {
  // Initial placeholder texts
  const initialTitle = 'Nhập tiêu đề bài viết tại đây. Enter để xuông dòng. Tab để chuyển bài viết';
  const initialDescription = 'Nhập tóm tắt bài viết tại đây. Tab để chuyển tới khóa tiếp theo.';
  const initialContent =
    'Gõ nội dung tại đây. Nhấn Tab hoặc Enter để tạo đoạn văn mới. Nhấn dòng thường Shift Enter để xuống dòng trong một đoạn văn mới.';

  // State management
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [content, setContent] = useState(initialContent);
  const [section, setSection] = useState('');
  const [writer, setWriter] = useState('');
  const [images, setImages] = useState([]);
  const [caption, setCaption] = useState('');

  // State to control input visibility
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
  const [isContentEditing, setIsContentEditing] = useState(false);

  // Formatting states
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);

  // Word and character count
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  // Format text functions
  const applyFormatting = (tag) => {
    const selectedText = content.substring(selectionStart, selectionEnd);

    if (selectedText) {
      let formattedText;
      switch (tag) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'strike':
          formattedText = `<s>${selectedText}</s>`;
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
        `\n<div style="text-align: ${alignment}">${selectedText}</div>\n` +
        content.substring(selectionEnd);
      setContent(newContent);
    }
  };

  // Image handling
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      const imageObj = {
        file: file,
        url: URL.createObjectURL(file),
        caption: caption,
      };
      setImages([...images, imageObj]);
      setCaption('');
    } else {
      alert('Only PNG and JPG formats are accepted');
    }
  };

  // Handle submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description || !content || !section || !writer) {
      alert('Submission failed. Please ensure all required fields are completed.');
      return;
    }

    console.log({
      title,
      description,
      content,
      section,
      writer,
      images,
    });
    alert('Manuscript submitted successfully!');
  };

  // Handle text selection
  const handleSelection = (e) => {
    setSelectionStart(e.target.selectionStart);
    setSelectionEnd(e.target.selectionEnd);
  };

  // Handle Enter key to create paragraphs and Tab to exit
  const handleKeyDown = (e, setter, setEditing) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setter((prev) => prev + '\n\n');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setEditing(false); // Simulate "Tab để chuyển tới khóa tiếp theo"
    }
  };

  // Handle blur (exit editing) and restore placeholder if empty
  const handleBlur = (value, setter, setEditing, initialValue) => {
    if (value.trim() === '') {
      setter(initialValue); // Restore the initial placeholder text
    }
    setEditing(false); // Hide the input
  };

  return (
    <div className="manuscript-container">
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="form-group">
          {isTitleEditing ? (
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() =>
                handleBlur(description, setDescription, setIsDescriptionEditing, initialDescription)
              }
              onKeyDown={(e) => handleKeyDown(e, setDescription, setIsDescriptionEditing)}
              className="editable-input description-input"
              autoFocus
            />
          ) : (
            <p onClick={() => setIsDescriptionEditing(true)} className="description">
              {description}
            </p>
          )}
        </div>

        {/* Editor */}
        <div className="editor-container">
          <div className="toolbar">
            <button type="button" onClick={() => applyFormatting('bold')}>
              B
            </button>
            <button type="button" onClick={() => applyFormatting('italic')}>
              I
            </button>
            <button type="button" onClick={() => applyFormatting('underline')}>
              U
            </button>
            <button type="button" onClick={() => applyFormatting('strike')}>
              S
            </button>

            <button type="button" onClick={() => applyAlignment('left')}>
              Left
            </button>
            <button type="button" onClick={() => applyAlignment('center')}>
              Center
            </button>
            <button type="button" onClick={() => applyAlignment('right')}>
              Right
            </button>
            <button type="button" onClick={() => applyAlignment('justify')}>
              Justify
            </button>

            <label className="image-upload">
              Upload Image
              <input
                type="file"
                accept=".png,.jpg"
                onChange={handleImageUpload}
                hidden
              />
            </label>
          </div>

          {isContentEditing ? (
            <textarea
              id="manuscript-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onSelect={handleSelection}
              onBlur={() =>
                handleBlur(content, setContent, setIsContentEditing, initialContent)
              }
              onKeyDown={(e) => handleKeyDown(e, setContent, setIsContentEditing)}
              className="editable-input content-input"
              autoFocus
            />
          ) : (
            <p onClick={() => setIsContentEditing(true)} className="content">
              {content.split('\n\n').map((paragraph, index) => (
                <span key={index}>
                  {paragraph}
                  <br />
                  <br />
                </span>
              ))}
            </p>
          )}

          {/* Word/Character Count */}
          <div className="counter">
            Words: {wordCount} | Characters: {charCount}
          </div>

          {/* Image Caption */}
          {images.length > 0 && (
            <div className="caption-section">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Enter image caption"
              />
            </div>
          )}

          {/* Display Uploaded Images */}
          <div className="image-preview">
            {images.map((img, index) => (
              <div key={index} className="image-item">
                <img src={img.url} alt="Uploaded" />
                <p>{img.caption}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Writer Selection */}
        <div className="form-group">
          <label>Writer</label>
          <select
            value={writer}
            onChange={(e) => setWriter(e.target.value)}
            required
          >
            <option value="">Select Writer</option>
            <option value="writer1">Writer 1</option>
            <option value="writer2">Writer 2</option>
            <option value="writer3">Writer 3</option>
          </select>
        </div>

        {/* Section */}
        <div className="form-group">
          <label>Publish Section</label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            required
          >
            <option value="">Select Section</option>
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-Fiction</option>
            <option value="poetry">Poetry</option>
          </select>
        </div>

        <button type="submit" className="submit-btn">Submit Manuscript</button>
      </form>
    </div>
  );
};

export default ManuscriptSubmission;