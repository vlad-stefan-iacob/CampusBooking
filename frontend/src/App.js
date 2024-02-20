import './App.css'
import {Route, Routes} from 'react-router-dom';
import LoginForm from "./components/LoginForm";
import Home from "./components/Home";

function App(){
    return (
    <>
        <Routes>
            <Route path="/" element={<LoginForm/>}/>
            <Route path="/login" element={<LoginForm/>}/>
            <Route path="/home" element={<Home/>}/>
        </Routes>
    </>
    )
}

export default App;