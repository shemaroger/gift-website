import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './Pages/Home';
import Footer from './Pages/Components/Footer';
import Navbar from "./Pages/Components/navbar";
import Contactus from './Pages/Contactus';
import EventDetails from './Pages/EventDetail';
import MoreBlogs from './Pages/MoreBlogs';
import Gallery from './Pages/Gallery';
import About from './Pages/About';
import Donate from './Pages/Donate';
import Videos from './Pages/Videos';
import Events from './Pages/Events';
import BlogDetail from './Pages/BlogDetail';
import Login from './Pages/Autho/Login';
import Dashboard from './Pages/Components/Dashboard';
import AddUser from './Pages/User/AddUser';
import GetUser from './Pages/User/GetUser';
import AddRole from './Pages/Role/AddRole';
import GetRole from './Pages/Role/GetRole';
import AddAds from './Pages/Ads/AddAds';
import GetAds from './Pages/Ads/GetAds';
import AddBlog from './Pages/Blogs/AddBlog';
import GetBlog from './Pages/Blogs/GetBlog';
import AddCategory from './Pages/Blogs/AddCategory';
import AddEvent from './Pages/Events/AddEvent';
import AddEventRegistration from './Pages/Events/AddEventRegistration';
import AddAnnouncement from './Pages/Announcements/AddAnnouncement';
import GetGallery from './Pages/Gallery/GetGallery';
import AddGallery from './Pages/Gallery/AddGallery';
import GalleryCategory from './Pages/Gallery/GalleryCategory';
import GetEvent from './Pages/Events/GetEvent';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import ComingSoon from './Pages/Components/ComingSoon';
import UserDetails from './Pages/User/UserDetail';
import ErrorPage from './Pages/Components/ErrorPage';
import ViewDonation from './Pages/Donate/ViewDonation';
import ViewContact from './Pages/Contacts/ViewContact';
import NotFound from './Pages/Components/NotFound';
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* <Route path="/" element={<><ComingSoon /></>} /> */}
        <Route path="/" element={<><Navbar /> <HomePage /> <Footer /> </>} />
        <Route path="/contactus" element={<><Navbar /> <Contactus /> <Footer /> </>} />
        <Route path="/EventDetails/:id" element={<><Navbar /> <EventDetails /> <Footer /> </>} />
        <Route path="/MoreBlogs" element={<><Navbar /> <MoreBlogs /> <Footer /> </>} />
        <Route path="/Gallery" element={<><Navbar /> <Gallery /> <Footer /> </>} />
        <Route path="/Aboutus" element={<><Navbar /> <About /> <Footer /> </>} />
        <Route path="/Donate" element={<><Navbar /> <Donate /> <Footer /> </>} />
        <Route path="/Videos" element={<><Navbar /> <Videos /> <Footer /> </>} />
        <Route path="/Events" element={<><Navbar /> <Events /> <Footer /> </>} />
        <Route path="/BlogDetail/:id" element={<><Navbar /> <BlogDetail /> <Footer /> </>} />
        <Route path="/autho/login" element={<> <Login /></>} />
        <Route path="/dashboard" element={<> <Dashboard /> </>} />
        <Route path="/add-event" element={<> <AddEvent /> </>} />

        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="adduser/:id" element={<AddUser />} />
          <Route path="adduser" element={<AddUser />} />
          <Route path="getUser" element={<GetUser />} />
          <Route path="addEventRegistration" element={<AddEventRegistration />} />
          <Route path="addRole" element={<AddRole />} />
          <Route path="getRole" element={<GetRole />} />
          <Route path="addAds" element={<AddAds />} />
          <Route path="getAds" element={<GetAds />} />
          <Route path="addBlog" element={<AddBlog />} />
          <Route path="getBlog" element={<GetBlog />} />
          <Route path="addCategory" element={<AddCategory />} />
          <Route path="addEvent" element={<AddEvent />} />
          <Route path="addAnnouncement" element={<AddAnnouncement />} />
          <Route path="getGallery" element={<GetGallery />} />
          <Route path="addGallery" element={<AddGallery />} />
          <Route path="galleryCategory" element={<GalleryCategory />} />
          <Route path="getEvent" element={<GetEvent />} />
          <Route path="adminDashboard" element={<AdminDashboard />} />
          <Route path="userDetails/:id" element={<UserDetails />} />
          <Route path="viewDonation" element={<ViewDonation />} />
          <Route path="viewContact" element={<ViewContact />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;