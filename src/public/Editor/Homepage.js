import '../../css/Homepage.css';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function WeeklyViewsChart() {
  const [data] = useState([
    { date: '27/3', views: 120 },
    { date: '28/3', views: 150 },
    { date: '29/3', views: 80 },
    { date: '30/3', views: 140 },
    { date: '31/3', views: 160 },
    { date: '1/4', views: 110 },
    { date: '2/4', views: 130 },
  ]);

  return (
    <div className="weekly-views-container">
      <h3>Lượt xem trong tuần</h3>
      
      <div className="chart-container">
        <ResponsiveContainer width="102%" height={200}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            barCategoryGap={40}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis hide={true} />
            <Tooltip 
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}
              formatter={(value) => [`${value} lượt xem`, '']}
              labelFormatter={(label) => `Ngày ${label}`}
            />
            <Bar 
              dataKey="views" 
              fill="#f7a5b8" 
              radius={[4, 4, 0, 0]} 
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="stats-summary">
        <div className="stats-item">
          <span className="stats-label">Tổng lượt xem:</span>
          <span className="stats-value">{data.reduce((sum, item) => sum + item.views, 0)}</span>
        </div>
        <div className="stats-item">
          <span className="stats-label">Cao nhất:</span>
          <span className="stats-value">{Math.max(...data.map(item => item.views))}</span>
        </div>
      </div>
    </div>
  );
}

function Homepage(){
    return (
        <div className="app">
            {/* <Header></Header> */}
            
          <div className="main-content">
            <aside className="sidebar">
              <div className="sidebar-item">
                <h3>Báo điện tử</h3>
              </div>
              <div className="sidebar-item">
                <h3>Báo in</h3>
              </div>
            </aside>
            <main className="dashboard">
              <h2>Dashboard <span style={{ color: '#666' }}>Báo cáo & thống kê</span></h2>
              <div className="card-grid">
                <div className="card">
                  <WeeklyViewsChart />
                </div>
                <div className="card">Công việc cần làm</div>
                <div className="card">Báo cáo doanh thu</div>
                <div className="card">Thống kê bài viết</div>
              </div>
            </main>
          </div>
        </div>
      );
}

export default Homepage;