import './App.css'
import {Route, Routes} from 'react-router-dom';
import LoginForm from "./components/LoginForm";

function App(){
    return (
        <>
            <Routes>
                <Route path="/" element={<LoginForm/>}/>
                <Route path="/login" element={<LoginForm/>}/>
            </Routes>
        </>
    )
}

export default App;