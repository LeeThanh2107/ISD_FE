import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // For clickable article links
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'; // Added Cell for author chart colors
import api from '../../api/api'; // Your configured API client
import styles from '../../css/Homepage.module.css'; // Your CSS Module

// --- Helper Functions ---

/**
 * Utility to format Date object to 'YYYY-MM-DD'
 */
const formatDate = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Utility to get short day name (e.g., 'Mon', 'Tue') - English for consistency
 */
const getShortDayName = (date) => {
   if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Utility to format date as DD/MM for chart axis
 */

/**
 * Calculates Top 5 daily (yesterday), Top 5 weekly (last 7 days),
 * TOTAL views, and ensures authorName exists for articles.
 * Returns processed lists AND the full list with calculated views.
 *
 * @param {Array<Object>} articles - Array of article objects from API.
 * @returns {{top5Weekly: Array<Object>, top5Daily: Array<Object>, articlesWithCalculatedViews: Array<Object>}}
 */
const getPopularArticles = (articles) => {
  if (!articles || !Array.isArray(articles)) {
    console.error("getPopularArticles: Invalid articles input, expected an array.");
    return { top5Weekly: [], top5Daily: [], articlesWithCalculatedViews: [] };
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayString = formatDate(yesterday); // yyyy-MM-DD format
  const last7DaysStrings = new Set();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today); date.setDate(today.getDate() - i);
    last7DaysStrings.add(formatDate(date));
  }

  // Calculate views and add authorName for each article
  const articlesWithCalculatedViews = articles.map(article => {
    let dailyViews = 0;
    let weeklyViews = 0;
    let totalViews = 0;
    // Determine author name (adjust field access based on your API structure)
    // Ensure consistency with calculateAuthorArticleCounts
    const authorName = article.authorName || article.writer?.name || "Unknown Author";

    if (article && Array.isArray(article.viewsList)) {
      article.viewsList.forEach(viewRecord => {
        if (viewRecord && typeof viewRecord === 'object' && viewRecord.hasOwnProperty('numberOfViews')) {
            const views = typeof viewRecord.numberOfViews === 'number' && !isNaN(viewRecord.numberOfViews) ? viewRecord.numberOfViews : 0;
            totalViews += views; // Accumulate total views
            // Check date format before calculating daily/weekly
            if (viewRecord.date && typeof viewRecord.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(viewRecord.date)) {
                if (viewRecord.date === yesterdayString) { dailyViews += views; }
                if (last7DaysStrings.has(viewRecord.date)) { weeklyViews += views; }
            }
        }
      });
    }
    // Return article object augmented with calculated views and authorName
    // Also include id/articleId for linking
    return {
        ...article,
        authorName, // Ensure this is populated correctly based on your data
        dailyViews,
        weeklyViews,
        totalViews,
        id: article.articleId || article.id // Ensure an ID exists for links/keys
    };
  }).filter(article => article != null);

  // Sort and slice for Top 5 lists
  const sortedByWeeklyViews = [...articlesWithCalculatedViews].sort((a, b) => b.weeklyViews - a.weeklyViews);
  const top5Weekly = sortedByWeeklyViews.slice(0, 5);

  const sortedByDailyViews = [...articlesWithCalculatedViews].sort((a, b) => b.dailyViews - a.dailyViews);
  const top5Daily = sortedByDailyViews.slice(0, 5); // This list includes totalViews and authorName

  // Return top lists AND the full list needed for author aggregation
  return { top5Weekly, top5Daily, articlesWithCalculatedViews };
};

/**
 * Calculates the TOTAL views across ALL articles for each of the last 7 days.
 * Used for the weekly trend chart.
 *
 * @param {Array<Object>} articles - Array of article objects, each with a viewsList.
 * @returns {Array<Object>} - Array like [{ day: "Mon", date: "YYYY-MM-DD", views: 150 }, ...] sorted chronologically.
 */
const calculateWeeklyChartData = (articles) => {
  if (!articles || !Array.isArray(articles)) { return []; }
  const today = new Date();
  const weeklyTotals = new Map(); const dateMap = new Map();
  for (let i = 6; i >= 0; i--) {
      const date = new Date(today); date.setDate(today.getDate() - i);
      const dateString = formatDate(date); // Use YYYY-MM-DD
      weeklyTotals.set(dateString, 0); dateMap.set(dateString, date);
  }
  articles.forEach(article => {
      if (article && Array.isArray(article.viewsList)) {
          article.viewsList.forEach(viewRecord => {
              if (viewRecord?.date && typeof viewRecord.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(viewRecord.date) && weeklyTotals.has(viewRecord.date)) {
                   const views = typeof viewRecord.numberOfViews === 'number' && !isNaN(viewRecord.numberOfViews) ? viewRecord.numberOfViews : 0;
                   weeklyTotals.set(viewRecord.date, weeklyTotals.get(viewRecord.date) + views);
              }
          });
      }
  });
  const chartData = Array.from(weeklyTotals.entries()).map(([dateString, totalViews]) => ({
      day: getShortDayName(dateMap.get(dateString)), date: dateString, views: totalViews
  }));
  return chartData;
};


/**
 * Adapts the top 5 daily articles data for the vertical bar chart.
 *
 * @param {Array<Object>} top5DailyArticles - Array from getPopularArticles (needs id/articleId, title, dailyViews).
 * @returns {Array<Object>} - Array like [{ id: ..., name: "Article Title", views: article.dailyViews }, ...]
 */
const adaptTopDailyForChart = (top5DailyArticles) => {
    if (!top5DailyArticles || !Array.isArray(top5DailyArticles)) { return []; }
    return top5DailyArticles.slice(0, 5).map(article => ({
        id: article.articleId || article.id || `unknown-${Math.random()}`,
        name: article.title || article.articleId || 'Unknown Article',
        views: article.dailyViews // Uses DAILY views for this specific chart
    }));
};

/**
 * Aggregates article counts per author from a list of articles.
 * Requires articles to have an 'authorName' or 'writer.name' property.
 *
 * @param {Array<Object>} articles - Array of article objects.
 * @param {number} topN - Number of top authors to return based on count.
 * @returns {Array<Object>} - Sorted array like [{ name: "Author Name", articleCount: number }, ...]
 */
const calculateAuthorArticleCounts = (articles, topN = 3) => {
    if (!articles || !Array.isArray(articles)) {
        console.warn("calculateAuthorArticleCounts received invalid input");
        return [];
    }
    const authorCounts = {}; // { authorName: count }

    articles.forEach(article => {
        // Use the authorName added/determined in getPopularArticles
        const author = article.authorName;

        // Aggregate only if author name is valid
        if (author && typeof author === 'string' && author !== "Unknown Author") {
            authorCounts[author] = (authorCounts[author] || 0) + 1; // Increment count
        }
    });

    // Convert the totals object into an array [{ name, articleCount }]
    const authorDataArray = Object.entries(authorCounts)
        .map(([name, articleCount]) => ({ name, articleCount }));

    // Sort authors by article count in descending order
    authorDataArray.sort((a, b) => b.articleCount - a.articleCount);

    // Return the top N authors
    return authorDataArray.slice(0, topN);
};
// --- End Helper Functions ---


// ===== HOMEPAGE COMPONENT =====
function Homepage() {
  // --- State Definitions ---
  const [topArticlesDaily, setTopArticlesDaily] = useState([]);   // Contains totalViews & authorName
  const [weeklyChartData, setWeeklyChartData] = useState([]);     // Aggregated views per day
  const [dailyChartData, setDailyChartData] = useState([]);       // Top 5 daily articles (name+dailyViews) for chart
  const [authorCountChartData, setAuthorCountChartData] = useState([]); // Top authors by article count
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Colors for the Author chart bars
  const AUTHOR_CHART_COLORS = ['#9370DB', '#f7a5b8', '#5bc0de', '#ffc107', '#20c997'];

  // --- Data Fetching and Processing Effect ---
  useEffect(() => {
    const getHomepageData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch article list (ensure includes viewsList, writer/author info, category etc.)
        const response = await api.get('/admin/article/list'); // Adjust endpoint if needed

        let allArticlesRaw = [];
        // Adapt parsing based on your API structure
        if (response?.data?.data && Array.isArray(response.data.data)) {
            allArticlesRaw = response.data.data;
        } else if (response?.data && Array.isArray(response.data)) {
             allArticlesRaw = response.data;
        } else {
          console.error('API response data is not in expected format for article list:', response?.data);
          throw new Error("Invalid article list data format received from API.");
        }

        // --- Calculate all derived data ---
        // getPopularArticles adds totalViews, authorName etc. and returns top lists + full list
        const { top5Daily, articlesWithCalculatedViews } = getPopularArticles(allArticlesRaw);
        setTopArticlesDaily(top5Daily); // Used for rendering the list section

        // Calculate data for the aggregated weekly trend chart
        const weeklyData = calculateWeeklyChartData(articlesWithCalculatedViews);
        setWeeklyChartData(weeklyData);

        // Adapt the top 5 daily articles specifically for the vertical bar chart
        const dailyDataForChart = adaptTopDailyForChart(top5Daily);
        setDailyChartData(dailyDataForChart);

        // Calculate data for the top authors chart (by article count)
        const authorCountData = calculateAuthorArticleCounts(articlesWithCalculatedViews, 3); // Get top 3
        setAuthorCountChartData(authorCountData);
        // --- End calculation ---

      } catch (error) {
        console.error('Error fetching or processing homepage data:', error);
        setError(error.message || 'Failed to fetch data');
        // Clear all data states on error
        setTopArticlesDaily([]);
        setWeeklyChartData([]); setDailyChartData([]);
        setAuthorCountChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    getHomepageData();
  }, []); // Empty dependency array: run once on mount


  // --- Render Logic ---

  if (isLoading) {
      return <div className={styles.app}><div className={styles['content-wrapper']}><main className={styles.dashboard}><p className={styles.loadingMessage}>Loading dashboard data...</p></main></div></div>;
  }
  if (error) {
      return <div className={styles.app}><div className={styles['content-wrapper']}><main className={styles.dashboard}><p className={styles.errorMessage}>Error loading data: {error}</p></main></div></div>;
  }

  return (
    <div className={styles.app}>
      <div className={styles['content-wrapper']}>
        <main className={styles.dashboard}>
          <div className={styles['dashboard-grid']}>

            {/* Card 1: Weekly Views Chart */}
            <div className={styles['chart-card']}>
                 <h3 className={styles['chart-title']}>Lượt xem trong tuần</h3>
                 <div className={styles['chart-container']}>
                     <ResponsiveContainer width="100%" height={200}>
                         <BarChart data={weeklyChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }} barCategoryGap="30%">
                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
                             <XAxis dataKey="day" axisLine={false} tickLine={false} stroke="#666" dy={10} fontSize={12} />
                             <YAxis axisLine={false} tickLine={false} stroke="#666" fontSize={12} width={40} />
                             <Tooltip cursor={{ fill: 'rgba(247, 165, 184, 0.1)' }} content={({ active, payload, label }) => {
                                 if (active && payload && payload.length) {
                                     const dateString = payload[0]?.payload?.date || ''; // Full YYYY-MM-DD
                                     return ( <div className={styles.customTooltip || 'customTooltip'}> <p>{`Ngày: ${dateString} (${label})`}</p> <p>{`Tổng xem: ${payload[0].value}`}</p> </div> );
                                 } return null;
                             }}/>
                             <Bar dataKey="views" name="Lượt xem" fill="#f7a5b8" barSize={20} radius={[4, 4, 0, 0]} />
                         </BarChart>
                     </ResponsiveContainer>
                 </div>
            </div>

            {/* Card 2: Daily Views Chart (Top 5 Articles Yesterday) */}
            <div className={styles['chart-card']}>
                 <h3 className={styles['chart-title']}>Top 5 bài viết hôm qua</h3>
                 <div className={styles['chart-container']}>
                     <ResponsiveContainer width="100%" height={200}>
                         <BarChart layout="vertical" data={dailyChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                             <XAxis type="number" hide={true} />
                             <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} stroke="#666" fontSize={10} width={120} interval={0} />
                             <Tooltip cursor={{ fill: 'rgba(136, 132, 216, 0.1)' }} content={({ active, payload, label }) => {
                                 if (active && payload && payload.length) {
                                     return ( <div className={styles.customTooltip || 'customTooltip'}> <p>{`${label}`}</p> <p>{`Xem hôm qua: ${payload[0].value}`}</p> </div> );
                                 } return null;
                             }}/>
                             <Bar dataKey="views" name="Lượt xem hôm qua" fill="#8884d8" barSize={15} radius={[0, 4, 4, 0]} />
                         </BarChart>
                     </ResponsiveContainer>
                 </div>
            </div>

            {/* Card 3: Popular Posts List (Top 5 Daily - Clickable, Showing TOTAL views) */}
            <div className={styles['chart-card']}>
              <h3 className={styles['chart-title']}>Top 5 bài viết hôm qua (Tổng lượt xem)</h3>
              <div className={styles['popular-posts']}>
                {topArticlesDaily.length > 0 ? (
                   topArticlesDaily.map((post) => {
                     const articleId = post.articleId || post.id;
                     if (!articleId) {
                        // Render non-clickable item if ID is missing
                        return (
                           <div key={post.title || Math.random()} className={styles['popular-post-item']}>
                                <div className={styles['post-info']}>
                                    <h4 className={styles['post-title']}>{post.title || 'Không có tiêu đề'}</h4>
                                    <div className={styles['post-meta']}>
                                        {post.category && <span className={styles['post-category']}>{post.category}</span>}
                                        {post.authorName && post.authorName !== "Unknown Author" && (
                                            <div className={styles['writer-badge']}> <span className={styles['writer-text']}>{post.authorName}</span> </div>
                                        )}
                                    </div>
                                </div>
                                <div className={styles['post-views']}>
                                    <span className={styles['views-icon']}>👁️</span>
                                    {/* Shows TOTAL views */}
                                    <span className={styles['views-count']}>{post.totalViews ?? 0}</span>
                                </div>
                           </div>
                        );
                     }
                     // Render clickable item using Link
                     return (
                        <Link
                            key={articleId}
                            to={`/admin/analytic/${articleId}`} // Links to analytic page
                            className={styles['popular-post-item-link']}
                        >
                            <div className={styles['popular-post-item']}>
                                <div className={styles['post-info']}>
                                    <h4 className={styles['post-title']}>{post.title || 'Không có tiêu đề'}</h4>
                                    <div className={styles['post-meta']}>
                                        {post.category && <span className={styles['post-category']}>{post.category}</span>}
                                        {post.authorName && post.authorName !== "Unknown Author" && (
                                            <div className={styles['writer-badge']}>
                                                <span className={styles['writer-text']}>{post.authorName}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={styles['post-views']}>
                                    <span className={styles['views-icon']}>👁️</span>
                                    {/* Shows TOTAL views */}
                                    <span className={styles['views-count']}>{post.totalViews ?? 0}</span>
                                </div>
                            </div>
                        </Link>
                     );
                   })
                 ) : (
                    <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                      Không có dữ liệu bài viết cho ngày hôm qua.
                    </p>
                 )}
              </div>
            </div>

            {/* Card 4: Writers Chart (Top Authors by ARTICLE COUNT) */}
            <div className={styles['chart-card']}>
                 <h3 className={styles['chart-title']}>Phóng viên viết nhiều bài nhất</h3>
                  <div className={styles['chart-container']}>
                      {authorCountChartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={200}>
                              <BarChart
                                  layout="vertical"
                                  data={authorCountChartData} // Use author COUNT data
                                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                  <XAxis type="number" hide={true} />
                                  <YAxis
                                      dataKey="name" // Author name
                                      type="category" axisLine={false} tickLine={false}
                                      stroke="#666" fontSize={11} width={100} interval={0}
                                  />
                                  <Tooltip cursor={{ fill: 'rgba(147, 112, 219, 0.1)' }} content={({ active, payload, label }) => {
                                      if (active && payload && payload.length) {
                                          // Shows ARTICLE COUNT in tooltip
                                          return ( <div className={styles.customTooltip || 'customTooltip'}> <p>{`${label}`}</p> <p>{`Số bài viết: ${payload[0].value}`}</p> </div> );
                                      } return null;
                                  }}/>
                                  <Bar
                                     dataKey="articleCount" // Use articleCount
                                     name="Số bài viết"
                                     barSize={20}
                                     radius={[0, 4, 4, 0]}
                                  >
                                     {/* Assign colors to each author bar */}
                                     {authorCountChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={AUTHOR_CHART_COLORS[index % AUTHOR_CHART_COLORS.length]} />
                                     ))}
                                  </Bar>
                              </BarChart>
                          </ResponsiveContainer>
                      ) : (
                          <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                              Không có đủ dữ liệu tác giả.
                          </div>
                      )}
                  </div>
            </div>

          </div> {/* End dashboard-grid */}
        </main>
      </div> {/* End content-wrapper */}
    </div> // End app
  );
}

export default Homepage;