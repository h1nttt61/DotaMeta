import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Heroes from "./pages/Heroes";
import Meta from "./pages/Meta";
import Matches from "./pages/Matches";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Draft from "./pages/Draft.jsx";
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/heroes" element={<Heroes />} />
                    <Route path="/meta" element={<Meta />} />
                    <Route path="/matches" element={<Matches />} />
                    <Route path="/draft" element={<Draft />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;