import { Typography, Skeleton } from "antd";
import { React, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Switch, Button, notification, Modal,Select} from "antd";
import bidShushi from "../../Services/Api/Api";
import RoutesConstant from "../../Routes/Constant";
import DialogLeavingPage from "../../hooks/leave";
import { useNavigatingAway } from "../../hooks/navigateaway";
import {
  EXTERNAL_ROLE,
  EXTERNAL_TAG_TYPE,
  USER_EMAIL_REGEX,
  DEFAULT_USER_SKILL_SELECTED,
  USER_SKILL_Expert
} from "../../Common";
import BIDSUSHI_TEXT from "../../Common/Constant";
const { Option } = Select;
const Form = () => {
  const navigate = useNavigate();
  const { externalUserId } = useParams();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContactNumber] = useState("");
  const [organization, setOrganization] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [userRole, setUserRole] = useState("");
  const [api, contextHolder] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpenSkill, setisModalOpenSkill] = useState(false);
  const [selectedSkill,setSelectedSkill] = useState(null);
  const [userSkill, setUserSkill] = useState('')
  const [userSkills, setUserSkills] = useState([]);

  const [canShowDialogLeavingPage, setCanShowDialogLeavingPage] =
    useState(false);
  const [showDialogLeavingPage, confirmNavigation, cancelNavigation] =
    useNavigatingAway(canShowDialogLeavingPage);

  const [error, setError] = useState({
    firstName: false,
    lastName: false,
    email: false,
    contact: false,
    organization: false,
    jobTitle: false,
  });

  useEffect(() => {
    if (externalUserId) {
      setIsLoading(true);
      bidShushi
        .getUserById(externalUserId)
        .then((res) => {
          console.log(res);
          setIsLoading(false);
          setFirstName(res && res.firstName);
          setLastName(res && res.lastName);
          setEmail(res && res.email);
          setUserSkill(res && parseInt(res.userSkillId))
          setContactNumber(res && res.contact);
          setOrganization(res && res.organization);
          setJobTitle(res && res.jobTitle);
          setCanShowDialogLeavingPage(false);
        })
        .catch(err => {
          if (err?.code == 400 || err?.code == 404) {
              navigate('404')
          }
      })
    }
    getRoleData();
    getUserSkill();
  }, []);

 const getUserSkill=()=>{
    bidShushi
    .getUserSkill()
    .then((res) => {
      setUserSkills(res)
      if (!externalUserId) {
        setUserSkill(res && res.find(r => r.name == DEFAULT_USER_SKILL_SELECTED)?.id)
      }
    })
    .catch((err) => {
      console.log(err);
    });
  }
  const getRoleData = () => {
    bidShushi
      .getUserRole()
      .then((res) => {
        let externalUserRole = res && res.find((r) => r.name == EXTERNAL_ROLE);
        setUserRole(externalUserRole);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onChangeHandlerSelect = (name, value) => {
    if (name === "userSkill") {
      setCanShowDialogLeavingPage(true)
      setUserSkill(value);
      if (value == 0) {
        setError((preState) => {
          return {
            ...preState,
            userSkill: true,
          };
        });
      } else {
        setError((preState) => {
          return {
            ...preState,
            userSkill: false,
          };
        });
      }
    }
  }
  const setClearStates = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setContactNumber("");
    setOrganization("");
    setJobTitle("");
  };

  const handleKeyPress = (event) => {
    const keyCode = event.keyCode || event.which;
    const keyValue = String.fromCharCode(keyCode);
    const regex = /[0-9+-]|\./; // Allow only numbers and "-"

    if (!regex.test(keyValue)) {
      event.preventDefault();
    }
  };


  const onChangeHandler = (e) => {
    let name = e.target.name;
    let value = e.target.value.trimStart();
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
      else if (value.length >= 255) {
        setError((preState) => {
          return {
            ...preState,
            firstName: true,
          };
        });
      } else {
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
      else if (value.length >= 255) {
        setError((preState) => {
          return {
            ...preState,
            lastName: true,
          };
        });
      } else {
        setError((preState) => {
          return {
            ...preState,
            lastName: false,
          };
        });
      }
    }
    if (name === "email") {
      setEmail(value);
      if (value.length == 0) {
        setError((preState) => {
          return {
            ...preState,
            email: true,
          };
        });
      } else {
        let re = USER_EMAIL_REGEX;
        if (re.test(value)) {
          setError((preState) => {
            return {
              ...preState,
              email: false,
            };
          });
        } else {
          setError((preState) => {
            return {
              ...preState,
              email: true,
            };
          });
        }
      }
    }
    if (name === "contact") {
      setContactNumber(value);
      if (value&&(value.length<7 ||value.length > 15)) {
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

    if (name === "organization") {
      setOrganization(value);
      if (value.length >= 255) {
        setError((preState) => {
          return {
            ...preState,
            organization: true,
          };
        });
      }
      else {
        setError((preState) => {
          return {
            ...preState,
            organization: false,
          };
        });
      }
    }

    if (name === "jobTitle") {
      setJobTitle(value);
        if (value.length >= 255) {
          setError((preState) => {
            return {
              ...preState,
              jobTitle: true,
            };
          });
        }
        else {
          setError((preState) => {
            return {
              ...preState,
              jobTitle: false,
            };
          });
        }
      }
  }

  const handleCancel = () => {
    setCanShowDialogLeavingPage(true);
    navigate(RoutesConstant.externalUserManagement);
  };

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
  };

  const saveExternalUser = () => {
    console.log(error);
    if (
      firstName &&
      lastName &&
      email &&
      // && (!(questionsStages.some((element) => element.isChecked ? (element.assign_to === null || element.wc_equiv == null || element.wc_equiv === '') : '')))
      Object.values(error).every((value) => value === false)
    ) {
      const smeObject = {
        firstName: firstName,
        lastName: lastName,
        fullName: firstName + " " + lastName,
        contact: contact,
        userRoleId: userRole.id.toString(),
        email: email.toLowerCase(),
        jobTitle: jobTitle,
        userSkillId: userSkill.toString(),
        organization: organization,
        createdBy: "SYSTEM",
        updatedBy: "SYSTEM",
      };

      setIsLoading(true);

      if (externalUserId) {
        bidShushi
          .updateUser(externalUserId, smeObject)
          .then((res) => {
            setIsLoading(false);
            api.success({
              message: `Success`,
              description:BIDSUSHI_TEXT.externalUserUpdated,
              placement: 'topRight'
            })
            navigate(RoutesConstant.externalUserFormEdit.replace(':externalUserId', externalUserId))
          }).catch((err) => {
            setIsLoading(false)
            api.error({
              message: `Error`,
              description: err.message,
              placement: "topRight",
            });
            console.log(err);
          });
      } else {
        bidShushi
          .createUser(smeObject)
          .then((res) => {
            setIsLoading(false);
            api.success({
              message: `Success`,
              description: BIDSUSHI_TEXT.externalUserAdded,
              placement: "topRight",
            });

          //  setClearStates()
          navigate(RoutesConstant.externalUserFormEdit.replace(':externalUserId', res.id))
          }).catch((err) => {
            setIsLoading(false)
            api.error({
              message: `Error`,
              description: err.message,
              placement: "topRight",
            });
            console.log(err);
          });
      }
      setCanShowDialogLeavingPage(false);
      // SEND API TO THE BACKEND
    } else {
      checkForError();
    }
  };

  function handleCopy(event) {
    event.preventDefault();
  }
  function handlePaste(event) {
    event.preventDefault();
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
              <div class="overview-card d-block">
                <div class="w-100 text-center">
                  <img
                    class="img-fluid user-profile-image"
                    src="/images/user-circle-large.png"
                    alt=""
                  />
                </div>
                <div class="overview-card-details text-center d-block">
                  <h4>
                    {firstName} {lastName}
                  </h4>
                  <p className="user-email">{email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="user-form">
            <div class="row">
              <div className="col-lg-12 col-md-12">
                <div className="form-wrapper p-4 bg-gray ms-4">
                  <div className="row">
                    <div className="col-6">
                      <div className="form-group mb-3">
                        <label>First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="firstName"
                          placeholder="Enter First Name"
                          value={firstName}
                          tabIndex="1"
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            setError((preState) => {
                              return {
                                ...preState,
                                firstName: false,
                              };
                            });
                          }}
                          onBlur={(e) => onChangeHandler(e)}
                        />
                        {!firstName && error.firstName ? (
                          <span className="text-danger text-error">
                            First Name cannot be empty.
                          </span>
                        ) : null}
                        {firstName && error.firstName ? (
                          <span className="text-danger text-error">
                            First Name cannot be greater than 255 characters.
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="col-6">
                    <div className="form-group mb-3">
                        <label>Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          tabIndex="2"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            setError((preState) => {
                              return {
                                ...preState,
                                lastName: false,
                              };
                            });
                          }}
                          onBlur={(e) => onChangeHandler(e)}
                          className="form-control"
                          placeholder="Enter Last Name"
                        />
                        {!lastName && error.lastName ? (
                          <span className="text-danger text-error">
                            Last Name cannot be empty.
                          </span>
                        ) : null}
                        {lastName && error.lastName ? (
                          <span className="text-danger text-error">
                            Last Name cannot be greater than 255 characters.
                          </span>
                        ) : null}
                      </div>
                      
                    </div>
                  </div>

                  <div className="row">
                    {
                      !externalUserId&& <div className={"col-6"}>
                      <div className="form-group mb-3">
                          <label>Email Address</label>
                          <input
                            readOnly={externalUserId ? true : false}
                            type="email"
                            className="form-control"
                            placeholder="Enter Email Address"
                            tabIndex="3"
                            name="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setError((preState) => {
                                return {
                                  ...preState,
                                  email: false,
                                };
                              });
                            }}
                            onBlur={(e) => onChangeHandler(e)}
                          />
                          {!email && error.email ? (
                            <span className="text-danger text-error">
                              Email Address cannot be empty.
                            </span>
                          ) : null}
                          {email && error.email ? (
                            <span className="text-danger text-error">
                              Invalid Email Address.
                            </span>
                          ) : null}
                        </div>
                        
                      </div>
                    }
                   
                    <div className="col-6">
                    <div className="form-group mb-3">
                        <label>Contact Number</label>
                        <input
                          type="text"
                          name="contact"
                          value={contact}
                          onKeyPress={handleKeyPress}
                          onPaste={(e) => {
                            const pastedText = e.clipboardData.getData("text");
                            if (pastedText.includes("-")) {
                              e.preventDefault();
                            }
                            handlePaste(e);
                          }}
                          onCopy={handleCopy}
                          tabIndex="4"
                          onChange={(e) => {
                            setContactNumber(e.target.value);
                            setError((preState) => {
                              return {
                                ...preState,
                                contact: false,
                              };
                            });
                          }}
                          onBlur={(e) => onChangeHandler(e)}
                          className="form-control"
                          placeholder="Enter Contact Number"
                        />
                        {contact && error.contact ? (
                        <span className="text-danger text-error">
                        
                        Contact Number must be greater than 6 digits and less than 16 digits.</span>
                      ) : null}
                      </div>
                    </div>
                  {/* </div>

                  <div className="row"> */}
                    <div className="col-6">
                    <div className="form-group mb-3">
                        <label>Organization</label>
                        <input
                          type="text"
                          name="organization"
                          value={organization}
                          tabIndex="5"
                          onChange={(e) => {
                            setOrganization(e.target.value);
                            setError((preState) => {
                              return {
                                ...preState,
                                organization: false,
                              };
                            });
                          }}
                          onBlur={(e) => onChangeHandler(e)}
                          className="form-control"
                          placeholder="Enter Organization Name"
                        />
                        {organization && error.organization ? (
                        <span className="text-danger text-error">Organization cannot be greater than 255 characters.</span>
                      ) : null}
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="form-group mb-3">
                        <label>Job Title</label>
                        <input
                          type="text"
                          name="jobTitle"
                          value={jobTitle}
                          tabIndex="6"
                          onChange={(e) => {
                            setJobTitle(e.target.value);
                            setError((preState) => {
                              return {
                                ...preState,
                                jobTitle: false,
                              };
                            });
                          }}
                          onBlur={(e) => onChangeHandler(e)}
                          className="form-control"
                          placeholder="Enter Job Title"
                        />
                        {jobTitle && error.jobTitle ? (
                        <span className="text-danger text-error">Job title cannot be greater than 255 characters.</span>
                      ) : null}
                      </div>
                    </div>
                                      
                  <div className="col-6">
                    <div className="col form-group mb-3">
                      <label>Skill</label>
                      <Select
                        showSearch
                        className="form-select form-control"
                        name='userSkill'
                        optionFilterProp="children"
                        placeholder="Select User Skill"
                        tabIndex="6"
                        onChange={(e) => {
                          setUserSkill(e);      
                        }}
                        value={userSkill}
                        onBlur={() => onChangeHandlerSelect('userSkill', userSkill)}
                        notFoundContent="No User Skill found"
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }>
                        {userSkills && userSkills.map(skill => (
                          <Option key={skill.id} value={skill.id} label={skill.name}>
                            {skill.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  </div>

                  <div className="col-12">
                    <hr/>
                  </div>
                  <div
                    class="form-footer"
                    style={{ justifyContent: "flex-end" }}
                  >
                    <div className="text-right">
                      <button
                        onClick={handleCancel}
                        class="btn btn-secondary me-3"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveExternalUser}
                        class="btn btn-primary px-5"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Skeleton>
        <Modal
        okText={"Yes"}
        cancelText={"No"}
        title="Confirmation Message"
        open={isModalOpenSkill}
        onOk={()=>{
          setUserSkill(selectedSkill);
          setisModalOpenSkill(false);
          setSelectedSkill(null)
        }}
        onCancel={()=>{
          setisModalOpenSkill(false);
        }}
      >
        <p className="confirmation-text">
         Are you sure you want to change the skill of this user?{" "}
        </p>
      </Modal>
      </div>
    </>
  );
};
export default Form;