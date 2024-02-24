import './App.css'
import {Route, Routes} from 'react-router-dom';
import LoginForm from "./components/LoginForm";
import Home from "./components/Home";
import RegisterForm from "./components/RegisterForm";

function App(){
    return (
    <>
        <Routes>
            <Route path="/" element={<LoginForm/>}/>
            <Route path="/login" element={<LoginForm/>}/>
            <Route path="/home" element={<Home/>}/>
            <Route path="/register" element={<RegisterForm/>}/>
        </Routes>
    </>
    )
}

export default App;