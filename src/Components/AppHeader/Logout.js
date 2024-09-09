// import React, { useEffect } from 'react'
// import { useAuthContext } from '../../hooks/useAuthContext';
// import { LOGOUT_ACTION } from '../../Context/Actions'
// import RoutesConstant from "../../Routes/Constant";
// import { Link, useNavigate } from "react-router-dom";

// import bidShushi from "../../Services/Api/Api";
// const Logout = () => {
//     const { user,dispatch,role } = useAuthContext();
//     const navigate = useNavigate();

//     useEffect(()=>{
//         let data = {
//             refreshToken: JSON.parse(localStorage.getItem('bidshushi_tokens'))?.refresh?.token
//         };
//         bidShushi.logout(data).then((res)=>{
//          console.log(res);
//         }).catch(err=>{
//             console.log(err)
//         })
//        localStorage.removeItem('user');
//        localStorage.removeItem("bidshushi_tokens");
//      //  window.location.reload();
//        dispatch({ type: LOGOUT_ACTION, payload: null });
//        navigate(RoutesConstant.login)
//     },[])
//   return (
//     <div></div>
//   )
// }

// export default Logout
