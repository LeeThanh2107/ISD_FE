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

const ListScreen = () => {
  const [articles, setArticle] = useState([]);
  const hasFetched = useRef(false);

  const getListArticle = async () => {
    try {
      const response = await api.get('/editor/article/list');
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
        <h2 className="page-title">Bài viết chưa phê duyệt</h2>
      </header>

      <main className="task-list">
        {Object.keys(groupedByDate).length > 0 ? (
          Object.entries(groupedByDate).map(([date, articlesOnDate]) => (
            <div key={date}>
              <div className="date-header">Ngày {date}</div>
              {articlesOnDate.map((article, index) => (
                <div key={index} className="task-card full-width">
                  <div className="card-title">
                    <Link to={`../editor/review/${article.encryptedId}`} dangerouslySetInnerHTML={{ __html: striptags(article.title, ['b', 'i']) }}></Link>
                  </div>
                  <div className="card-summary"  dangerouslySetInnerHTML={{ __html: striptags(article.summary, ['b', 'i']) }}>
                  </div>
                  <div className="card-author">
                    👤 {article.authorName}
                    ✍️ {article.reviewerName}
                    🕒 {formatTime(article.createdAt)}
                  </div>
                  <div className="card-meta">
                    <div>
                      <span className="label">Trạng thái:</span>
                      <span className={
                        article.status === 3 ? 'status-published'
                          : article.status === 4 ? 'status-rejected'
                            : 'status-pending'
                      }>
                        {article.status === 3 ? 'Được xuất bản' :
                          article.status === 4 ? 'Bị từ chối' :
                            'Chờ được phê duyệt'}
                      </span>
                    </div>
                    {article.comment && (
                      <div><span className="label">Nhận xét:</span> {article.comment}</div>
                    )}
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
            <h3 className="card-title">{!hasFetched.current ? 'Đang tải bài viết' : 'Không có bài viết chưa được duyệt'}</h3>
          </div>
        )}
      </main>
    </div>
  );
};

export default ListScreen;
