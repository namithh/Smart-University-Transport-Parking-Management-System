import './App.css';
import { Outlet } from 'react-router-dom';
import Header from './component/Header';
import Footer from './component/Footer';
import { ToastContainer } from 'react-toastify';
import { useCallback, useEffect } from 'react';
import SummaryApi from './common';
import Context from './context';
import { setUserdetails } from './store/userSlice';
import { useDispatch } from 'react-redux';
import Chatbot from './component/Chatbot';

function App() {

  const dispatch = useDispatch()

  const fetchUserDetails = useCallback(async()=> {
    const dataResponse = await fetch(SummaryApi.current_user.url,{
      method : SummaryApi.current_user.method,
      credentials : 'include'
    })
    const dataApi = await dataResponse.json()

    if(dataApi.success){
      dispatch(setUserdetails(dataApi.data))

    }

  },[dispatch])

  useEffect(()=>{
    //--user Details--//
    fetchUserDetails()
  
  },[fetchUserDetails])
  return (
    <>
    <Context.Provider value={{
      fetchUserDetails          //--user Details fetch--//

    }}>
    <ToastContainer />
    <Header/>
    <main className='min-h-[calc(100vh-160px)] pt-24 '>
      <Outlet/>
    </main>
    <Chatbot />
    <Footer/>
    </Context.Provider>
    </>
  );
}

export default App;
