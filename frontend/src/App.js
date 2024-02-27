import './App.css'
import {Route, Routes} from 'react-router-dom';
import LoginForm from "./components/LoginForm";
import Home from "./components/Home";
import RegisterForm from "./components/RegisterForm";
import {AuthProvider} from "./components/AuthContext";
import Logout from "./components/Logout";

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<LoginForm/>}/>
                <Route path="/login" element={<LoginForm/>}/>
                <Route path="/home" element={<Home/>}/>
                <Route path="/register" element={<RegisterForm/>}/>
                <Route path="/logout" element={<Logout/>}/>
            </Routes>
        </AuthProvider>

    )
}

export default App;