import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/api';

function Homepage() {
  // State to store the popular posts
  const [popularPosts, setPopularPosts] = useState([]);
  const [weeklyData] = useState([]);
  const [dailyData] = useState([]);
  // Weekly chart data - matches the exact heights shown in image

  // Daily chart data - matches the exact heights shown in image


  // Writers data
  useEffect(() => {
    getMostViewedArticle();
  }, []);

  async function getMostViewedArticle() {
    try {
      const response = await api.get('/admin/article/list');
      
      // Assuming the response.data contains the articles list
      if (response.data && Array.isArray(response.data)) {
        // Sort articles by views in descending order
        const sortedArticles = response.data.sort((a, b) => b.views - a.views);
        
        // Get top 3 most viewed articles
        const top3Articles = sortedArticles.slice(0, 3);
        
        // Update the popularPosts state
        setPopularPosts(top3Articles);
      }
    } catch (error) {
      console.error('Error fetching most viewed articles:', error);
    }
  }

  return (
    <div className="app">
      <div className="content-wrapper">
        
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
            
            {/* Popular Posts - EXACT MATCH */}
            <div className="chart-card">
              <h3 className="chart-title">Bài được xem nhiều trong ngày</h3>
              <div className="popular-posts">
                {popularPosts.map((post) => (
                  <div key={post.id} className="popular-post-item">
                    <div className="post-info">
                      <h4 className="post-title">{post.title}</h4>
                      <div className="post-meta">
                        <span className="post-category">{post.category}</span>
                        {post.writer && (
                          <div className="writer-badge">
                            <span className="writer-text">{post.writer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="post-views">
                      <span className="views-icon">👁️</span>
                      <span className="views-count">{post.views}</span>
                    </div>
                  </div>
                ))}
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

export default Homepage;