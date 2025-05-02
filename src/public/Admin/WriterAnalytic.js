import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/api'; // Your configured API client
import { useParams } from 'react-router-dom';
import styles from '../../css/WriterAnalytic.module.css'; // Import CSS Module

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
        // Handle "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss..." by taking only date part
         try {
             // Attempt to parse, handles potential invalid dates from substring
             const parts = dateInput.substring(0, 10).split('-');
             if (parts.length === 3) {
                // Create UTC date to avoid timezone issues from string parsing
                date = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
                if (isNaN(date.getTime())) return 'Invalid Date'; // Check after creation
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
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
        date = dateInput;
    } else if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
         try {
             const parts = dateInput.substring(0, 10).split('-');
             if (parts.length === 3) {
                date = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
                if (isNaN(date.getTime())) return '';
             } else { return ''; }
         } catch (e) { return ''; }
    } else {
        return '';
    }
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

/**
 * Calculates view data for the last 7 days from a single article's viewsList.
 *
 * @param {Array<Object>} viewsList - The article's viewsList array [{ date: "YYYY-MM-DD", numberOfViews: number }, ...].
 * @returns {Array<Object>} - Array like [{ day: "Mon", dateShort: "DD/MM", dateFull: "YYYY-MM-DD", views: number }, ...]
 */
const calculateLast7DaysViewData = (viewsList = []) => {
  if (!Array.isArray(viewsList)) {
    console.warn("calculateLast7DaysViewData expected an array, received:", viewsList);
    return [];
  }

  const today = new Date(); // Use actual current date for calculation
  const dailyTotals = new Map(); // { "YYYY-MM-DD": totalViews }
  const dateMap = new Map(); // { "YYYY-MM-DD": DateObject }

  // Initialize maps for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0); // Normalize time for comparison
    const dateString = formatDateToYYYYMMDD(date); // YYYY-MM-DD format for keys
    dailyTotals.set(dateString, 0);
    dateMap.set(dateString, date);
  }

  // Aggregate views from the provided viewsList
  viewsList.forEach(viewRecord => {
    // Ensure record has a valid date string and numberOfViews
    if (viewRecord?.date && typeof viewRecord.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(viewRecord.date) && dailyTotals.has(viewRecord.date)) {
        const views = typeof viewRecord.numberOfViews === 'number' && !isNaN(viewRecord.numberOfViews) ? viewRecord.numberOfViews : 0;
        dailyTotals.set(viewRecord.date, dailyTotals.get(viewRecord.date) + views);
    }
  });

  // Convert map to the final chart data array format
  const chartData = Array.from(dailyTotals.entries()).map(([dateString, totalViews]) => {
       const dateObject = dateMap.get(dateString);
       return {
            day: getShortDayName(dateObject), // Mon, Tue...
            dateShort: formatShortDateForAxis(dateObject), // DD/MM
            dateFull: dateString, // YYYY-MM-DD
            views: totalViews
       };
  });

  return chartData; // Chronological order [oldest_day, ..., today]
};


/**
 * Calculates view data aggregated by week for the last 4 full weeks.
 * Assumes weeks run Monday to Sunday.
 *
 * @param {Array<Object>} viewsList - The article's viewsList array [{ date: "YYYY-MM-DD", numberOfViews: number }, ...].
 * @returns {Array<Object>} - Array like [{ weekLabel: "Wk Apr 21", weekStart: ..., weekEnd: ..., views: number }, ...]
 */
const calculateLast4WeeksViewData = (viewsList = []) => {
    if (!Array.isArray(viewsList)) {
        console.warn("calculateLast4WeeksViewData received invalid input");
        return [];
    }

    const weeklyDataOutput = [];
    const today = new Date(); // Use actual current date
    today.setHours(0, 0, 0, 0);

    // Find the start of the *current* week (Monday)
    const currentDayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const diffToMonday = today.getDate() - currentDayOfWeek + (currentDayOfWeek === 0 ? -6 : 1);
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(diffToMonday);

    // Calculate totals for the 4 weeks *before* the current week
    for (let i = 1; i <= 4; i++) {
        const weekStartDate = new Date(startOfCurrentWeek);
        weekStartDate.setDate(startOfCurrentWeek.getDate() - (i * 7));
        weekStartDate.setHours(0, 0, 0, 0);

        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekStartDate.getDate() + 6);
        weekEndDate.setHours(23, 59, 59, 999);

        let weekTotalViews = 0;
        viewsList.forEach(record => {
            if (record?.date && typeof record.date === 'string' && record.hasOwnProperty('numberOfViews')) {
                try {
                    const parts = record.date.split('-');
                    if (parts.length === 3) {
                       // Use UTC date from parts to avoid TZ issues during comparison
                       const recordDate = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
                       // Create start/end dates also in UTC for comparison
                       const weekStartUTC = new Date(Date.UTC(weekStartDate.getUTCFullYear(), weekStartDate.getUTCMonth(), weekStartDate.getUTCDate()));
                       const weekEndUTC = new Date(Date.UTC(weekEndDate.getUTCFullYear(), weekEndDate.getUTCMonth(), weekEndDate.getUTCDate()));
                       weekEndUTC.setUTCHours(23, 59, 59, 999); // Ensure end of day UTC

                       if (!isNaN(recordDate.getTime()) && recordDate >= weekStartUTC && recordDate <= weekEndUTC) {
                            const views = typeof record.numberOfViews === 'number' && !isNaN(record.numberOfViews) ? record.numberOfViews : 0;
                            weekTotalViews += views;
                       }
                    }
                } catch (e) {
                    console.error("Error parsing date in viewsList:", record.date, e);
                }
            }
        });

        const weekLabel = `Wk ${weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

        // Add to start of array -> final array is chronological [oldest_week, ..., newest_week]
        weeklyDataOutput.unshift({
            weekLabel: weekLabel,
            weekStart: formatDateToYYYYMMDD(weekStartDate),
            weekEnd: formatDateToYYYYMMDD(weekEndDate),
            views: weekTotalViews,
        });
    }
    return weeklyDataOutput;
};
// --- End Helper Functions ---


// ===== WriterAnalytic COMPONENT =====
function WriterAnalytic() {
  const { id } = useParams(); // Get article ID from route params
  const [articleDetail, setArticleDetail] = useState(null);
  const [weeklyChartData, setWeeklyChartData] = useState([]); // Holds 4 WEEKS data
  const [dailyChartData, setDailyChartData] = useState([]);   // Holds 7 DAYS data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchArticleData() {
      if (!id) {
        setError("Article ID not provided in URL.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Fetch article detail - ** Ensure this endpoint returns viewsList **
        const response = await api.post(`/admin/article/detail/${id}`); // Adjusted endpoint prefix to admin

        let fetchedArticle = null;
         // Adapt response parsing based on your actual API structure
         if (response?.data?.data) { // Handles nesting like { success: true, data: { article } } or { success: true, data: { "0": {article} } }
             if (typeof response.data.data === 'object' && response.data.data !== null) {
                 // Check if data is nested under a numeric-like key (e.g., "0", "1")
                 const potentialKey = Object.keys(response.data.data)[0];
                 if (!isNaN(potentialKey) && response.data.data[potentialKey]) {
                      fetchedArticle = response.data.data[potentialKey]; // Take the object under the numeric key
                 } else {
                      fetchedArticle = response.data.data; // Assume data is the article object itself
                 }
             } else {
                  fetchedArticle = response.data.data; // Fallback if data is not object/array
             }
         } else if (response?.data) { // Handles if response body is the article object directly
             fetchedArticle = response.data;
         }

        if (!fetchedArticle || typeof fetchedArticle !== 'object') {
            console.error('Invalid article data structure received:', response?.data);
            throw new Error('Fetched article data is not valid.');
        }

        console.log("Fetched Article Detail:", fetchedArticle); // Log to inspect structure
        setArticleDetail(fetchedArticle);

        // --- Calculate BOTH chart datasets ---
        const viewsList = fetchedArticle.viewsList || []; // Use empty array if viewsList is missing

        const weeklyData = calculateLast4WeeksViewData(viewsList);
        setWeeklyChartData(weeklyData);

        const dailyData = calculateLast7DaysViewData(viewsList);
        setDailyChartData(dailyData);
        // --- End Chart Calculation ---

      } catch (error) {
        console.error('Error fetching article details:', error);
        setError(error.response?.data?.message || error.message || 'Failed to fetch article data.');
        setArticleDetail(null); setWeeklyChartData([]); setDailyChartData([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticleData();
  }, [id]); // Re-run effect if the article ID from URL changes

  // --- Loading and Error States ---
  if (isLoading) {
    return <div className={styles.analyticContainer}><p className={styles.loadingMessage}>Loading article analytics...</p></div>;
  }
  if (error) {
    return <div className={styles.analyticContainer}><p className={styles.errorMessage}>Error: {error}</p></div>;
  }
   if (!articleDetail) {
    return <div className={styles.analyticContainer}><p>Article data not available.</p></div>;
  }

  // Safely access nested properties for display
  // *** Adjust these field names based on your ACTUAL API response ***
  const writerName = articleDetail.authorName || articleDetail.writer?.name || 'N/A';
  const editorName = articleDetail.editorName || articleDetail.editor?.name || 'N/A';
  const submittedDate = articleDetail.sendToEditorAt || articleDetail.createDate || null; // Use appropriate date field
  const publishedDate = articleDetail.publishedAt || articleDetail.approvedDate || null; // Use appropriate date field


  return (
    <div className={styles.analyticContainer}>
      {/* Main Content Area - Sidebar Removed */}
      <h2 className={styles.mainTitle}>Thống kê về bài viết: {articleDetail.title || 'N/A'}</h2>
    
      <main className={styles.dashboard}>
         {/* Main Title */}

         <div className={styles.dashboardGrid}>

            {/* Chart 1: Past 4 Weeks */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Lượt xem 4 tuần qua</h3>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={weeklyChartData}
                    margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="weekLabel" // e.g., "Wk Apr 21"
                      axisLine={false} tickLine={false} stroke="#666" dy={10} fontSize={11} interval={0}
                    />
                    <YAxis axisLine={false} tickLine={false} stroke="#666" fontSize={12} width={40} />
                    <Tooltip content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            const weekStart = payload[0]?.payload?.weekStart || '';
                            const weekEnd = payload[0]?.payload?.weekEnd || '';
                            return ( <div className={styles.customTooltip || 'customTooltip'}> <p>{`Tuần: ${label}`}</p> <p>{`(${formatDateForDisplay(weekStart)} - ${formatDateForDisplay(weekEnd)})`}</p> <p>{`Lượt xem: ${payload[0].value}`}</p> </div> );
                        } return null;
                       }} />
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
                  <BarChart
                    data={dailyChartData}
                    margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="day" // Mon, Tue... (or use dateShort for DD/MM)
                      axisLine={false} tickLine={false} stroke="#666" dy={10} fontSize={12}
                     />
                    <YAxis axisLine={false} tickLine={false} stroke="#666" fontSize={12} width={40} />
                     <Tooltip content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            const dateString = payload[0]?.payload?.dateFull || '';
                            return ( <div className={styles.customTooltip || 'customTooltip'}> <p>{`Ngày: ${dateString} (${label})`}</p> <p>{`Lượt xem: ${payload[0].value}`}</p> </div> );
                        } return null;
                       }} />
                    <Bar dataKey="views" name="Lượt xem ngày" fill="#8884d8" barSize={20} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Lịch sử bài viết Card */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Lịch sử bài viết</h3>
              <div className={styles.historyContainer}>
                  {/* Submitted Column */}
                  <div className={styles.historyColumn}>
                       <div className={styles.historyIcon}>
                           <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><circle cx="12" cy="7" r="4" /><rect x="8" y="13" width="8" height="4" /><rect x="2" y="17" width="20" height="2" /></svg>
                       </div>
                       <div className={styles.historyLabel}>Được gửi lên</div>
                       <div className={styles.historySubLabel}>ban biên tập</div>
                       <div className={styles.historyDetail}>({writerName})</div>
                       {/* Use formatDateForDisplay for consistency */}
                       <div className={styles.historyDate}>{formatDateForDisplay(submittedDate)}</div>
                  </div>
                  {/* Approved Column */}
                  <div className={styles.historyColumn}>
                      <div className={styles.historyIcon}>
                          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><rect x="8" y="2" width="12" height="16" /><rect x="10" y="4" width="8" height="1" /><rect x="10" y="7" width="8" height="1" /><rect x="10" y="10" width="8" height="1" /><rect x="10" y="13" width="5" height="1" /><circle cx="16" cy="16" r="5" /><path d="M14,16 L15.5,17.5 L18,15" strokeWidth="1" stroke="white" fill="none" /></svg>
                      </div>
                      <div className={styles.historyLabel}>Được chấp thuận</div>
                      <div className={styles.historySubLabel}>xuất bản</div>
                      <div className={styles.historyDetail}>({editorName})</div>
                       {/* Use formatDateForDisplay for consistency */}
                      <div className={styles.historyDate}>{formatDateForDisplay(publishedDate)}</div>
                  </div>
              </div>
            </div>

            {/* Bình luận và tương tác Card (Placeholder) */}
            <div className={styles.chartCard}>
               <h3 className={styles.chartTitle}>Bình luận và tương tác</h3>
               <div className={styles.commentsPlaceholder}>
                  (Dữ liệu bình luận và tương tác sẽ hiển thị ở đây)
               </div>
            </div>

          </div>
         </main>
       </div>
  );
}

export default WriterAnalytic;