import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/api';

function WriterAnalytic() {
  const [mostRecentReviewArticle, setMostRecentReviewArticle] = useState(null);
  
  useEffect(() => {
    async function fetchArticles() {
      try {
        // Fetch most recent published article
        const publishedResponse = await api.get('/writer/article/get-most-recent-article');        
        // Fetch most recent review article (assuming there's an endpoint for this)
        // Replace with the actual endpoint for review articles
        setMostRecentReviewArticle(publishedResponse.data.data["1"]);
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    }
    
    fetchArticles();
  }, []);

  // Weekly chart data - matches the exact heights shown in image
  const weeklyData = [
    { date: '27/3', views: 320 },
    { date: '28/3', views: 380 },
    { date: '29/3', views: 280 },
    { date: '30/3', views: 340 },
    { date: '31/3', views: 390 },
    { date: '1/4', views: 310 },
    { date: '2/4', views: 350 },
  ];

  // Daily chart data - matches the exact heights shown in image
  const dailyData = [
    { hour: '6h', views: 270 },
    { hour: '7h', views: 310 },
    { hour: '8h', views: 310 },
    { hour: '9h', views: 330 },
    { hour: '10h', views: 370 },
    { hour: '11h', views: 370 },
    { hour: '12h', views: 350 },
  ];
  // Function to format the date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="app">
      <div className="content-wrapper">
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Báo điện tử</h3>
            <ul className="sidebar-menu">
              <li className="sidebar-menu-item">
                <span>Quản trị bài viết</span>
                <span className="arrow">›</span>
              </li>
              <li className="sidebar-menu-item">
                <span>Thay điện</span>
                <span className="arrow">›</span>
              </li>
              <li className="sidebar-menu-item">
                <span>Quiz</span>
                <span className="arrow">›</span>
              </li>
              <li className="sidebar-menu-item">
                <span>Tác giả</span>
                <span className="arrow">›</span>
              </li>
            </ul>
          </div>
          <div className="sidebar-section">
            <h3 className="sidebar-title">Báo in</h3>
            <ul className="sidebar-menu">
              <li className="sidebar-menu-item">
                <span>Quản trị bài viết</span>
                <span className="arrow">›</span>
              </li>
            </ul>
          </div>
        </aside>
        
        <main className="dashboard">
          <div className="dashboard-grid">
            {/* Weekly Views Chart - EXACT MATCH */}
            <div className="chart-card">
              <h3 className="chart-title">Lượt xem trong tuần</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart 
                    data={weeklyData} 
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                    barCategoryGap={40}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={true} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={true} 
                      tickLine={false} 
                      stroke="#000"
                      dy={10}
                    />
                    <YAxis hide={true} />
                    <Tooltip />
                    <Bar 
                      dataKey="views" 
                      fill="#f7a5b8" 
                      barSize={25} 
                      radius={[0, 0, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Daily Views Chart - EXACT MATCH */}
            <div className="chart-card">
              <h3 className="chart-title">Lượt xem trong ngày</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart 
                    data={dailyData} 
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                    barCategoryGap={40}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={true} />
                    <XAxis 
                      dataKey="hour" 
                      axisLine={true} 
                      tickLine={false} 
                      stroke="#000"
                      dy={10}
                    />
                    <YAxis hide={true} />
                    <Tooltip />
                    <Bar 
                      dataKey="views" 
                      fill="#f7a5b8" 
                      barSize={25} 
                      radius={[0, 0, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Most Recent Articles - MODIFIED */}
            <div className="flex flex-row justify-between w-full">
      {/* Left column - Author info */}
      <div className="flex flex-col items-center">
        {/* Person at laptop icon */}
        <div className="mb-2 text-center">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <circle cx="12" cy="7" r="4" />
            <rect x="8" y="13" width="8" height="4" />
            <rect x="2" y="17" width="20" height="2" />
          </svg>
        </div>
        <div className="text-center font-medium">Được gửi lên</div>
        <div className="text-center">ban biên tập</div>
        <div className="text-center mt-2">({mostRecentReviewArticle?.name})</div>
        <div className="text-center text-sm text-gray-600">
          {formatDate(mostRecentReviewArticle?.date)}
        </div>
      </div>

      {/* Right column - Editor info */}
      <div className="flex flex-col items-center">
        {/* Document with checkmark icon */}
        <div className="mb-2 text-center">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <rect x="8" y="2" width="12" height="16" />
            <rect x="10" y="4" width="8" height="1" />
            <rect x="10" y="7" width="8" height="1" />
            <rect x="10" y="10" width="8" height="1" />
            <rect x="10" y="13" width="5" height="1" />
            <circle cx="16" cy="16" r="5" />
            <path d="M14,16 L15.5,17.5 L18,15" strokeWidth="1" stroke="white" fill="none" />
          </svg>
        </div>
        <div className="text-center font-medium">Được chấp thuận</div>
        <div className="text-center">xuất bản</div>
        <div className="text-center mt-2">({mostRecentReviewArticle?.name})</div>
        <div className="text-center text-sm text-gray-600">
          {formatDate(mostRecentReviewArticle?.date)}
        </div>
      </div>
    </div>
            
            {/* Writers Chart - EXACT MATCH */}
            <div className="chart-card">
              <h3 className="chart-title">Phóng viên viết nhiều</h3>
              <div className="writers-chart-container">
                <div className="writers-chart">
                  <div className="bar-container">
                    <div className="writer-bar" style={{ height: '140px', backgroundColor: '#9370DB' }}></div>
                    <div className="writer-bar" style={{ height: '100px', backgroundColor: '#f7a5b8' }}></div>
                    <div className="writer-bar" style={{ height: '80px', backgroundColor: '#5bc0de' }}></div>
                  </div>
                  <div className="chart-axis">
                    <div className="y-axis-label">7</div>
                    <div className="x-axis-label">Số bài</div>
                    <div className="y-axis-label">0</div>
                  </div>
                </div>
                <div className="writer-legend">
                  <div className="writer-legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#9370DB' }}></span>
                    <span className="legend-name">Nguyễn Văn A</span>
                  </div>
                  <div className="writer-legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#f7a5b8' }}></span>
                    <span className="legend-name">Lê Văn B</span>
                  </div>
                  <div className="writer-legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#5bc0de' }}></span>
                    <span className="legend-name">Trần Văn C</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default WriterAnalytic;