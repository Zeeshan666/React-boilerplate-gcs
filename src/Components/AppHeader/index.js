
import React, { useEffect } from "react";
import { useAuthContext } from '../../hooks/useAuthContext';
import { LOGOUT_ACTION } from '../../Context/Actions'
import RoutesConstant from "../../Routes/Constant";
import { Link, useNavigate } from "react-router-dom";
import bidShushi from "../../Services/Api/Api";
import { LOGIN_ACTION, USER_ROLE } from '../../Context/Actions'
import { avatarURL, headerName } from "../../Common";

function AppHeader() {
    const { user,dispatch,role } = useAuthContext();
    const navigate = useNavigate();

    const currentUrl = window.location?.pathname;

    const logout=()=>{
        let data = {
            refreshToken: JSON.parse(localStorage.getItem('bidshushi_tokens'))?.refresh?.token
        };
        bidShushi.logout(data).then((res)=>{
         console.log(res);
        }).catch(err=>{
            console.log(err)
        })
       localStorage.removeItem('user');
       localStorage.removeItem("bidshushi_tokens");
     //  window.location.reload();
       dispatch({ type: LOGOUT_ACTION, payload: null });
       navigate(RoutesConstant.login)
    };

   
    useEffect(()=>{
        const user = JSON.parse(localStorage.getItem('user'));
        if(user&&user.id){
            bidShushi.getUserById(user&&user.id)
            .then((res) => {
               localStorage.setItem('user', JSON.stringify(res));
               dispatch({ type: LOGIN_ACTION, payload: res });
            }).catch(err => console.log(err))
        }

    },[])
    let header = headerName(currentUrl)

    return (
        <header id="page-topbar">
            <div className="navbar-header">
                <div className="d-flex">
                    <h1 className="page-title">{header}</h1>
                </div>
                <div className="d-flex">
                    <div className="dropdown d-inline-block">
                        <button type="button" className="btn header-item waves-effect dropdown-toggle"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            <span
                                className="d-inline-block ms-1 user-name text-ellipse" style={{maxWidth: '380px', paddingBottom:'2px'}}>{user?.fullName ||'N/A'}<small>{role}</small></span>
                                {
                                    (user?.avatar != null && user?.avatar != 'null') ? <img className="header-profile-user ms-2" src={avatarURL+user?.avatar}
                                    alt="Header Avatar" />:<img className="header-profile-user ms-2" src="/images/user-circle.png"
                                    alt="Header Avatar" />
                                }
                            
                        </button>
                        <div className="dropdown-menu dropdown-menu-right">
                            <Link className="dropdown-item profile-sidebar-menu" to={RoutesConstant.userProfile}><i className="fa fa-user mr-2"></i> Profile</Link>
                            <Link  to={'/logout'} className="dropdown-item"><i className="fa  fa-sign-out mr-2"></i>Log Out</Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
export default AppHeader;
