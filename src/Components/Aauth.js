import React, { useEffect,useState } from "react";
import { Navigate, Outlet, useNavigate,useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import RoutesConstant from "../Routes/Constant";
import bidShushi from "../Services/Api/Api";
import { Skeleton } from "antd";

const Aauth = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [load,setLoad] = useState(true);
  let location = useLocation();
  let to; 
  if(location.pathname!='/'&&!location.search){
    to = `${RoutesConstant.login}?location=${location.pathname.slice(1)}`
  }else if(location.pathname!='/'&&location.search){
    to = `${RoutesConstant.login}?location=${location.pathname.slice(1)}${location.search}`
  }
  else{
    to = `${RoutesConstant.login}`
  }

  //will use in project
  // useEffect(()=>{
  //   setLoad(true);
  //  bidShushi.bidStatsDashboard().then((res)=>{
  //   console.log(res)
  //   setLoad(false);
  //  }).catch(err=>{
  //   console.log(err)
  //  })
  // },[])
 
  return !load?user ? <Outlet /> : <Navigate to={to}/>:<div className="container">
      <div className="lds-ripple loader">
          <div></div>
        </div>
     </div>
};

export default Aauth;
