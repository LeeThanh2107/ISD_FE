import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Removed unused Link
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/api'; // Your configured API client
// Import CSS Module for the combined view
import styles from '../../css/ArticleDetailView.module.css'; // Adjust path if needed
// Import Font Awesome CSS if needed for icons
import '@fortawesome/fontawesome-free/css/all.min.css';

// --- Helper Functions ---

/**
 * Utility to format Date object to 'YYYY-MM-DD'
 * Needed for consistent date key handling.
 */
const formatDateToYYYYMMDD = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Utility to format date string (YYYY-MM-DD) or Date object to DD/MM/YYYY for display
 */
const formatDateForDisplay = (dateInput) => {
    let date;
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
        date = dateInput;
    } else if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
         try {
             const parts = dateInput.substring(0, 10).split('-');
             if (parts.length === 3) {
                // Use UTC date from parts to avoid TZ issues during comparison
                date = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
                if (isNaN(date.getTime())) return 'Invalid Date';
             } else { return 'Invalid Format'; }
         } catch (e) { return 'Invalid Date'; }
    } else {
        return 'N/A'; // Return N/A if input is not valid date or string
    }
    // Proceed with formatting if date is valid
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
};


/**
 * Utility to get short day name (e.g., 'Mon', 'Tue') - English for axis
 */
const getShortDayName = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Utility to format date as DD/MM for chart axis
 */
const formatShortDateForAxis = (dateInput) => {
    let date;
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) { date = dateInput; }
    else if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
         try {
             const parts = dateInput.substring(0, 10).split('-');
             if (parts.length === 3) {
                date = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
                if (isNaN(date.getTime())) return '';
             } else { return ''; }
         } catch (e) { return ''; }
    } else { return ''; }
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

/**
 * Calculates view data for the last 7 days from a single article's viewsList.
 *
 * @param {Array<Object>} viewsList - The article's viewsList array [{ date: "YYYY-MM-DD", numberOfViews: number }, ...].
 * @returns {Array<Object>} - Array like [{ day: "Mon", dateShort: "DD/MM", dateFull: "YYYY-MM-DD", views: number }, ...]
 */
const calculateLast7DaysViewData = (viewsList = []) => {
  if (!Array.isArray(viewsList)) { return []; }
  const today = new Date(); const dailyTotals = new Map(); const dateMap = new Map();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today); date.setDate(today.getDate() - i); date.setHours(0, 0, 0, 0);
    const dateString = formatDateToYYYYMMDD(date);
    dailyTotals.set(dateString, 0); dateMap.set(dateString, date);
  }
  viewsList.forEach(viewRecord => {
    if (viewRecord?.date && typeof viewRecord.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(viewRecord.date) && dailyTotals.has(viewRecord.date)) {
        const views = typeof viewRecord.numberOfViews === 'number' && !isNaN(viewRecord.numberOfViews) ? viewRecord.numberOfViews : 0;
        dailyTotals.set(viewRecord.date, dailyTotals.get(viewRecord.date) + views);
    }
  });
  const chartData = Array.from(dailyTotals.entries()).map(([dateString, totalViews]) => {
       const dateObject = dateMap.get(dateString);
       return { day: getShortDayName(dateObject), dateShort: formatShortDateForAxis(dateObject), dateFull: dateString, views: totalViews };
  });
  return chartData;
};

/**
 * Calculates view data aggregated by week for the last 4 full weeks.
 * Assumes weeks run Monday to Sunday.
 *
 * @param {Array<Object>} viewsList - The article's viewsList array [{ date: "YYYY-MM-DD", numberOfViews: number }, ...].
 * @returns {Array<Object>} - Array like [{ weekLabel: "Wk Apr 21", weekStart: ..., weekEnd: ..., views: number }, ...]
 */
const calculateLast4WeeksViewData = (viewsList = []) => {
    if (!Array.isArray(viewsList)) { return []; }
    const weeklyDataOutput = []; const today = new Date(); today.setHours(0, 0, 0, 0);
    const currentDayOfWeek = today.getDay();
    const diffToMonday = today.getDate() - currentDayOfWeek + (currentDayOfWeek === 0 ? -6 : 1);
    const startOfCurrentWeek = new Date(today); startOfCurrentWeek.setDate(diffToMonday);
    for (let i = 1; i <= 4; i++) {
        const weekStartDate = new Date(startOfCurrentWeek); weekStartDate.setDate(startOfCurrentWeek.getDate() - (i * 7)); weekStartDate.setHours(0, 0, 0, 0);
        const weekEndDate = new Date(weekStartDate); weekEndDate.setDate(weekStartDate.getDate() + 6); weekEndDate.setHours(23, 59, 59, 999);
        let weekTotalViews = 0;
        viewsList.forEach(record => {
            if (record?.date && typeof record.date === 'string' && record.hasOwnProperty('numberOfViews')) {
                try {
                    const parts = record.date.split('-');
                    if (parts.length === 3) {
                       const recordDate = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
                       const weekStartUTC = new Date(Date.UTC(weekStartDate.getUTCFullYear(), weekStartDate.getUTCMonth(), weekStartDate.getUTCDate()));
                       const weekEndUTC = new Date(Date.UTC(weekEndDate.getUTCFullYear(), weekEndDate.getUTCMonth(), weekEndDate.getUTCDate())); weekEndUTC.setUTCHours(23, 59, 59, 999);
                       if (!isNaN(recordDate.getTime()) && recordDate >= weekStartUTC && recordDate <= weekEndUTC) {
                            const views = typeof record.numberOfViews === 'number' && !isNaN(record.numberOfViews) ? record.numberOfViews : 0;
                            weekTotalViews += views;
                       }
                    }
                } catch (e) { console.error("Error parsing date in viewsList:", record.date, e); }
            }
        });
        const weekLabel = `Wk ${weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        weeklyDataOutput.unshift({ weekLabel: weekLabel, weekStart: formatDateToYYYYMMDD(weekStartDate), weekEnd: formatDateToYYYYMMDD(weekEndDate), views: weekTotalViews });
    }
    return weeklyDataOutput;
};
// --- End Helper Functions ---

// ===== Combined Article Detail View COMPONENT =====
function ArticleDetailView() {
  const { id } = useParams(); // Get article ID from route params
  const [articleDetail, setArticleDetail] = useState(null);
  const [weeklyChartData, setWeeklyChartData] = useState([]); // 4 WEEKS data for analytics
  const [dailyChartData, setDailyChartData] = useState([]);   // 7 DAYS data for analytics
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('analytics'); // 'analytics' or 'article'
  const [notes, setNotes] = useState(''); // State for notes

  useEffect(() => {
    async function fetchArticleData() {
      if (!id) {
        setError("Article ID not provided in URL.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      setArticleDetail(null);
      setWeeklyChartData([]);
      setDailyChartData([]);
      setNotes('');

      try {
        // Use the single API endpoint for fetching details
        const response = await api.post(`/admin/article/detail/${id}`);
        let fetchedArticle = null;

        // Adapt response parsing based on your actual API structure
         if (response?.data?.data) {
             if (typeof response.data.data === 'object' && response.data.data !== null) {
                 const firstKey = Object.keys(response.data.data)[0];
                 // Check if the first key is numeric-like and points to the actual data
                 if (!isNaN(firstKey) && response.data.data[firstKey]) {
                     fetchedArticle = response.data.data[firstKey];
                 } else {
                     fetchedArticle = response.data.data; // Assume data is the object itself
                 }
             } else {
                  fetchedArticle = response.data.data; // Fallback if data is not object/array
             }
         } else if (response?.data) {
             fetchedArticle = response.data; // If data is the direct response body
         }

        if (!fetchedArticle || typeof fetchedArticle !== 'object') {
            console.error('Invalid article data structure received:', response?.data);
            throw new Error('Fetched article data is not valid.');
        }

        console.log("Fetched Article Detail:", fetchedArticle);
        setArticleDetail(fetchedArticle);

        // Set notes state from fetched data
        setNotes(fetchedArticle.notes || ''); // Assuming 'notes' field exists

        // Calculate Chart Data
        const viewsList = fetchedArticle.viewsList || [];
        setWeeklyChartData(calculateLast4WeeksViewData(viewsList));
        setDailyChartData(calculateLast7DaysViewData(viewsList));

      } catch (err) {
        console.error('Error fetching article details:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch article data.');
         setArticleDetail(null); setWeeklyChartData([]); setDailyChartData([]); setNotes('');
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticleData();
  }, [id]); // Re-run effect if the article ID changes

  // --- Loading and Error States ---
  if (isLoading) {
    return <div className={styles.analyticContainer}><p className={styles.loadingMessage}>Loading article data...</p></div>;
  }
  if (error) {
    return <div className={styles.analyticContainer}><p className={styles.errorMessage}>Error: {error}</p></div>;
  }
   if (!articleDetail) {
    return <div className={styles.analyticContainer}><p>Article data not available.</p></div>;
  }

  // --- Safely access data for display ---
  // Adjust field names based on your ACTUAL API response structure
  const writerName = articleDetail.authorName || articleDetail.writer?.name || 'N/A';
  const editorName = articleDetail.editorName || articleDetail.editor?.name || 'N/A';
  const submittedDate = articleDetail.sendToEditorAt || articleDetail.createDate || null;
  const publishedDate = articleDetail.publishedAt || articleDetail.approvedDate || null;
  const articleTitle = articleDetail.title || 'N/A';
  const articleSummary = articleDetail.summary || '';
  const articleContent = articleDetail.content || '';
  // 'notes' state variable holds the notes content


  // --- Render Logic ---
  return (
    <div className={styles.analyticContainer}>

      {/* Header with Title and Toggle Buttons */}
      <div className={styles.pageHeader}>
        <h2 className={styles.mainTitle}>
          {activeView === 'analytics' ? 'Thống kê về bài viết' : 'Nội dung bài viết'}: {articleTitle}
        </h2>
        <div className={styles.viewToggleButtons}>
          <button
            onClick={() => setActiveView('analytics')}
            className={activeView === 'analytics' ? styles.activeButton : styles.inactiveButton}
          >
            Thống kê
          </button>
          <button
            onClick={() => setActiveView('article')}
            className={activeView === 'article' ? styles.activeButton : styles.inactiveButton}
          >
            Bài viết
          </button>
        </div>
      </div>

      {/* Conditional Rendering based on activeView */}
      {activeView === 'analytics' ? (
        // --- Analytics View ---
        <main className={styles.dashboard}>
          <div className={styles.dashboardGrid}>
            {/* Chart 1: Past 4 Weeks */}
            <div className={styles.chartCard}>
               <h3 className={styles.chartTitle}>Lượt xem 4 tuần qua</h3>
               <div className={styles.chartContainer}>
                 <ResponsiveContainer width="100%" height={200}>
                   <BarChart data={weeklyChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }} barCategoryGap="30%">
                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
                     <XAxis dataKey="weekLabel" axisLine={false} tickLine={false} stroke="#666" dy={10} fontSize={11} interval={0}/>
                     <YAxis axisLine={false} tickLine={false} stroke="#666" fontSize={12} width={40} />
                     <Tooltip content={({ active, payload, label }) => { if (active && payload && payload.length) { const weekStart = payload[0]?.payload?.weekStart || ''; const weekEnd = payload[0]?.payload?.weekEnd || ''; return ( <div className={styles.customTooltip || 'customTooltip'}> <p>{`Tuần: ${label}`}</p> <p>{`(${formatDateForDisplay(weekStart)} - ${formatDateForDisplay(weekEnd)})`}</p> <p>{`Lượt xem: ${payload[0].value}`}</p> </div> ); } return null; }} />
                     <Bar dataKey="views" name="Lượt xem tuần" fill="#f7a5b8" barSize={25} radius={[4, 4, 0, 0]} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
            {/* Chart 2: Past 7 Days */}
            <div className={styles.chartCard}>
               <h3 className={styles.chartTitle}>Lượt xem 7 ngày qua</h3>
               <div className={styles.chartContainer}>
                 <ResponsiveContainer width="100%" height={200}>
                   <BarChart data={dailyChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }} barCategoryGap="30%">
                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
                     <XAxis dataKey="day" axisLine={false} tickLine={false} stroke="#666" dy={10} fontSize={12}/>
                     <YAxis axisLine={false} tickLine={false} stroke="#666" fontSize={12} width={40} />
                      <Tooltip content={({ active, payload, label }) => { if (active && payload && payload.length) { const dateString = payload[0]?.payload?.dateFull || ''; return ( <div className={styles.customTooltip || 'customTooltip'}> <p>{`Ngày: ${dateString} (${label})`}</p> <p>{`Lượt xem: ${payload[0].value}`}</p> </div> ); } return null; }} />
                     <Bar dataKey="views" name="Lượt xem ngày" fill="#8884d8" barSize={20} radius={[4, 4, 0, 0]} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
            {/* Lịch sử bài viết Card */}
            <div className={styles.chartCard}>
               <h3 className={styles.chartTitle}>Lịch sử bài viết</h3>
               <div className={styles.historyContainer}>
                   <div className={styles.historyColumn}> {/* Submitted */}
                        <div className={styles.historyIcon}> <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><circle cx="12" cy="7" r="4" /><rect x="8" y="13" width="8" height="4" /><rect x="2" y="17" width="20" height="2" /></svg> </div>
                        <div className={styles.historyLabel}>Được gửi lên</div>
                        <div className={styles.historySubLabel}>ban biên tập</div>
                        <div className={styles.historyDetail}>({writerName})</div>
                        <div className={styles.historyDate}>{formatDateForDisplay(submittedDate)}</div>
                   </div>
                   <div className={styles.historyColumn}> {/* Approved */}
                       <div className={styles.historyIcon}> <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><rect x="8" y="2" width="12" height="16" /><rect x="10" y="4" width="8" height="1" /><rect x="10" y="7" width="8" height="1" /><rect x="10" y="10" width="8" height="1" /><rect x="10" y="13" width="5" height="1" /><circle cx="16" cy="16" r="5" /><path d="M14,16 L15.5,17.5 L18,15" strokeWidth="1" stroke="white" fill="none" /></svg> </div>
                       <div className={styles.historyLabel}>Được chấp thuận</div>
                       <div className={styles.historySubLabel}>xuất bản</div>
                       <div className={styles.historyDetail}>({editorName})</div>
                       <div className={styles.historyDate}>{formatDateForDisplay(publishedDate)}</div>
                   </div>
               </div>
            </div>
            {/* Bình luận và tương tác Card */}
            <div className={styles.chartCard}>
               <h3 className={styles.chartTitle}>Bình luận và tương tác</h3>
               <div className={styles.commentsPlaceholder}> (Dữ liệu bình luận và tương tác sẽ hiển thị ở đây) </div>
            </div>
          </div>
        </main>
      ) : (
        // --- Article View (Read-Only) ---
        <main className={`${styles.articleDisplayMain} ${styles.articleViewLayout}`}>
            {/* Article Content Section */}
            <div className={styles.articleDisplayWrapper}>
                <div className={styles.articleDisplayContentContainer}>
                     {/* Title */}
                     <h3 className={styles.articleDisplayTitle}
                         dangerouslySetInnerHTML={{ __html: articleTitle }}
                     />
                     {/* Author */}
                     <div className={styles.articleDisplayAuthor}>
                         Tác giả: {writerName}
                     </div>
                     {/* Description/Summary */}
                     <p className={styles.articleDisplayDescription}
                        dangerouslySetInnerHTML={{ __html: articleSummary }}
                     />
                     {/* Main Content */}
                     <div className={styles.articleDisplayContent}
                          dangerouslySetInnerHTML={{ __html: articleContent }}
                     />
                </div>
            </div>

            {/* Notes Section (Read-Only) */}
            {/* Render notes only if they exist */}
            {
                <div className={styles.notesDisplayWrapper}>
                    <h4 className={styles.notesDisplayTitle}>
                        <i className="fas fa-comment" style={{ marginRight: '8px' }}></i> Ghi chú
                    </h4>
                    <div
                        className={styles.notesDisplayContent}
                        dangerouslySetInnerHTML={{ __html: notes }} // Display notes HTML
                    />
                    {/* No buttons or helper text in read-only view */}
                </div>
            }
        </main>
      )}
    </div>
  );
}

export default ArticleDetailView;
