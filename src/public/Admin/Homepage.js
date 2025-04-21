import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/api';
import styles from '../../css/Homepage.module.css'
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
    // Apply CSS Module classes
    <div className={styles.app}> {/* Use dot notation if class is 'app' in CSS */}
      <div className={styles['content-wrapper']}> {/* Use bracket notation for 'content-wrapper' */}

        <main className={styles.dashboard}> {/* Use dot notation for 'dashboard' */}
          <div className={styles['dashboard-grid']}> {/* Use bracket notation */}

            {/* Weekly Views Chart */}
            <div className={styles['chart-card']}> {/* Use bracket notation */}
              <h3 className={styles['chart-title']}>Lượt xem trong tuần</h3> {/* Use bracket notation */}
              <div className={styles['chart-container']}> {/* Use bracket notation */}
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={weeklyData} // Assume weeklyData is defined
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

            {/* Daily Views Chart */}
            <div className={styles['chart-card']}> {/* Use bracket notation */}
              <h3 className={styles['chart-title']}>Lượt xem trong ngày</h3> {/* Use bracket notation */}
              <div className={styles['chart-container']}> {/* Use bracket notation */}
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={dailyData} // Assume dailyData is defined
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

            {/* Popular Posts */}
            <div className={styles['chart-card']}> {/* Use bracket notation */}
              <h3 className={styles['chart-title']}>Bài được xem nhiều trong ngày</h3> {/* Use bracket notation */}
              <div className={styles['popular-posts']}> {/* Use bracket notation */}
                 {/* Assume popularPosts is defined */}
                {popularPosts.map((post) => (
                  <div key={post.id} className={styles['popular-post-item']}> {/* Use bracket notation */}
                    <div className={styles['post-info']}> {/* Use bracket notation */}
                      <h4 className={styles['post-title']}>{post.title}</h4> {/* Use bracket notation */}
                      <div className={styles['post-meta']}> {/* Use bracket notation */}
                        <span className={styles['post-category']}>{post.category}</span> {/* Use bracket notation */}
                        {post.writer && (
                          <div className={styles['writer-badge']}> {/* Use bracket notation */}
                            {/* Assuming 'writer-text' is defined in CSS */}
                            <span className={styles['writer-text']}>{post.writer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={styles['post-views']}> {/* Use bracket notation */}
                      {/* Assuming 'views-icon' is defined in CSS */}
                      <span className={styles['views-icon']}>👁️</span>
                      <span className={styles['views-count']}>{post.views}</span> {/* Use bracket notation */}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Writers Chart */}
            <div className={styles['chart-card']}> {/* Use bracket notation */}
              <h3 className={styles['chart-title']}>Phóng viên viết nhiều</h3> {/* Use bracket notation */}
              <div className={styles['writers-chart-container']}> {/* Use bracket notation */}
                <div className={styles['writers-chart']}> {/* Use bracket notation */}
                  <div className={styles['bar-container']}> {/* Use bracket notation */}
                    {/* Assuming data drives these styles or they are placeholders */}
                    <div className={styles['writer-bar']} style={{ height: '140px', backgroundColor: '#9370DB' }}></div>
                    <div className={styles['writer-bar']} style={{ height: '100px', backgroundColor: '#f7a5b8' }}></div>
                    <div className={styles['writer-bar']} style={{ height: '80px', backgroundColor: '#5bc0de' }}></div>
                  </div>
                  <div className={styles['chart-axis']}> {/* Use bracket notation */}
                    <div className={styles['y-axis-label']}>7</div> {/* Use bracket notation */}
                    <div className={styles['x-axis-label']}>Số bài</div> {/* Use bracket notation */}
                    <div className={styles['y-axis-label']}>0</div> {/* Use bracket notation */}
                  </div>
                </div>
                <div className={styles['writer-legend']}> {/* Use bracket notation */}
                  <div className={styles['writer-legend-item']}> {/* Use bracket notation */}
                    <span className={styles['legend-color']} style={{ backgroundColor: '#9370DB' }}></span> {/* Use bracket notation */}
                    {/* Assuming 'legend-name' is defined in CSS */}
                    <span className={styles['legend-name']}>Nguyễn Văn A</span>
                  </div>
                  <div className={styles['writer-legend-item']}> {/* Use bracket notation */}
                    <span className={styles['legend-color']} style={{ backgroundColor: '#f7a5b8' }}></span> {/* Use bracket notation */}
                    <span className={styles['legend-name']}>Lê Văn B</span>
                  </div>
                  <div className={styles['writer-legend-item']}> {/* Use bracket notation */}
                    <span className={styles['legend-color']} style={{ backgroundColor: '#5bc0de' }}></span> {/* Use bracket notation */}
                    <span className={styles['legend-name']}>Trần Văn C</span>
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