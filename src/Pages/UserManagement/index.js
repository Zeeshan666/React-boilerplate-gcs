import { Tooltip, Typography } from "antd";
import { React, useState, useEffect, Suspense } from "react";
import { Switch, Button, Skeleton, Modal, notification } from "antd";
import bidShushi from "../../Services/Api/Api";
import { Link, useNavigate } from "react-router-dom";
import Form from "./Form";
import RoutesConstant from "../../Routes/Constant";
import { EXTERNAL_ROLE, USER_PASSWORD_REGEX, avatarURL } from "../../Common";
import InfiniteScroll from "react-infinite-scroll-component";
import { LOGOUT_ACTION } from '../../Context/Actions'
import { useAuthContext } from "../../hooks/useAuthContext";
import BIDSUSHI_TEXT from "../../Common/Constant";

const UserList = () => {
  const navigate = useNavigate();

  const [activeUsers, setActiveUsers] = useState([]);
  const [isLoading, setIsloading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [api, contextHolder] = notification.useNotification();
  const [userToEdit, setUserToEdit] = useState("");
  const [totalUserLength, setTotalUserLength] = useState("");
  const [pageNumber, setPageNumber] = useState(0);
  const { user, role,dispatch } = useAuthContext();
  const [dataLoading, setDataLoading] = useState(false);
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isModalOpenStatus, setIsModalOpenStatus] = useState(false);
  const [setUser,setSelectedUser] = useState(null);
  const [setIndex,setSelectedIndex] = useState(null);
  
  const [isUserExist,setIsUserExist] = useState(false);
  const [isDeleteModal,setDeleteModal] = useState(false);

  const [passwordError, setPasswordError] = useState({
    newPassword: false,
    confirmNewPassword: false,
  });



  const showModal = (u) => {
    //   setIsModalOpen(true);
    setSelectedUser(u);
       bidShushi.isUserExistInBids(u?.id)
       .then(res=>{
         console.log(res)
           if(!res){
            setDeleteModal(true);
           }else{
             setIsUserExist(true);
           }  
       }).catch(err=>{
         console.log(err)
       })
     };
   
     const handleOk = () => {
         bidShushi.deleteUser(setUser?.id)
         .then(() => {
           //  let updatedUsers = externalUsers.filter(s => s.id !== externalUserToRemove.id)
           //  setExternalUsers(updatedUsers);
           setIsloading(true);
           fetchMoreData(true, sortColumn, sortDirection)
             api.success({
                 message: `Success`,
                 description: "User Deleted Successfully",
                 placement: 'topRight'
             })
             setDeleteModal(false);  
             setIsUserExist(false);
         }).catch(err=>{
            console.log(err);
            setDeleteModal(false);  
            setIsUserExist(false);
         })
     };

     const handleCancel = () => {
      setDeleteModal(false);
      setIsUserExist(false);
    };
  
  const showPasswordModal = (u) => {
    if (u.activated) {
      setPasswordError({
        currentPassword: false,
        newPassword: false,
        confirmNewPassword: false,
      });
      setUserToEdit(u);
      if (user.id === u.id) {
        setIsModalOpen1(true);
      }
      else {
        setIsModalOpen(true);
      }
    } else {
      setIsloading(true);
      if (!u.isActive) {
        setIsloading(false);
        api.error({
          message: `Error`,
          description: `${BIDSUSHI_TEXT.markUserACtive}`,
          placement: "topRight",
        });
        return;
      }
      bidShushi
        .resendEmailVerification(u.id)
        .then((res) => {
          setIsloading(false);
          api.success({
            message: `Success`,
            description: "Email has been sent successfully.",
            placement: "topRight",
          });
        })
        .catch((err) => {
          console.log(err);
          setIsloading(false);
          api.error({
            message: `Error`,
            description: "Error in sending the email. Try again later.",
            placement: "topRight",
          });
        });
    }
  };

  const handlePasswordModalOk = () => {
    //saveBid(true);
    sendPasswordCall();
  };

  const handlePasswordModalOk1 = () => {
    //saveBid(true);
    sendPasswordCall1();
  };

  const handlePasswordModalCancel = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsModalOpen(false);
    setIsModalOpen1(false);
  };

  const handlePasswordModalCancel1 = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsModalOpen(false);
    setIsModalOpen1(false);
  };

  const handleKeyDown = (event) =>  {
    checkValidConfirmPassword();
    if (event.key === 'Enter') {
      sendPasswordCall();
    }
  }

  const handleKeyDown1 = (event) =>  {
    checkValidConfirmPassword();
    if (event.key === 'Enter') {
      sendPasswordCall1();
    }
  }



  useEffect(()=>{
    checkValidConfirmPassword();
  },[newPassword])


  const checkValidCurrentPassword = () => {
    if (currentPassword && currentPassword.length > 0) {
      if (currentPassword.length < 8 || !currentPassword.match(USER_PASSWORD_REGEX)) {
        setPasswordError((preState) => {
          return { ...preState, currentPassword: true };
        });
      } else {
        setPasswordError((preState) => {
          return { ...preState, currentPassword: false };
        });
      }
    }
  };

  const checkValidPassword = () => {
    if (newPassword && newPassword.length > 0) {
      if (newPassword.length < 8 || !newPassword.match(USER_PASSWORD_REGEX)) {
        setPasswordError((preState) => {
          return { ...preState, newPassword: true };
        });
      } else {
        setPasswordError((preState) => {
          return { ...preState, newPassword: false };
        });
      }
    }
  };

  const checkValidConfirmPassword = () => {
    if (confirmNewPassword && confirmNewPassword.length > 0) {
      if (confirmNewPassword !== newPassword) {
        setPasswordError((preState) => {
          return { ...preState, confirmNewPassword: true };
        });
      } else {
        setPasswordError((preState) => {
          return { ...preState, confirmNewPassword: false };
        });
      }
    }
  };

  const checkForPasswordError1 = () => {
    if (!currentPassword) {
      setPasswordError((preState) => {
        return {
          ...preState,
          currentPassword: true,
        };
      });
    }
    if (!newPassword) {
      setPasswordError((preState) => {
        return {
          ...preState,
          newPassword: true,
        };
      });
    }
    if (!confirmNewPassword) {
      setPasswordError((preState) => {
        return {
          ...preState,
          confirmNewPassword: true,
        };
      });
    }

    if (confirmNewPassword !== newPassword)
    setPasswordError((preState) => {
      return {
        ...preState,
        confirmNewPassword: true,
      };
    })
  };

  const checkForPasswordError = () => {
    if (!newPassword) {
      setPasswordError((preState) => {
        return {
          ...preState,
          newPassword: true,
        };
      });
    }
    if (!confirmNewPassword) {
      setPasswordError((preState) => {
        return {
          ...preState,
          confirmNewPassword: true,
        };
      });
    }

    if (confirmNewPassword !== newPassword)
    setPasswordError((preState) => {
      return {
        ...preState,
        confirmNewPassword: true,
      };
    })
  };

  const checkValidCurrentPasswordAgain = () => {
    if (currentPassword && currentPassword.length > 0) {
      if (
        currentPassword.length < 8 ||
        !currentPassword.match(USER_PASSWORD_REGEX)
      ) {
        return false;
      }
      return true;
    }
  };

  const checkValidPasswordAgain = () => {
    if (newPassword && newPassword.length > 0) {
      if (
        newPassword.length < 8 ||
        !newPassword.match(USER_PASSWORD_REGEX)
      ) {
        return false;
      }
      return true;
    }
  };

  const checkValidConfirmPasswordAgain = () => {
    if (confirmNewPassword && confirmNewPassword.length > 0) {
      if (confirmNewPassword !== newPassword) {
        return false;
      } else {
        return true;
      }
    }
  };

  const sendPasswordCall1 = () => {
    if (
      currentPassword && newPassword && confirmNewPassword &&
      checkValidCurrentPasswordAgain() &&
      checkValidPasswordAgain() &&
      checkValidConfirmPasswordAgain()
      // && (!(questionsStages.some((element) => element.isChecked ? (element.assign_to === null || element.wc_equiv == null || element.wc_equiv === '') : '')))
    ) {
      let re = USER_PASSWORD_REGEX;
      if (!re.test(newPassword)) {
        setPasswordError((preState) => {
          return {
            ...preState,
            newPassword: true,
          };
        });
      }
      if (newPassword == confirmNewPassword) {
        const userObject = {
          firstName: userToEdit.firstName,
          lastName: userToEdit.lastName,
          fullName: userToEdit.fullName,
          contact: userToEdit.contact,
          userRoleId: userToEdit.userRoleId,
          userSkillId: userToEdit.userSkillId,
          email: userToEdit.email,
          isActive: userToEdit.isActive,
          isAdmin: userToEdit.isAdmin,
          currentPassword: currentPassword,
          password: newPassword,
          createdBy: "SYSTEM",
          updatedBy: "SYSTEM",
        };

        bidShushi
          .updateUserProfile(userToEdit.id, userObject)
          .then((res) => {
            setIsloading(false);
            setIsModalOpen1(false);
            setIsModalOpen(false);
            setNewPassword("");
            setConfirmNewPassword("");
            api.success({
              message: `Success`,
              description: BIDSUSHI_TEXT.passwordUpdated,
              placement: "topRight",
            });
            if(user?.id==userToEdit.id){
              logout();
            }
          })
          .catch((err) => {
            setIsloading(false);
            api.error({
              message: `Error`,
              description: err?.message || "Error in changing the password.",
              placement: "topRight",
            });
            console.log(err);
          });
      } else {
        setPasswordError((preState) => {
          return {
            ...preState,
            confirmNewPassword: true,
          };
        });
      }
    } else {
      checkForPasswordError1();
    }
  };

  const sendPasswordCall = () => {
    if (
      newPassword && confirmNewPassword &&
      checkValidPasswordAgain() &&
      checkValidConfirmPasswordAgain()
      // && (!(questionsStages.some((element) => element.isChecked ? (element.assign_to === null || element.wc_equiv == null || element.wc_equiv === '') : '')))
    ) {
      let re = USER_PASSWORD_REGEX;
      if (!re.test(newPassword)) {
        setPasswordError((preState) => {
          return {
            ...preState,
            newPassword: true,
          };
        });
      }
      if (newPassword == confirmNewPassword) {
        const userObject = {
          firstName: userToEdit.firstName,
          lastName: userToEdit.lastName,
          fullName: userToEdit.fullName,
          contact: userToEdit.contact,
          userRoleId: userToEdit.userRoleId,
          userSkillId: userToEdit.userSkillId,
          email: userToEdit.email,
          isActive: userToEdit.isActive,
          isAdmin: userToEdit.isAdmin,
          password: newPassword,
          createdBy: "SYSTEM",
          updatedBy: "SYSTEM",
        };
        setIsloading(true);
        bidShushi
          .updateUser(userToEdit.id, userObject)
          .then((res) => {
            setIsloading(false);
            setIsModalOpen1(false);
            setIsModalOpen(false);
            setNewPassword("");
            setConfirmNewPassword("");
            api.success({
              message: `Success`,
              description: BIDSUSHI_TEXT.passwordUpdated,
              placement: "topRight",
            });
          })
          .catch((err) => {
            setIsloading(false);
            api.error({
              message: `Error`,
              description: "Error in changing the password.",
              placement: "topRight",
            });
            console.log(err);
          });
      } else {
        setPasswordError((preState) => {
          return {
            ...preState,
            confirmNewPassword: true,
          };
        });
      }
    } else {
      checkForPasswordError();
    }
  };

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
 dispatch({ type: LOGOUT_ACTION, payload: null });
 navigate(RoutesConstant.login)
  };
  useEffect(() => {
    setIsloading(true);
    fetchMoreData(true, sortColumn, sortDirection)
    //fetchMoreData();
  }, [sortColumn, sortDirection]);

  const setUserStatus = () => {
    let user=setUser;
    const userObject = {
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.firstName + " " + user.lastName,
      contact: user.contact,
      userRoleId: user.userRoleId,
      userSkillId: user.userSkillId,
      email: user.email,
      isActive: !user.isActive,
      isAdmin: user.isAdmin,
      createdBy: "SYSTEM",
      updatedBy: "SYSTEM",
    };

    bidShushi
      .updateUser(user.id, userObject)
      .then((res) => {
        const updatedData = [...activeUsers];
        updatedData[setIndex].isActive = !user.isActive;
        setActiveUsers(updatedData);

        api.success({
          message: `Success`,
          description:  "User Status updated.",
          placement: "topRight",
        });
        return;
      })
      .catch((err) => {
        api.error({
          message: `Error`,
          description: "Error in updating the User.",
          placement: "topRight",
        });
        console.log(err);
      });
  };

  const fetchMoreData = (start = false, sortColumnBy = sortColumn,  sortBy = sortDirection) => {
    setDataLoading(true);
    if (start) {
      setPageNumber(0)
      setActiveUsers([])
      setIsloading(true);
    }
    let size;
    bidShushi
      .getAllSystemUsers(start ? 0 : pageNumber, (size = 25), sortColumnBy, sortBy)
      .then((res) => {
       /// console.log(res);
        setIsloading(false);
        setTotalUserLength(res.totalItems);
        setPageNumber((preState) => preState + 1); // bcz page starts from 0
        setActiveUsers((preState) => {
          return [
            ...preState,
            ...res.data
          ];
        });
        setDataLoading(false);
      })
      .catch((err) => console.log(err));
  };

  const sortingFunction = (column) => {
    if (sortColumn === column) {
      // Reverse the sort direction if the same column is clicked again
      setSortDirection(sortDirection === 'asc' ?  'desc' : sortDirection==="desc"? " ":  'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const showStatusModal = (user = null,index) => {
    setSelectedIndex(index);
    setIsModalOpenStatus(true);
    setSelectedUser(user);
  };
  
  const cancelStatusModal = (user = null) => {
    setIsModalOpenStatus(false);
    setSelectedUser(null);
  };

  return (
    <>
      <div className="user-list">
        {contextHolder}
        <div className="form-wrapper top-section">
          <h4 className="page-sub-title">User List</h4>
          <Link className="btn btn-success" to={RoutesConstant.userForm}>
            <i className="fa fa-plus-square-o me-2 font-18 align-middle"></i>{" "}
            Add User
          </Link>
        </div>
        {activeUsers && activeUsers.length == 0 && !isLoading ? (
          <div className="row m-0">
            <div className="no-data bg-gray border-rounded">
              <img src="/images/user-thumb.png" alt="" />
              <h3>There are no Users in the system</h3>
            </div>
          </div>
        ) : (
          <Skeleton loading={isLoading} avatar active>
            <InfiniteScroll
              dataLength={activeUsers.length}
              next={fetchMoreData}
              hasMore={activeUsers.length === totalUserLength ? false : true}
              loader={
                <p>
                  <Skeleton loading={isLoading} />
                </p>
              }
            >
              <table class="table user-list-table">
                <thead>
                  <tr>
                    <th onClick={()=>sortingFunction('fullName')}  className={sortColumn==='fullName'&&sortDirection==="asc"?"asc-active sorting-th":sortColumn==='fullName'&&sortDirection==="desc"?"desc-active sorting-th":"sorting-th"} scope="col" width="320">Full Name
                    <i className="fa fa-caret-up ms-2"></i>
                  
                    </th>
                    <th onClick={()=>sortingFunction('Email')}   className={sortColumn==='Email'&&sortDirection==="asc"?"asc-active sorting-th":sortColumn==='Email'&&sortDirection==="desc"?"desc-active sorting-th":"sorting-th"} scope="col">Email Address
                    <i className="fa fa-caret-up ms-2"></i>
                    </th>
                    <th scope="col">Contact Number</th>
                    <th onClick={()=>sortingFunction('userRole')}  className={sortColumn==='userRole'&&sortDirection==="asc"?"asc-active sorting-th":sortColumn==='userRole'&&sortDirection==="desc"?"desc-active sorting-th":"sorting-th"}  scope="col">User Type
                    <i className="fa fa-caret-up ms-2"></i>
                    </th>
                    <th onClick={()=>sortingFunction('userSkill')}  className={sortColumn==='userSkill'&&sortDirection==="asc"?"asc-active sorting-th":sortColumn==='userSkill'&&sortDirection==="desc"?"desc-active sorting-th":"sorting-th"} scope="col">Skill
                    <i className="fa fa-caret-up ms-2"></i>
                    </th>
                    <th onClick={()=>sortingFunction('isActive')}  className={sortColumn==='isActive'&&sortDirection==="asc"?"asc-active sorting-th":sortColumn==='isActive'&&sortDirection==="desc"?"desc-active sorting-th":"sorting-th"} scope="col">User Status
                    <i className="fa fa-caret-up ms-2"></i>
                    </th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeUsers &&
                    activeUsers.map((u, i) => {
                      return (
                        <tr>
                          <td scope="row">
                            <div class="user-full-name">
                              {u?.avatar != "null" && u?.avatar ? (
                                <img
                                  class="header-profile-user img-fluid"
                                  src={avatarURL + u?.avatar}
                                  alt="Header Avatar"
                                />
                              ) : (
                                <img
                                  class="header-profile-user img-fluid"
                                  src="/images/user-circle.png"
                                  alt="Header Avatar"
                                />
                              )}

                              <span class="d-inline-block ms-2">
                                {u.fullName} <br></br>{" "}
                                {u.isAdmin ? (
                                  <span className="tag tag-primary text-primary">
                                    Admin
                                  </span>
                                ) : (
                                  ""
                                )}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="color-primary email">
                              {u.email}
                            </span>
                          </td>
                          <td>{u.contact ? u.contact : "N/A"}</td>
                          <td>{u.userRole?.name || "N/A"}</td>
                          <td>{u.userSkill?.name || "N/A"}</td>
                          <td>
                            <Switch
                              checked={u.isActive}
                              disabled={user?.id === u.id||u.isDeleted}
                             // value={u.isActive}
                             // defaultChecked={u.isActive}
                              onClick={() => showStatusModal(u,i)}
                            />
                            <label>{u.isActive ? "Active" : "In-active"}</label>
                          </td>
                          <td>
                            {
                           !u.isDeleted&& <div className="action-btn">
                              <Tooltip
                                placement="top"
                                color="#fff"
                                
                                title={
                                  u.activated
                                    ? "Change Password"
                                    : BIDSUSHI_TEXT.resendActivation
                                }
                              >
                                <a>
                                  {u.activated ? (
                                    <svg
                                    //style={{cursor:u.id!=user.id?"pointer":"none"}}
                                      onClick={() => showPasswordModal(u)}
                                      class="lock"
                                      data-name="Layer 2"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 387.3846 375.95157"
                                    >
                                      <path
                                        d="M4126,604.2356c2.07953-.89846,4.15178-2.55749,6.23971-2.57749,20.40023-.1952,40.80312-.1386,61.20515-.10051,4.9019.00914,6.02549,1.201,6.08767,6.01089.02767,2.1411.03747,4.28351-.00317,6.42421-.0837,4.41069-1.21034,5.616-5.64717,5.649-8.94118.06668-17.88317.02423-26.82483.02474-11.58638.00067-23.17542.12637-34.75672-.11663-2.1164-.04441-4.20123-1.59416-6.30064-2.449Z"
                                        transform="translate(-4126 -243.748)"
                                      />
                                      <path
                                        d="M4360.23158,334.21182c-.669-11.31922-.24916-22.27612-2.19459-32.79538-2.75234-14.88226-16.87022-26.46872-31.59536-27.973-16.252-1.6602-31.09558,6.14156-37.81548,20.6552a59.34259,59.34259,0,0,0-4.40027,16.22234c-1.014,6.92954-2.12464,8.40135-9.29821,8.412-4.41268.00653-8.82688.07008-13.23771-.02128-5.09944-.10563-7.07758-2.16619-7.11922-7.17011a67.30723,67.30723,0,0,1,52.26415-66.10928c29.88121-7.00653,61.25648,8.36217,74.90073,36.51019A74.95277,74.95277,0,0,1,4389.035,314.837c.02524,5.5486.0783,11.09881-.02992,16.64539-.03944,2.02123.60968,2.82895,2.66749,3.19149,9.411,1.65794,14.53077,7.343,15.41131,16.83552.09293,1.00215.10947,2.01425.10965,3.02173q.00818,46.53357-.00639,93.06711c-.00968,10.13348-4.69117,17.10425-13.08371,19.296a30.00985,30.00985,0,0,1-7.486.75976q-65.434.06506-130.86807.02457c-13.76155-.0058-20.70772-6.97934-20.7113-20.7158q-.012-45.96609-.00034-91.93215c.0031-13.70317,7.02265-20.72606,20.71735-20.7387q49.54744-.04575,99.09491-.0799C4356.226,334.21087,4357.60206,334.21182,4360.23158,334.21182Zm-46.84493,85.92156c0,3.15026-.06086,6.302.01327,9.45049.13491,5.73086,3.32178,9.21759,8.292,9.18548,5.17349-.03341,8.15878-3.23776,8.26345-9.1428.10491-5.92071.14006-11.84753-.01365-17.766a9.40412,9.40412,0,0,1,3.31115-7.92932c6.60342-5.96773,6.7351-16.5455.60474-23.07075a16.62035,16.62035,0,0,0-23.43862-1.07808c-6.78461,6.16323-7.798,16.54819-1.3527,22.94338,3.69292,3.66421,4.71176,7.40357,4.33651,12.11691C4313.26326,416.59575,4313.38028,418.36922,4313.38665,420.13338Z"
                                        transform="translate(-4126 -243.748)"
                                      />
                                      <path
                                        d="M4157.218,558.16536c-4.67092,2.7009-8.54011,4.98005-12.45,7.18718-3.85339,2.17525-7.23074,1.61057-8.87712-1.39945-1.61808-2.95826-.51145-5.85611,3.20014-8.08173,3.98784-2.39126,8.02354-4.70264,12.64486-7.4033-4.012-2.34805-7.64577-4.44325-11.24422-6.59753a19.084,19.084,0,0,1-3.70328-2.57053,4.8788,4.8788,0,0,1-.736-6.54951c1.52546-2.35683,3.86049-3.44472,6.51869-2.16863,3.39345,1.629,6.60974,3.62673,9.906,5.45909,1.39054.773,2.79025,1.52944,4.73977,2.59667,0-4.82262-.03676-9.05882.02113-13.29371.01875-1.37138-.20691-3.18741.54405-4.01341,1.45518-1.6006,3.45013-3.55716,5.35478-3.7107,3.14141-.25321,4.98127,2.2695,5.085,5.409.16529,5.00382.04417,10.01706.04417,15.762,4.42211-2.56362,8.2458-4.8945,12.18667-7.00673,1.50084-.80442,3.48516-1.851,4.8645-1.45307a8.2752,8.2752,0,0,1,4.64455,3.71105c1.21411,2.35056,0,4.73053-2.24493,6.15515-3.29182,2.089-6.706,3.98456-10.05851,5.9787-1.1534.686-2.278,1.42044-3.76977,2.35435,4.46616,2.61122,8.50029,4.92259,12.48648,7.31388,3.88758,2.33218,4.98751,5.40555,3.11134,8.401-1.722,2.74921-4.98127,3.21363-8.67759,1.13027-4.01142-2.26093-7.97631-4.60446-12.50847-7.2287,0,5.23726.03824,9.74393-.0107,14.24964-.0494,4.54734-2.094,7.0789-5.57546,7.04823-3.466-.03056-5.41857-2.5117-5.48293-7.15212C4157.17014,567.89373,4157.218,563.49348,4157.218,558.16536Z"
                                        transform="translate(-4126 -243.748)"
                                      />
                                      <path
                                        d="M4482.15534,558.06582c0,5.41951.03274,10.06175-.01217,14.70325-.02727,2.818-.83471,5.30358-3.78536,6.33873-3.72222,1.30572-7.08893-1.33173-7.23552-5.81766-.15606-4.77485-.03512-9.55878-.03512-15.09383-3.09665,1.7295-5.74856,3.20026-8.39,4.68961-1.64382.92689-3.23568,1.95282-4.91466,2.80912-3.29489,1.68051-6.34634,1.00375-7.94887-1.66539-1.65424-2.75519-.86788-5.67433,2.33431-7.72034,3.17869-2.031,6.49873-3.83992,9.74537-5.76547,1.03975-.61663,2.04313-1.29466,3.55166-2.2559-4.29214-2.49793-8.18748-4.7342-12.05216-7.02236-4.21552-2.49595-5.433-5.47505-3.56488-8.55951,1.86674-3.08224,4.93446-3.40961,9.2622-.93578,3.79377,2.16853,7.56272,4.38055,11.97037,6.93751,0-5.35031-.00942-10.06654.00323-14.78271.00864-3.22293,1.1847-5.69951,4.57776-6.47906,3.37518-.77543,6.29485,1.86714,6.445,6.06437.17081,4.77346.0395,9.55776.0395,15.13738,3.4716-1.991,6.438-3.7029,9.41549-5.39546,1.52985-.86962,3.03764-1.79419,4.629-2.536,2.94646-1.37358,5.53722-.69281,7.19057,2.05889,1.68622,2.80642.91928,5.48549-1.72525,7.25905-3.23388,2.16881-6.68507,4.013-10.03753,6.00545-1.15528.68659-2.29632,1.39711-3.88915,2.36818,4.50548,2.6503,8.50784,4.96206,12.467,7.34558,3.8892,2.34136,5.00655,5.398,3.15426,8.3707-1.73982,2.79222-4.94956,3.26567-8.66963,1.17291C4490.75139,563.08648,4486.869,560.79238,4482.15534,558.06582Z"
                                        transform="translate(-4126 -243.748)"
                                      />
                                      <path
                                        d="M4256.36691,548.4551c-4.48579-2.62128-8.51173-4.92889-12.492-7.31276-3.78082-2.26437-4.97858-5.49188-3.2223-8.41569,1.71015-2.847,4.8171-3.33233,8.62031-1.22718,4.04013,2.2363,8.0295,4.56434,12.71909,7.23909,0-5.28035-.03941-9.881.01143-14.48074.04787-4.33217,2.00625-6.85613,5.26674-6.95246,3.40754-.10069,5.53544,2.54858,5.57066,7.03863.03555,4.53207.00783,9.06466.00783,14.39418,3.548-2.04525,6.64215-3.83731,9.7452-5.61378,1.41953-.81266,2.81752-1.67771,4.294-2.373,2.92119-1.37565,5.45171-.78008,7.243,1.94116,1.633,2.48089.8512,5.7497-1.94406,7.55524-3.38126,2.18414-6.93406,4.10186-10.40053,6.15533-.95112.56341-1.859,1.19991-3.17426,2.05479,4.317,2.5454,8.29748,4.85749,12.24264,7.22831,3.90724,2.34814,5.08248,5.37818,3.32112,8.35959-1.73123,2.93041-4.95988,3.33682-8.94953,1.07962-3.91651-2.21583-7.8114-4.46992-12.37679-7.086,0,5.23931.02878,9.82864-.00823,14.41746-.03591,4.45309-1.83864,6.77624-5.24543,6.88437-3.59778.11419-5.54113-2.23077-5.59418-6.903-.05128-4.51734-.01112-9.0357-.01112-14.436-2.896,1.66933-5.22636,3.017-7.56108,4.35709-2.07463,1.1908-4.09867,2.487-6.2446,3.53222-3.09111,1.50556-6.14691.65934-7.60457-1.90987a5.537,5.537,0,0,1,2.16728-7.522C4247.01323,553.793,4251.41728,551.34769,4256.36691,548.4551Z"
                                        transform="translate(-4126 -243.748)"
                                      />
                                      <path
                                        d="M4383.00206,548.38619c4.71266,2.75674,8.75608,5.06518,12.74128,7.4702,3.54942,2.142,4.679,5.33456,3.02258,8.17636-1.65565,2.84041-4.95632,3.39411-8.63843,1.32374-4.0295-2.2657-8.00293-4.63113-12.74884-7.38755,0,5.60345.01265,10.44371-.00453,15.28385-.011,3.11561-1.22316,5.42745-4.52159,6.01492-3.5094.62506-6.185-1.7664-6.28158-5.73392-.1193-4.90333-.02856-9.81179-.02856-15.4942-3.48373,1.99042-6.487,3.7053-9.4892,5.42211-1.42074.81246-2.79533,1.721-4.26816,2.42387-3.09391,1.4764-6.13452.67786-7.61306-1.88552-1.48163-2.56877-.74154-5.70785,2.12648-7.527,4.24792-2.6944,8.6431-5.15649,13.63452-8.107-3.55585-2.08079-6.73507-3.93772-9.91055-5.80108-1.30267-.7644-2.65659-1.45917-3.88334-2.33165-2.71223-1.929-3.52228-5.10922-1.86388-7.58466,1.81752-2.713,4.40567-3.35086,7.254-1.86229,3.56728,1.86432,7.003,3.9798,10.50679,5.96695.95764.54317,1.95576,1.01493,3.49352,1.80695,0-5.07647-.0287-9.67176.00831-14.26651.035-4.3409,1.95017-6.84687,5.24165-6.98087,3.39095-.138,5.54689,2.50249,5.59595,6.99405.04939,4.5221.01088,9.04515.01088,14.44731,3.07093-1.77393,5.60874-3.23927,8.14591-4.70566,1.74453-1.00828,3.4493-2.09407,5.2407-3.01058,3.31411-1.69557,6.41709-1.02184,7.97286,1.62185,1.61571,2.74556.63469,6.01626-2.61239,8.00862C4391.97439,543.22039,4387.7231,545.62167,4383.00206,548.38619Z"
                                        transform="translate(-4126 -243.748)"
                                      />
                                      <path
                                        d="M4267.50371,619.66613c-10.1963-.00069-20.39268.02575-30.58884-.012-4.99881-.01854-6.24932-1.29847-6.32987-6.22921-.02467-1.51051-.008-3.02178-.004-4.5327.01687-6.26453,1.04163-7.34424,7.15213-7.3484q29.64479-.02013,59.28958-.001c6.24121.00349,7.24893,1.02688,7.278,7.2275.05107,10.89633.05107,10.8964-10.73983,10.89653Q4280.5323,619.667,4267.50371,619.66613Z"
                                        transform="translate(-4126 -243.748)"
                                      />
                                      <path
                                        d="M4371.95259,619.66572c-10.19574-.00107-20.39163.02933-30.58718-.01416-4.94252-.02109-6.03514-1.14381-6.16708-5.96824-.33207-12.14485-.33209-12.14485,11.76463-12.14485q27.18864,0,54.37728.003c6.51836.00291,7.52777,1.002,7.54169,7.35239.02362,10.77291.02362,10.77289-10.87355,10.77291Q4384.98049,619.66673,4371.95259,619.66572Z"
                                        transform="translate(-4126 -243.748)"
                                      />
                                      <path
                                        d="M4476.43251,619.6653c-10.19574-.00143-20.39161.03111-30.58714-.01552-4.89066-.02238-5.94356-1.14681-6.0011-6.05771q-.0354-3.02124.001-6.04323c.06516-4.79628,1.18952-5.94826,6.10221-5.99335,6.29315-.05773,12.58721-.01679,18.88086-.01688q20.95791-.00027,41.91576.01028c5.5181.01134,6.608,1.157,6.63378,6.67081.05361,11.447.05361,11.447-11.26727,11.447Q4489.27158,619.66673,4476.43251,619.6653Z"
                                        transform="translate(-4126 -243.748)"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                  //  style={{cursor:u.id!=user.id?"pointer":"none"}}
                                    onClick={() => showPasswordModal(u)}
                                      class="lock"
                                      id="Layer_1"
                                      data-name="Layer 1"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 509.49675 510.10051"
                                    >
                                      <path
                                        d="M291.07291,651.03473c-4.09521-.50423-8.20178-.93093-12.28339-1.52806-9.8292-1.43786-15.62865-8.37882-14.56745-17.32172.988-8.32593,8.10065-13.93023,17.52123-13.09895,20.2644,1.788,40.44165,1.65176,60.539-1.723,51.24306-8.60473,94.5707-32.10964,129.45282-70.44449,41.78274-45.91844,61.3843-100.55243,58.03615-162.33432-3.8659-71.33541-35.74374-128.33015-93.17273-170.92985-1.12771-.8365-2.39095-1.49026-4.357-2.701,2.00255,8.9219,3.81009,16.96771,5.61415,25.0143,2.16629,9.66217-2.21946,17.57959-10.94919,19.7717-8.68237,2.18023-16.565-2.84618-18.82568-12.44864q-7.23459-30.73-14.08-61.55107a14.99827,14.99827,0,0,1,11.35391-18.29025q31.18233-7.46927,62.51047-14.32443c8.97628-1.96682,16.74237,3.12559,18.60627,11.49612,1.91557,8.60289-3.05186,16.1282-12.33538,18.46105-7.71055,1.93759-15.46223,3.7113-23.18969,5.58245-.249.06029-.43187.39352-.346.31077,10.245,8.61509,21.00094,16.72141,30.678,25.95809,44.49892,42.47392,71.30623,94.28788,77.74728,155.51417,14.12758,134.291-67.60166,234.39754-168.24283,270.15435A243.74072,243.74072,0,0,1,326.256,650.18631a34.34109,34.34109,0,0,0-4.30182.84842Z"
                                        transform="translate(-51.12269 -140.93422)"
                                      />
                                      <path
                                        d="M306.72688,499.9477q-64.47678.00085-128.95356-.00228c-13.99626-.00259-19.31957-5.27437-19.32028-19.10059q-.00435-85.13922.00157-170.27844c.00144-12.92137,5.49511-18.39753,18.46152-18.39832q129.94932-.008,259.89868-.00046c13.18218.00073,18.62758,5.50254,18.62816,18.78746q.00369,85.38818-.00149,170.77636c-.00122,12.45808-5.72059,18.19906-18.26737,18.20617Q371.9505,499.97459,306.72688,499.9477Zm117.73084-157.376c-2.29664,2.03093-3.7881,3.31722-5.24423,4.64232q-49.88371,45.39537-99.76213,90.79652c-8.86846,8.06989-16.08453,8.12184-24.91216.09519q-49.53426-45.03957-99.03732-90.11342c-1.77786-1.61736-3.621-3.16293-6.027-5.2586V468.87806H424.45772Zm-117.52335,65.312,93.07094-84.7332H213.859C245.25794,351.7352,275.89412,379.62553,306.93437,407.88368Z"
                                        transform="translate(-51.12269 -140.93422)"
                                      />
                                      <path
                                        d="M177.327,578.98433c-2.08317-9.29179-4.18395-18.31036-6.11238-27.36565-1.81316-8.51392,2.9422-16.21627,11.14237-18.3469A14.88813,14.88813,0,0,1,200.81642,544.186q7.59879,31.4133,14.4328,63.00943c1.97965,9.17173-3.03614,16.51759-12.17379,18.65789q-30.5,7.14394-61.07758,13.95457c-9.14275,2.03542-17.36038-3.019-19.18075-11.41408-1.85583-8.55861,3.18793-16.18711,12.40575-18.48652,7.47973-1.86587,15.00986-3.5297,23.02714-5.40217-8.2549-6.86344-16.17106-12.88019-23.45-19.58837C85.15173,539.16188,57.05355,482.64911,51.8842,415.27424c-9.81306-127.89878,76.1873-242.3374,201.759-268.9641a252.19245,252.19245,0,0,1,77.25564-4.11257c10.0345.98079,15.96385,5.89851,16.89484,13.82731a15.15222,15.15222,0,0,1-15.72587,17.02963c-9.61656-.23971-19.227-1.19571-28.837-1.15178C201.56426,172.3675,109.91964,244.40708,88.27,343.55914c-20.42511,93.54381,8.157,171.021,82.55309,231.44632,1.54089,1.2515,3.22237,2.33325,4.86969,3.44774A7.43753,7.43753,0,0,0,177.327,578.98433Z"
                                        transform="translate(-51.12269 -140.93422)"
                                      />
                                    </svg>
                                  )}
                                </a>
                              </Tooltip>
                              <Tooltip
                                placement="top"
                                color="#fff"
                                title="Edit"
                              >
                                <Link
                                  
                                  to={
                      RoutesConstant.userFormEdit.replace(
                                          ":userId",
                                          u?.id
                                        )
                                  }
                                >
                                  <svg
                                    class="pencil"
                                    id="Layer_1"
                                    data-name="Layer 1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 384 384"
                                  >
                                    <path
                                      d="M4512,336c-.55875,2.27505-1.06581,4.56426-1.68526,6.82265a51.96646,51.96646,0,0,1-13.58855,23.37044Q4402.619,460.33414,4308.503,554.46629c-8.20644,8.20347-19.78186,8.36048-27.3951.589-7.49183-7.64751-7.1961-19.01639.89644-27.11709q72.61151-72.68434,145.29972-145.29208a31.87641,31.87641,0,0,1,3.28553-2.582c-19.73571-19.75245-38.874-38.907-58.89137-58.94137a16.14545,16.14545,0,0,1-2.0608,3.26463q-96.86161,96.95454-193.8266,193.80577c-7.15391,7.13946-10.63193,15.29395-10.3702,25.47459.36246,14.09821.091,28.21271.091,42.65211,1.36733.06537,2.56715.1723,3.767.17251,13.99807.00254,27.99625.01806,41.99418-.03138,8.14713-.02877,14.96969-3.2143,20.894-8.73152,5.6139-5.22817,12.24-6.60869,19.45051-3.96673a18.63112,18.63112,0,0,1,6.6773,30.75407,65.12165,65.12165,0,0,1-36.74679,18.736c-.95439.15706-1.87919.49393-2.81775.74716H4143a21.65194,21.65194,0,0,1-15-15V533.25a5.30391,5.30391,0,0,0,.58-1.3353c2.08119-15.72232,9.23826-28.764,20.43461-39.88437q38.70981-38.44717,77.18555-77.13,79.01362-79.0142,157.99756-158.058c6.94219-6.95649,14.71685-12.32672,24.252-14.947,2.50145-.68742,5.03273-1.26646,7.55029-1.89527h12.75a12.89992,12.89992,0,0,0,2.04952.70526,49.0481,49.0481,0,0,1,26.93962,13.59443q20.09743,19.86336,39.96323,39.96063a48.41565,48.41565,0,0,1,12.98076,24.0205c.37227,1.67125.87458,3.31353,1.31687,4.96918Zm-111.66277-41.51,57.74427,57.74555c3.119-3.23616,6.58088-6.8304,10.04577-10.42177.8673-.899,1.78662-1.75149,2.60973-2.68884,5.05177-5.75272,5.05989-13.29725-.0477-19.035-1.74177-1.95667-3.6692-3.74882-5.52372-5.60423-10.775-10.78009-21.50974-21.60084-32.34858-32.31636-5.72639-5.66129-13.37523-6.52709-18.90257-1.63989C4408.89615,284.96667,4404.5237,290.13424,4400.33723,294.49Z"
                                      transform="translate(-4128 -240)"
                                    />
                                    <path
                                      d="M4320.75,624c-1.83231-.75792-3.73527-1.381-5.48466-2.29724a18.7311,18.7311,0,0,1-9.43074-20.60875,18.92042,18.92042,0,0,1,17.00354-14.5405c1.49315-.09469,2.99581-.0517,4.49409-.05177,53.69518-.00208,107.39131.17065,161.08472-.13744,11.6795-.067,19.77727,3.76068,23.58305,15.1357V609a21.77952,21.77952,0,0,1-15,15Z"
                                      transform="translate(-4128 -240)"
                                    />
                                    <path
                                      class="cls-1"
                                      d="M4497,624a21.77952,21.77952,0,0,0,15-15v15Z"
                                      transform="translate(-4128 -240)"
                                    />
                                    <path
                                      class="cls-1"
                                      d="M4128,609a21.65194,21.65194,0,0,0,15,15h-15Z"
                                      transform="translate(-4128 -240)"
                                    />
                                  </svg>
                                </Link>
                              </Tooltip>
                             {u.id!==user?.id&& <a onClick={() => { showModal(u) }}>
                              <Tooltip  placement="top" color="#fff" title="Delete"> 
                              <svg
                                className="delete"
                                id="Layer_1"
                                data-name="Layer 1"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 287.99403 352.16973"
                              >
                                <path
                                  d="M4191.9382,458.00706q.00066-44.24244.01214-88.48487c.01008-9.36451,5.06424-15.771,13.41867-17.23948a15.92494,15.92494,0,0,1,18.577,14.5516c.10016,1.36824.05215,2.74823.0522,4.12278q.00307,86.42274.0025,172.84548c.00069,19.16153,13.05684,32.19441,32.25934,32.19619q63.73886.00588,127.4777,0c19.19124-.00176,32.26071-13.04743,32.26144-32.19795q.00336-87.17264.0057-174.34525c.00147-8.99939,4.81874-15.4317,12.68818-17.0516a15.77174,15.77174,0,0,1,19.00372,13.02685,31.64931,31.64931,0,0,1,.35115,5.22054q.026,86.79768.00867,173.59537c-.01112,31.71478-21.21833,57.20031-52.38563,62.86683a63.339,63.339,0,0,1-11.18813.90967q-64.48888.0918-128.97792.02978c-35.72642-.03273-63.51212-27.7766-63.55944-63.43568Q4191.88806,501.31225,4191.9382,458.00706Z"
                                  transform="translate(-4176.00729 -255.90742)"
                                />
                                <path
                                  d="M4383.93306,303.93738c4.18826,0,7.79867-.00013,11.40907,0,17.24245.00075,34.48542-.08178,51.72714.03142,11.692.07675,19.38876,10.00638,16.21346,20.62673A15.96911,15.96911,0,0,1,4449.33247,335.94c-.86968.07265-1.74794.05759-2.62225.05761q-126.69444.00351-253.38889-.00525c-10.18209-.00159-17.39232-6.77969-17.3134-16.15508.07735-9.1902,7.21977-15.85037,17.25988-15.88155,19.24137-.05974,38.48307-.018,57.72463-.01833,1.48744,0,2.97489,0,5.07008,0,0-1.58972-.00016-2.90138,0-4.213.00123-8.99605-.059-17.99265.02025-26.988.08861-10.05782,6.6027-16.73457,16.669-16.76288q47.22891-.13282,94.45838-.00107c10.08515.02755,16.61666,6.67293,16.70345,16.72705C4384.00179,282.91958,4383.93306,293.14111,4383.93306,303.93738Zm-32.1414-.22437V288.18024h-63.63309V303.713Z"
                                  transform="translate(-4176.00729 -255.90742)"
                                />
                                <path
                                  d="M4272.00268,455.96361c.00239-18.61148-.048-37.22315.0261-55.83432a15.8746,15.8746,0,0,1,12.83687-15.82283,15.71079,15.71079,0,0,1,17.56572,9.02109,21.19172,21.19172,0,0,1,1.56354,7.991q.14854,54.70988.04662,109.42037c-.01422,10.18716-6.89975,17.36183-16.26584,17.24771-9.18955-.112-15.75561-7.284-15.76865-17.31279Q4271.97144,483.31877,4272.00268,455.96361Z"
                                  transform="translate(-4176.00729 -255.90742)"
                                />
                                <path
                                  d="M4367.995,456.28752c-.00466,18.61194.05867,37.22422-.03572,55.83568a15.65552,15.65552,0,0,1-12.003,15.31576,15.28435,15.28435,0,0,1-17.41319-7.05681,20.1848,20.1848,0,0,1-2.49463-9.21767q-.252-55.08524-.084-110.1723c.017-9.94079,6.908-17.03344,16.13761-16.98169,9.21256.05165,15.87279,7.21112,15.889,17.19062Q4368.03589,428.74425,4367.995,456.28752Z"
                                  transform="translate(-4176.00729 -255.90742)"
                                />
                              </svg>
                              </Tooltip>
                           
                            </a>}
                           
                            </div>}
                            {
                            u.isDeleted&&<span>-</span>
                          }
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </InfiniteScroll>
            {
                dataLoading&&<Skeleton avatar active/>
               }
          </Skeleton>
        )}
        <Modal
         okText={BIDSUSHI_TEXT.Yes} cancelText={BIDSUSHI_TEXT.No}
          title="Change Password"
          open={isModalOpen1}
          onOk={handlePasswordModalOk1}
          onCancel={handlePasswordModalCancel1}
        >
          <div className="form-wrapper row">
            <div className="col-12 form-group">
              <label>Current Password</label>
              <input
                name="currentPassword"
                value={currentPassword}
                onKeyDown={handleKeyDown1}
                type="password"
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setPasswordError((preState) => {
                    return {
                      ...preState,
                      currentPassword: false,
                    };
                  });
                }}
                onBlur={checkValidCurrentPassword}
                className="form-control"
                placeholder="Enter Current password"
              />
              {!currentPassword && passwordError.currentPassword ? (
                <span className="text-danger text-error">
                  Current Password cannot be empty.
                </span>
              ) : null}
              {currentPassword && passwordError.currentPassword ? (
                <span className="text-danger text-error">
                  Current Password must be atleast 8 characters long and must have
                  atleast 1 digit, 1 special character and 1 uppercase letter.
                </span>
              ) : null}
            </div>
          </div>
          <div className="form-wrapper row">
            <div className="col-12 form-group">
              <label>New Password</label>
              <input
                name="newPassword"
                value={newPassword}
                onKeyDown={handleKeyDown1}
                type="password"
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError((preState) => {
                    return {
                      ...preState,
                      newPassword: false,
                    };
                  });
                }}
                onBlur={checkValidPassword}
                className="form-control"
                placeholder="Enter new password"
              />
              {!newPassword && passwordError.newPassword ? (
                <span className="text-danger text-error">
                  Password cannot be empty.
                </span>
              ) : null}
              {newPassword && passwordError.newPassword ? (
                <span className="text-danger text-error">
                  Password must be atleast 8 characters long and must have
                  atleast 1 digit, 1 special character and 1 uppercase letter.
                </span>
              ) : null}
            </div>
          </div>
          <div className="form-wrapper row">
            <div className="col-12 form-group">
              <label>Confirm New Password</label>
              <input
                name="confirmNewPassword"
                value={confirmNewPassword}
                type="password"
                onKeyDown={handleKeyDown1}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  setPasswordError((preState) => {
                    return {
                      ...preState,
                      confirmNewPassword: false,
                    };
                  });
                }}
                onBlur={checkValidConfirmPassword}
                className="form-control"
                placeholder="Confirm new password"
              />
              {!confirmNewPassword && passwordError.confirmNewPassword ? (
                <span className="text-danger text-error">
                  Please confirm your password.
                </span>
              ) : null}
              {confirmNewPassword && passwordError.confirmNewPassword ? (
                <span className="text-danger text-error">
                  Password and confirm password not match.
                </span>
              ) : null}
            </div>
          </div>
        </Modal>
        <Modal
         okText={'Yes'} cancelText={'No'}
          title="Change Password"
          open={isModalOpen}
          onOk={handlePasswordModalOk}
          onCancel={handlePasswordModalCancel}
          okButtonProps={{disabled:isLoading}}
        >
          <div className="form-wrapper row">
            <div className="col-12 form-group">
              <label>New Password</label>
              <input
                name="newPassword"
                value={newPassword}
                onKeyDown={handleKeyDown}
                type="password"
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError((preState) => {
                    return {
                      ...preState,
                      newPassword: false,
                    };
                  });
                }}
                onBlur={checkValidPassword}
                className="form-control"
                placeholder="Enter new password"
              />
              {!newPassword && passwordError.newPassword ? (
                <span className="text-danger text-error">
                  Password cannot be empty.
                </span>
              ) : null}
              {newPassword && passwordError.newPassword ? (
                <span className="text-danger text-error">
                  Password must be atleast 8 characters long and must have
                  atleast 1 digit, 1 special character and 1 uppercase letter.
                </span>
              ) : null}
            </div>
          </div>
          <div className="form-wrapper row">
            <div className="col-12 form-group">
              <label>Confirm New Password</label>
              <input
                name="confirmNewPassword"
                value={confirmNewPassword}
                type="password"
                onKeyDown={handleKeyDown}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  setPasswordError((preState) => {
                    return {
                      ...preState,
                      confirmNewPassword: false,
                    };
                  });
                }}
                onBlur={checkValidConfirmPassword}
                className="form-control"
                placeholder="Confirm new password"
              />
              {!confirmNewPassword && passwordError.confirmNewPassword ? (
                <span className="text-danger text-error">
                  Please confirm your password.
                </span>
              ) : null}
              {confirmNewPassword && passwordError.confirmNewPassword ? (
                <span className="text-danger text-error">
                  Password and confirm password not match.
                </span>
              ) : null}
            </div>
          </div>
        </Modal>
        <Modal
        okText={"Yes"}
        cancelText={"No"}
        title="Confirmation Message"
        open={isModalOpenStatus}
        onOk={()=>{
          setUserStatus()
          setIsModalOpenStatus(false);
        }}
        onCancel={()=>{
          setIsModalOpenStatus(false);
        }}
      >
        <p className="confirmation-text">
         Are you sure you want to change the status of this user?{" "}
        </p>
      </Modal>
      <Modal    okText={BIDSUSHI_TEXT.Yes} cancelText={BIDSUSHI_TEXT.No} title={BIDSUSHI_TEXT.confirmation} open={isDeleteModal} onOk={() => { handleOk() }} onCancel={handleCancel}>
        <p className="confirmation-text">{BIDSUSHI_TEXT.deletingUser}</p>
      </Modal>
      <Modal  closable={null}  okText={BIDSUSHI_TEXT.Yes} cancelText={BIDSUSHI_TEXT.No} title={BIDSUSHI_TEXT.confirmation} open={isUserExist} onOk={()=>handleOk()} onCancel={handleCancel}>
      <p className="confirmation-text color-gray mb-3">This User is assigned to existing bid(s). If you proceed with the deletion, it cannot be reversed.</p>

<p className="confirmation-text">Are you sure you want to continue?</p> 
      </Modal>
      </div>
    </>
  );
};
export default UserList;
