
import { Outlet, useNavigate } from "react-router-dom";
import "./App.css";
import AppHeader from "./Components/AppHeader";
import SideMenu from "./Components/SideMenu";
import { BidContextProvider } from "./Context/bidContext";
import { useAuthContext } from "./hooks/useAuthContext";


function App() {

    const { user } = useAuthContext();
    const navigate = useNavigate();

 
    return (
        <BidContextProvider>
            <div className="App">
                <div id="layout-wrapper">
                    <div className="vertical-menu">
                        <SideMenu></SideMenu>
                    </div>
                    <div className="main-content">
                        <AppHeader />
                        <div className="page-content">
                            <div className="container-fluid pb-2">
                                <div className="PageContent">
                                    <Outlet />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BidContextProvider>

    );
}
export default App;
