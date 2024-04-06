import './App.css'
import {Route, Routes} from 'react-router-dom';
import LoginForm from "./components/LoginForm";
import Home from "./components/Home";
import RegisterForm from "./components/RegisterForm";
import {AuthProvider} from "./components/AuthContext";
import Logout from "./components/Logout";
import Rooms from "./components/Rooms";
import Profile from "./components/Profile";
import Users from "./components/Users";
import Reservations from "./components/Reservations";
import AllUserReservations from "./components/AllUserReservations";
import AllReservations from "./components/AllReservations";

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<LoginForm/>}/>
                <Route path="/login" element={<LoginForm/>}/>
                <Route path="/home" element={<Home/>}/>
                <Route path="/register" element={<RegisterForm/>}/>
                <Route path="/logout" element={<Logout/>}/>
                <Route path="/rooms" element={<Rooms/>}/>
                <Route path="/profile" element={<Profile/>}/>
                <Route path="/users" element={<Users/>}/>
                <Route path="/reservations" element={<Reservations/>}/>
                <Route path="/my-reservations" element={<AllUserReservations/>}/>
                <Route path="/all-reservations" element={<AllReservations/>}/>
            </Routes>
        </AuthProvider>

    )
}

export default App;