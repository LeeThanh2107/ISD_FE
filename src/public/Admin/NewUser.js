import { useState } from "react";
import api from "../../api/api";
import UserCreateModal from "../../components/UserCreationModal";
import '../../css/NewUser.css'
function NewUser(){
    const [role,setRole] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [tempPassword, setTempPassword] = useState('');
    const [error, setError] = useState('');
    const [email,setEmail] = useState('');
    const [username,setUsername] = useState('');
    const [fullname,setFullname]= useState('');
    const handleDropdownChange = function(event){
        setRole(event.target.value);
    }
    const closeModal = () => {
        setModalIsOpen(false);
        setMessage('');
        setTempPassword('');
        setError('');
      };

    const createNewUser = async function(){
        try {
            const response = await api.post('/admin/user/store', {
                username:username,
                name: fullname,
                role: role,
                email: email, // Gửi username, bạn có thể thêm các trường khác
            });
      
            const data = response.data.data;
            if (response.status === 200) {
              setMessage(data.message);
              setTempPassword(data.generatedPassword || ''); // Lấy mật khẩu từ response
              setError('');
            } else if (response.status === 500) {
              setMessage('');
              setTempPassword('');
              setError(response.message); // Hoặc lấy thông điệp lỗi từ data.message
            }
            setModalIsOpen(true);
          } catch (err) {
            setMessage('');
            setTempPassword('');            
            setError('Check the information and try again or contact administrator!');
            setModalIsOpen(true);
          }
    }

    return (
        <div className="new-user-container">
          <h2>Create New User</h2>
          <div className="new-user-form-group">
            <label>Email:</label>
            <input
              id="email"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="Enter email here"
              required
            />
          </div>
          <div className="new-user-form-group">
            <label>Full name:</label>
            <input
              id="fullname"
              type="text"
              onChange={(e) => setFullname(e.target.value)}
              value={fullname}
              placeholder="Enter user's full name"
              required
            />
          </div>
          <div className="new-user-form-group">
            <label>Username:</label>
            <input
              id="username"
              type="text"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              placeholder="Enter username"
              required
            />
          </div>
          <div className="new-user-form-group">
            <label>Role:</label>
            <select value={role} onChange={handleDropdownChange}>
              <option value="" disabled>Select a role</option>
              <option value="2">Admin</option>
              <option value="0">Writer</option>
              <option value="1">Editor</option>
            </select>
          </div>
          <div className="new-user-form-group">
            <button className="new-user-submit-button" onClick={createNewUser}>
              Create
            </button>
          </div>
      
          <UserCreateModal
            isOpen={modalIsOpen}
            onClose={closeModal}
            message={message}
            tempPassword={tempPassword}
            error={error}
          />
        </div>
      );      
}
export default NewUser;