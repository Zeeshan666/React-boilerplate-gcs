import { Skeleton } from "antd";
import { React, useState, useEffect } from "react";
import { useNavigate} from "react-router-dom";
import { Upload, notification, Modal } from "antd";
import bidShushi from '../../Services/Api/Api';
import RoutesConstant from "../../Routes/Constant";
import DialogLeavingPage from "../../hooks/leave";
import { useNavigatingAway } from "../../hooks/navigateaway";
import { USER_PASSWORD_REGEX,avatarURL } from "../../Common";
import BIDSUSHI_TEXT from "../../Common/Constant";
import { useAuthContext } from "../../hooks/useAuthContext";
import { LOGIN_ACTION } from '../../Context/Actions';
import { LOGOUT_ACTION } from '../../Context/Actions'

function UserProfileForm() {
  const navigate = useNavigate();
  const { dispatch,user } = useAuthContext();

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [contact, setContactNumber] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userResponse, setUserResponse] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userSkill, setUserSkill] = useState('');
  const [userStatus, setUserStatus] = useState('');
  const [userAdmin, setUserAdmin] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [api, contextHolder] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [isModalOpenDelete,setIsModalOpenDelete] = useState(false)
  const [canShowDialogLeavingPage, setCanShowDialogLeavingPage] = useState(false);
  const [
    showDialogLeavingPage,
    confirmNavigation,
    cancelNavigation
  ] = useNavigatingAway(canShowDialogLeavingPage);

  const [error, setError] = useState({
    firstName: false,
    lastName: false,
    contact: false,
  });

  const [passwordError, setPasswordError] = useState({
    newPassword: false,
    confirmNewPassword: false
  })

  const showPasswordModal = (event) => {
    event.preventDefault();
    setPasswordError({
      newPassword: false,
      confirmNewPassword: false
    })
    setIsModalOpen(true);
};

const handlePasswordModalOk = () => {
    //saveBid(true);
    sendPasswordCall();
};

const handlePasswordModalCancel = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setIsModalOpen(false);
};
const handleCancelDelete = ()=>{
  setIsModalOpenDelete(false);
}
const handleOpenDelete = ()=>{
  setIsModalOpenDelete(true);
}

  useEffect(() => {
      setIsLoading(true);
      bidShushi.getUserById(user.id)
        .then((res) => {
      //    console.log(res)
          setIsLoading(false)
          setUserResponse(res);
          setFirstName(res && res.firstName)
          setLastName(res && res.lastName)
          setEmail(res && res.email)
          setContactNumber(res && res.contact)
          setUserSkill(res && res.userSkillId)
          setUserRole(res && res.userRoleId)
          setUserAdmin(res && res.isAdmin)
          setUserStatus(res && res.isActive)
          setCurrentPassword('')
          setNewPassword('')
          setConfirmNewPassword('')
          setCanShowDialogLeavingPage(false)
          if(res&&res.avatar&&res.avatar!='null'){
            let url = avatarURL+res.avatar
            setAvatar(res.avatar);
            setAvatarPreview(url);
          }
        }).catch(err => console.log(err))
  }, [])

  const onChangeHandler = (e) => {
    let name = e.target.name;
    let value = e.target.value.trim();
    if (value.length > 0) {
      setCanShowDialogLeavingPage(true);
    }

    if (name === "firstName") {
      setFirstName(value);
      if (value.length == 0) {
        setError((preState) => {
          return {
            ...preState,
            firstName: true,
          };
        });
      }
      else if (value.length > 255) {
        setError((preState) => {
          return {
            ...preState,
            firstName: true,
          };
        });
      }
      else {
        setError((preState) => {
          return {
            ...preState,
            firstName: false,
          };
        });
      }
    }
    if (name === "lastName") {
      setLastName(value);
      if (value.length == 0) {
        setError((preState) => {
          return {
            ...preState,
            lastName: true,
          };
        });
      }
      else if (value.length > 255) {
        setError((preState) => {
          return {
            ...preState,
            lastName: true,
          };
        });
      }
      else {
        setError((preState) => {
          return {
            ...preState,
            lastName: false,
          };
        });
      }
    }

    if (name === "contact") {
      setContactNumber(value);
      if (value &&(value.length<7 ||value.length > 15)) {
        setError((preState) => {
          return {
            ...preState,
            contact: true,
          };
        });
      }
      else {
        setError((preState) => {
          return {
            ...preState,
            contact: false,
          };
        });
      }
    }
  }

  const checkValidCurrentPassword = () => {
    if (currentPassword && currentPassword.length > 0) {
      if (
        currentPassword.length < 8 ||
        !currentPassword.match(USER_PASSWORD_REGEX)
      ) {
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
      if (
        newPassword.length < 8 ||
        !newPassword.match(USER_PASSWORD_REGEX)
      ) {
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

  const handleCancel = () => {
    setCanShowDialogLeavingPage(true);
    navigate(RoutesConstant.main)
  };

  const checkForPasswordError = () => {
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
  }

  const handleKeyPress = (event) => {
    const keyCode = event.keyCode || event.which;
    const keyValue = String.fromCharCode(keyCode);
    const regex = /[0-9-+]|\./; // Allow only numbers and "-"

    if (!regex.test(keyValue)) {
      event.preventDefault();
    }
  };


  const removeAvatar=()=>{
    if(avatar&&typeof avatar !='object'){
      bidShushi.removeAvatar(user.id,avatar).then(res=>{
        setAvatar(null);
        setAvatarPreview(null);
        api.success({
          message: `Success`,
          description:'Profile image has been deleted successfully.',
          placement: 'topRight'
        })

        let user=  JSON.parse(localStorage.getItem('user'));
        user={
          ...user,
          fullName:firstName + ' ' + lastName,
          avatar:null,   
        }
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: LOGIN_ACTION, payload: user }); 
      }).catch(err=>{
        console.log(err);
      })
    }else{
      setAvatar(null);
      setAvatarPreview(null);
    }

    setIsModalOpenDelete(false);

  }
  const checkForError = () => {
    if (!firstName) {
      setError((preState) => {
        return {
          ...preState,
          firstName: true,
        };
      });
    }
    if (!lastName) {
      setError((preState) => {
        return {
          ...preState,
          lastName: true,
        };
      });
    }
    if (!email) {
      setError((preState) => {
        return {
          ...preState,
          email: true,
        };
      });
    }
  }

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

  const sendPasswordCall = () => {

    if (
      currentPassword && newPassword && confirmNewPassword &&
      checkValidCurrentPasswordAgain() &&
      checkValidPasswordAgain() &&
      checkValidConfirmPasswordAgain()
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
          firstName: userResponse.firstName,
          lastName: userResponse.lastName,
          fullName: userResponse.fullName,
          contact: userResponse.contact,
          userRoleId: userResponse.userRoleId,
          userSkillId: userResponse.userSkillId,
          email: userResponse.email,
          isActive: userResponse.isActive,
          isAdmin: userResponse.isAdmin,
          currentPassword: currentPassword,
          password: newPassword,
          createdBy: "SYSTEM",
          updatedBy: "SYSTEM",
        };

        bidShushi
          .updateUserProfile(userResponse.id, userObject)
          .then((res) => {
            setIsLoading(false);
            setIsModalOpen(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            api.success({
              message: `Success`,
              description: BIDSUSHI_TEXT.passwordUpdated,
              placement: "topRight",
            });
            if(userResponse?.id===user?.id){
              logout();
            }
          })
          .catch((err) => {
            setIsLoading(false);
            api.error({
              message: `Error`,
              description: err?.message || "Error in changing the password.",
              placement: "topRight",
            });
          });
      }
      else {
        setPasswordError((preState) => {
          return {
            ...preState,
            confirmNewPassword: true,
          };
        });
      }
    }
    else {
      checkForPasswordError()
    }
  }

  const saveUser = () => {
    if (
      firstName && lastName && email
      // && (!(questionsStages.some((element) => element.isChecked ? (element.assign_to === null || element.wc_equiv == null || element.wc_equiv === '') : '')))
      && Object.values(error).every(value => value === false)
    ) {
      const formData  = new FormData();
      formData.append('firstName',firstName);
      formData.append('lastName',lastName)
      formData.append('avatar',avatar)

      formData.append('fullName',firstName + ' ' + lastName)
      formData.append('contact',contact)
      formData.append('userRoleId', userRole)
      formData.append('userSkillId',userSkill)
      formData.append('email',email)
      formData.append('isActive',userStatus)

      formData.append('isAdmin',userAdmin)
      formData.append('createdBy','SYSTEM')
      formData.append('updatedBy','SYSTEM')


      if (newPassword) {
       /// userObject.password = newPassword
        formData.append('password',newPassword)
      }


      setIsLoading(true);

      bidShushi.updateUser(user.id, formData)
        .then((res) => {
         // console.log(res);
          setUserResponse(res);
          setIsLoading(false);
        let user=  JSON.parse(localStorage.getItem('user'));
          user={
            ...user,
            fullName:firstName + ' ' + lastName,
            avatar:res.avatar,   
          }
          localStorage.setItem('user', JSON.stringify(user));
          dispatch({ type: LOGIN_ACTION, payload: user }); 
          if (res && res.avatar && res.avatar != 'null') {
            let url = avatarURL + res.avatar
            setAvatar(res.avatar);
            setAvatarPreview(url);
          }
          api.success({
            message: `Success`,
            description: BIDSUSHI_TEXT.profileUpdated,
            placement: 'topRight'
          })
        }).catch((err) => {
          setIsLoading(false)
          api.error({
            message: `Error`,
            description: 'Error in updating the Profile.',
            placement: 'topRight'
          })
          console.log(err)
        })
      setCanShowDialogLeavingPage(false)
    }
    else {
      checkForError()
    }
  }
  const imgBeforeUpload = (file, type) => {
    let size = file.size / 1024 / 1024;
    let message_error = null;

    let pictureArr = ["image/png", "image/jpg", "image/jpeg"]
    if (pictureArr.indexOf(file.type) == -1) {
      message_error = "Invalid file type. Please use Image.";

    } else if (size > 10) {
      message_error = "Profile Image Should be less than 10 MB.";
    }

    if (message_error) {
      api.error({
        message: `Failed`,
        description: message_error
      })
      return true;
    } else {
      setAvatar(file)
      setAvatarPreview((URL.createObjectURL(file)))
      return false;
    }
  };

  const imgChangeHandler = (file, type) => {
    const formData = new FormData();
    formData.append("file", file.file);
  };

  const props = {
    multiple: false,
    maxCount: 1,
  };

  function handlePaste(event) {
    event.preventDefault();
  }

  function handleCopy(event) {
    event.preventDefault();
  }




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
  }
  return (
    <>
      <DialogLeavingPage
        showDialog={showDialogLeavingPage}
        setShowDialog={setCanShowDialogLeavingPage}
        confirmNavigation={confirmNavigation}
        cancelNavigation={cancelNavigation}
      />
      <div className="ex-user-managment">
        {contextHolder}
        <Skeleton loading={isLoading} avatar active>
          <div className="user-details-box">
            <div class="wellness-wrap overview-item  green-card">
            <Upload
                {...props}
                name="avatar"

                fileList={null}
                onChange={(file) => imgChangeHandler(file, "picture")}
                beforeUpload={(file) => imgBeforeUpload(file, "picture")}
              >
                <div class="overview-card d-block">

                  <div class="w-100 text-center">
                    <img class="img-fluid user-profile-image" src={!avatarPreview ? "/images/user-circle-large.png" : avatarPreview} alt="" />
                  </div>
                  <div class="overview-card-details text-center d-block">
                    <h4>{firstName} {lastName} </h4>
                    <p className="user-email">{email}
                    </p>
                  </div>
                </div>
                
                <div className="delete-image">
                  <a><img src="/images/edit-image.png" alt="" /></a>
                </div>
                
              </Upload>
              {
            avatarPreview && typeof avatarPreview !== 'object'&& typeof avatar != 'object' &&    <div className="edit-image mr-5" style={{zIndex:100}} > 
                <button onClick={handleOpenDelete} className="profile-delete-icon">
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
                          </svg></button>
              </div>
              }
            </div>
          </div>

          <div className="user-form">
            <div class="row">
              <div className="col-lg-12 col-md-12">
                <div className="row form-wrapper p-4 bg-gray ms-4">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label>First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        tabIndex="1"
                        placeholder="Enter First Name" value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          setError((preState) => {
                            return {
                              ...preState,
                              firstName: false
                            }
                          })
                        }}
                        onBlur={(e) => onChangeHandler(e)}
                      />
                      {!firstName && error.firstName ? (
                        <span className="text-danger text-error">First Name cannot be empty.</span>
                      ) : null}
                      {firstName && error.firstName ? (
                        <span className="text-danger text-error">First Name cannot be greater than 255 characters.</span>
                      ) : null}
                    </div>
                    <div className="form-group mb-3">
                      <label>Contact Number</label>
                      <input
                        type="text"
                        name="contact"
                        onPaste={(e) => {
                          const pastedText = e.clipboardData.getData("text");
                          if (pastedText.includes("-")) {
                            e.preventDefault();
                          }
                          handlePaste(e);
                        }}
                        onCopy={handleCopy}
                        value={contact}
                        tabIndex="3"
                        onChange={(e) => {
                          setContactNumber(e.target.value);
                          setError((preState) => {
                            return {
                              ...preState,
                              contact: false
                            }
                          })
                        }}
                        onKeyPress={handleKeyPress}
                        onBlur={(e) => onChangeHandler(e)}
                        className="form-control"
                        placeholder="Enter Contact Nunber"
                      />
                      {contact && error.contact ? (
                        <span className="text-danger text-error">Contact Number must be greater than 6 digits and less than 16 digits.</span>
                      ) : null}
                    </div>

                  </div>

                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={lastName}
                        tabIndex="2"
                        onChange={(e) => {
                          setLastName(e.target.value);
                          setError((preState) => {
                            return {
                              ...preState,
                              lastName: false
                            }
                          })
                        }}
                        onBlur={(e) => onChangeHandler(e)}
                        className="form-control"
                        placeholder="Enter Last Name"
                      />
                      {!lastName && error.lastName ? (
                        <span className="text-danger text-error">Last Name cannot be empty.</span>
                      ) : null}
                      {lastName && error.lastName ? (
                        <span className="text-danger text-error">Last Name cannot be greater than 255 characters.</span>
                      ) : null}
                    </div>

                  </div>

                  <div className="col-12">
                    <hr/>
                  </div>
                  <div class="form-footer">

                    <p>Change Password? <a href="#" onClick={showPasswordModal} className="color-primary">Click here </a></p>
                    <div className="text-right">
                      <button onClick={handleCancel} class="btn btn-secondary me-3">Cancel</button>
                      <button onClick={saveUser} class="btn btn-primary px-5">Save</button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </Skeleton>
        <Modal  okText={BIDSUSHI_TEXT.Yes} cancelText={BIDSUSHI_TEXT.No} title="Change Password" open={isModalOpen} onOk={handlePasswordModalOk} onCancel={handlePasswordModalCancel}>
        <div className="form-wrapper row">
        <div className="col-12 form-group">
          <label>Current Password</label>
          <input name="currentPassword" value={currentPassword}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handlePasswordModalOk();
            }
          }}
            type="password" onChange={(e) => {
              setCurrentPassword(e.target.value);
              setPasswordError((preState) => {
                return {
                  ...preState,
                  currentPassword: false,
                };
              });
            }} onBlur={checkValidCurrentPassword} className="form-control" placeholder="Enter current password" />
          {
            !currentPassword && passwordError.currentPassword ? (
              <span className="text-danger text-error">Current Password cannot be empty.</span>
            ) : null}
          {currentPassword && passwordError.currentPassword ? (
            <span className="text-danger text-error">Current Password must be atleast 8 characters long and must have atleast 1 digit, 1 special character and 1 uppercase letter.</span>
          ) : null}
        </div>
        <div className="col-12 form-group">
          <label>New Password</label>
          <input name="newPassword" value={newPassword}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handlePasswordModalOk();
            }
          }}
            type="password" onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordError((preState) => {
                return {
                  ...preState,
                  newPassword: false,
                };
              });
            }} onBlur={checkValidPassword} className="form-control" placeholder="Enter new password" />
          {
            !newPassword && passwordError.newPassword ? (
              <span className="text-danger text-error">Password cannot be empty.</span>
            ) : null}
          {newPassword && passwordError.newPassword ? (
            <span className="text-danger text-error">Password must be atleast 8 characters long and must have atleast 1 digit, 1 special character and 1 uppercase letter.</span>
          ) : null}
        </div>
        </div>
        <div className="form-wrapper row">
        <div className="col-12 form-group">
          <label>Confirm New Password</label>
          <input name="confirmNewPassword" value={confirmNewPassword}
            type="password" onChange={(e) => {
              setConfirmNewPassword(e.target.value);
              setPasswordError((preState) => {
                return {
                  ...preState,
                  confirmNewPassword: false,
                };
              });
            }} onBlur={checkValidConfirmPassword} onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handlePasswordModalOk();
              }
            }} className="form-control" placeholder="Confirm new password" />
          {
            !confirmNewPassword && passwordError.confirmNewPassword ? (
              <span className="text-danger text-error">Please confirm your password.</span>
            ) : null}
          {confirmNewPassword && passwordError.confirmNewPassword ? (
            <span className="text-danger text-error">Password and confirm password not match.</span>
          ) : null}
        </div>
      </div>
        </Modal>
        <Modal  okText={BIDSUSHI_TEXT.Yes} cancelText={BIDSUSHI_TEXT.No} title="Confirmation Message" open={isModalOpenDelete} onOk={() => {removeAvatar() }} onCancel={handleCancelDelete}>
        <p className='confirmation-text'>Are you sure you want to delete this?</p>
      </Modal>
      </div>
    </>
  );
}
export default UserProfileForm;
