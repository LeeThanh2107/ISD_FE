import React, { useEffect, useState, useRef } from 'react';
import api from '../../api/api'
import '../../css/ListScreen.css';
import { Link } from 'react-router-dom';
import striptags from 'striptags';

const formatDate = (datetime) => {
  const d = new Date(datetime);
  return d.toLocaleDateString('vi-VN');
};

const formatTime = (datetime) => {
  const d = new Date(datetime);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};
// Helper function to get status text (Place this inside your component or import it)
const getStatusText = (status) => {
  switch (status) {
    case 0:
      return 'Bản nháp';
    case 1: // Status 1 in your code seems to be editable by writer
      return 'Chờ được phê duyệt'; // Matches the image text
    case 2: // Assuming 2 means approved but not published
      return 'Đã duyệt';
    case 3: // Assuming 3 means published
      return 'Đã xuất bản';
    case 4: // Assuming 4 means rejected/returned
      return 'Bị trả lại';
    // Add other cases as needed based on your actual status codes
    default:
      return 'Không xác định';
  }
};
const ListScreen = () => {
  const [articles, setArticle] = useState([]);
  const hasFetched = useRef(false);

  const getListArticle = async () => {
    try {
      const response = await api.get('/writer/article/list');
      setArticle(response.data.data);
    } catch (err) { }
  };

  useEffect(() => {
    async function fetchData(){
      if (!hasFetched.current) {
        await getListArticle();
        hasFetched.current = true;
      }
    }
    fetchData();
  }, []);

  const groupedByDate = articles.reduce((acc, item) => {
    const date = formatDate(item.createdAt);
    acc[date] = acc[date] || [];
    acc[date].push(item);
    return acc;
  }, {});

  return (
    <div className="full-list-wrapper">
      <header className="header">
        <h2 className="page-title">Danh sách bài viết</h2>
      </header>

      <main className="task-list">
    {Object.keys(groupedByDate).length > 0 ? (
      Object.entries(groupedByDate).map(([date, articlesOnDate]) => (
        <div key={date}>
          <div className="date-header">Ngày {date}</div>
          {articlesOnDate.map((article, index) => (
            <div key={index} className="task-card full-width">
                {/* --- Title --- */}
                  <div className="card-title">
                    {/* Make sure striptags and Link are correctly imported/defined */}
                    <Link to={`../writer/edit/${article.encryptedId}`} dangerouslySetInnerHTML={{ __html: striptags(article.title, ['b', 'i']) }}></Link>
                  </div>
                {/* --- Summary --- */}
                <div className="card-summary" dangerouslySetInnerHTML={{ __html: striptags(article.summary, ['b', 'i']) }}>
                </div>
                {/* --- Author/Reviewer/Time --- */}
                <div className="card-author">
                  👤 {article.authorName}
                  {/* Conditionally display reviewer if available */}
                  {article.reviewerName && ` ✍️ ${article.reviewerName}`}
                  🕒 {formatTime(article.createdAt)} {/* Ensure formatTime is defined */}
                </div>
                {/* --- Meta Info (Status, Comment, Note) --- */}
                <div className="card-meta">
                  {/* === ADDED STATUS DISPLAY === */}
                  <div>
                    {/* Use the existing "label" class for consistency, or create a new one */}
                    <span className="label">Trạng thái:</span> {getStatusText(article.status)}
                  </div>
                  {/* === END ADDED STATUS DISPLAY === */}

                  {/* Existing Comment Display */}
                  {article.comment && (
                    <div><span className="label">Nhận xét:</span> {article.comment}</div>
                  )}
                  {/* Existing Note Display */}
                  {article.note && (
                    <div><span className="label">Ghi chú:</span> {article.note}</div>
                  )}
                </div>
            </div>
          ))}
        </div>
      ))
    ) : (
      <div className="task-card full-width">
         {/* Ensure hasFetched is defined and managed correctly */}
        <h3 className="card-title">{!hasFetched.current ? 'Đang tải bài viết' : 'Không có bài viết'}</h3>
      </div>
    )}
  </main>
    </div>
  );
};

export default ListScreen;
