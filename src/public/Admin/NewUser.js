import { useState } from "react";
import api from "../../api/api";
import UserCreateModal from "../../components/UserCreationModal";
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
            setError('Network error or server issue!');
            setModalIsOpen(true);
          }
    }

    return(
        <div>
            <div>
            <div>
                <label>
                    Email:
                </label>
                <input id="username" type="email" onChange={(e)=> setEmail(e.target.value)} value={email} placeholder="Enter email here" required></input>
            </div>
                <label>
                    Full name:
                </label>
                <input id="fullname" type="text" onChange={(e)=> setFullname(e.target.value)} value={fullname} placeholder="Enter user's fullname here" required></input>
            </div>
            <div>
                <label>
                    Username:
                </label>
                <input id="username" type="text" onChange={(e)=> setUsername(e.target.value)} value={username} placeholder="Enter username here" required></input>
            </div>
            <div>
                <label>Role: </label>
                <select
                value={role}
                onChange={handleDropdownChange}
                className="dropdown"
              >
                <option value="" disabled>Select an role</option>
                <option value="2">Admin</option>
                <option value="0">Writer</option>
                <option value="1">Editor</option>
              </select>
            </div>
            <div>
                <button id="submit" onClick={createNewUser}>Create</button>
            </div>
            <UserCreateModal
            isOpen={modalIsOpen}
            onClose={closeModal}
            message={message}
            tempPassword={tempPassword}
            error={error}
            />
        </div>
    )
}
export default NewUser;