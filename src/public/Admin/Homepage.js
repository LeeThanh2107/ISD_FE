import '../../css/Homepage.css';
import Header from '../../components/Header';
function Homepage(){
    return (
        <div className="app">
            {/* <Header></Header> */}
            
          <div className="main-content">
            <aside className="sidebar">
              <div className="sidebar-item">
                <h3>Báo điện tử</h3>
                <div className="sidebar-item">
                <h3>Báo in</h3>
              </div>
              </div>
            
            </aside>
            <main className="dashboard">
              <h2>Dashboard <span style={{ color: '#666' }}>Báo cáo & thống kê</span></h2>
              <div className="card-grid">
                <div className="card">Công việc cần làm</div>
                <div className="card"></div>
                <div className="card"></div>
                <div className="card"></div>
                <div className="card"></div>
                <div className="card"></div>
              </div>
            </main>
          </div>
        </div>
      );
}
export default Homepage