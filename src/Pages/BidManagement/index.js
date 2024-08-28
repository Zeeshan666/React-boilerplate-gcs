import {
  Select,
  Avatar,
  Modal,
  Tooltip,
  Skeleton,
  Tabs,
  notification,
  Checkbox,
} from "antd";
import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Details from "./Details";
import ResponseTracker from "./ResponseTracker";
import Flags from "./Flags";
import Plan from "./Plan";


import bidShushi from "../../Services/Api/Api";
import EodUpdate from "./EodUpdate";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { EXTERNAL_ROLE, EXTERNAL_TAG_TYPE, avatarURL } from "../../Common";
const { TabPane } = Tabs;
const { Option } = Select;

function BidSetup() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { bidId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get("tab");

  const [bidDetail, setBidDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [closeBidModal, setCloseBidModal] = useState(false);
  const [liveBidModal, setLiveBidModal] = useState(false);
  const [isLiveToEdit, setIsLiveToEdit] = useState(false);
  const [bidMembers, setBidMembers] = useState([]);

  //notification thing
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [teamMemberToRemove, setRemoveTeamMember] = useState("");
  const [isDeleteModal, setIsDeleteModal] = useState("");
  const [emailText, setEmailText] = useState();
  const [notificationModal, setNotificationModal] = useState(null);
  const [selectedTab, setSelectedTab] = useState("details");
  const [isPlanChange, setIsPlanChange] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [isResponseTrackerChange, setIsResponseTrackerChange] = useState(false);
  const [bidStats, setBidStats] = useState(null);
  const [emailContentError, setEmailContentError] = useState(false);
  const [canShowLive, setCanLive] = useState(false);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [isSentLive, setIsSentLive] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    bidShushi
      .getBid(bidId)
      .then((res) => {
        setIsLoading(false);
        setBidDetail(res);
        setTeamMembers(res && res.bidMembers.filter((a) => a.roleId != 3));
        setSelectedItems(res && res.bidMembers.filter((a) => a.roleId != 3));
        setIsSelectAll(true);
        setEmailText(
          ` The Bid ${res && res.name} is live now. Please <a href=${
            window.location.href
          }>click here</a> to visit the details`
        );
        if (tab) {
          setSelectedTab(tab);
        } else {
          setSelectedTab("details");
        }
      })
      .catch((err) => {
        if (err?.code == 400 || err?.code == 404) {
          navigate("404");
        }
        if (err?.code == 403) {
          navigate("/");
        }
      });

    bidShushi
      .getAllBidManagers()
      .then((res) => {
        setBidMembers(
          res &&
            res.data.map((a) => {
              return {
                ...a,
                userId: a.id,
              };
            })
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const getALLStats = () => {
    bidShushi
      .getDetailOfBid(bidId)
      .then((res) => {
        setBidStats(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    canShowBidPlan();
    getALLStats();
  }, [selectedTab]);

  const handleChange = (value) => {
    //remove selected
    let itemToPush = teamMembers.find(
      (teamMember) => teamMember.id === value[0]
    );
    //  itemToPush.userId = value[0];
    setSelectedItems((preState) => {
      return [...preState, itemToPush];
    });
  };

  const handlePlanChange = (newValue) => {
    setIsPlanChange(newValue);
    //  setCanShowDialogLeavingPage(true)
  };

  const handleResponseTrackerChange = (newValue) => {
    setIsResponseTrackerChange(newValue);
    //  setCanShowDialogLeavingPage(true)
  };

  const updateLive = (data) => {
    setCanLive(data);
  };

  const deleteUser = (user) => {
    let updatedUsers = selectedItems.filter((u) => u !== user);
    setSelectedItems(updatedUsers);
  };

  const showDeleteModal = (item) => {
    setRemoveTeamMember(item);
    setIsDeleteModal(true);
  };

  const handleOk = (teamMemberToRemove) => {
    deleteUser(teamMemberToRemove);
    setIsSelectAll(false);
    setIsDeleteModal(false);
  };

  const handleCancel = () => {
    setIsDeleteModal(false);
  };

  const closeBidCall = () => {
    bidShushi
      .closeBid(bidId)
      .then((res) => {
        setCloseBidModal(false);
        setBidDetail((preState) => {
          return {
            ...preState,
            bidStatus: { id: 3, name: "CLOSED", isActive: true },
            bidStatusId: "3",
          };
        });
        api.success({
          message: "Success",
          description: "Bid has been closed successfully.",
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const liveBidCall = () => {
    //  if(selectedItems&&selectedItems.length==0&&removeHtmlTagsAndWhitespace(emailText).length>0){
    //     notification.error({
    //       message:"Failed",
    //       description:"Please add team member to proceed to go live."
    //     });
    //     return;
    //  }

    if (
      selectedItems &&
      selectedItems.length > 0 &&
      removeHtmlTagsAndWhitespace(emailText).length == 0
    ) {
      notification.error({
        message: "Failed",
        description: "Please enter notification content to proceed to go live",
      });
      return;
    } else if (
      (emailText != "" && selectedItems.length == 0) ||
      (emailText && selectedItems.length > 0)
    ) {
      setIsSentLive(true);
      const data = {
        emailContent: emailText,
        userIds: selectedItems && selectedItems.map((a) => a.userId),
      };
      setIsSentLive(true);
      bidShushi
        .liveBid(data, bidId)
        .then((res) => {
          setLiveBidModal(false);
          setBidDetail((preState) => {
            return {
              ...preState,
              bidStatus: { id: 2, name: "LIVE", isActive: true },
              bidStatusId: "2",
            };
          });
          setIsSentLive(false);
          //  setSelectedItems([]);
          setNotificationModal(false);
          api.success({
            message: "Success",
            description: `The Bid has been live successfully.`,
          });
        })
        .catch((err) => {
          console.log(err);
          api.error({
            message: "failed",
            description: `${err.message}`,
          });
        });
    }
  };

  const liveToDraft = () => {
    bidShushi
      .liveBid(bidId)
      .then((res) => {
        setIsLiveToEdit(false);
        setBidDetail((preState) => {
          return {
            ...preState,
            bidStatus: { id: 1, name: "DRAFT", isActive: true },
            bidStatusId: "1",
          };
        });
        setSelectedItems([]);
        setNotificationModal(false);
        // api.success({
        //   message: "Success",
        //   description: "Bid has been Live successfully.",
        // });
      })
      .catch((err) => {
        setIsLiveToEdit(false);
        console.log(err);
      });
  };

  const cancelLiveBidModal = () => {
    // setSelectedItems([]);
    setNotificationModal(false);
  };

  const handleChangeManager = (data) => {
    setBidDetail((preState) => {
      return {
        ...preState,
        bidManager: data,
        bidManagerId: data?.userId,
      };
    });
  };

  const canShowBidPlan = () => {
    bidShushi
      .getShowBid(bidId)
      .then((res) => {
        //console.log(res);
        setCanLive(res);
        //}
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // function removeHtmlTags(str) {
  //   const doc = new DOMParser().parseFromString(str, 'text/html');
  //   return doc.body.textContent || '';
  // }

  function removeHtmlTagsAndWhitespace(str) {
    return str.replace(/<[^>]+>|[\s]+|<p><\/p>/g, "");
  }

  const removeAllMembers = () => {
    setSelectedItems([]);
  };

  const selectAllTeamMembers = () => {
    setSelectedItems(teamMembers);
  };

  const onChangeSelectAll = (e) => {
    setIsSelectAll(e.target.checked);
    if (e.target.checked) {
      selectAllTeamMembers();
    } else {
      removeAllMembers();
    }
  };

  return (
    <>
      {!isLoading && (
        <div className="row title-bar">
          <div className="col-6">
            {contextHolder}
            <h2 className="secondary-heading mt-2">
              <Tooltip color="#fff" title={bidDetail?.name}>
                {bidDetail?.name}{" "}
              </Tooltip>

              {bidDetail && bidDetail.bidStatusId == 1 && (
                <span className="tag tag-blue tag-big ms-1 align-middle">
                  Draft
                </span>
              )}
              {bidDetail && bidDetail.bidStatusId == 2 && (
                <span className="tag tag-primary tag-big ms-1 align-middle">
                  Live
                </span>
              )}
              {bidDetail && bidDetail.bidStatusId == 3 && (
                <span className="tag tag-gray tag-big ms-1 align-middle">
                  Closed
                </span>
              )}
            </h2>
          </div>

          {bidDetail &&
            bidDetail.bidStatusId != 3 &&
            user.id == bidDetail?.bidManagerId && (
              <div className="col-6 text-end">
                <a
                  onClick={() => setCloseBidModal(true)}
                  className="btn btn-secondary-border"
                >
                  <img src="/images/close-icon.png" width="17px" /> Close Bid
                </a>

                {bidDetail &&
                  bidDetail.bidStatusId != 2 &&
                  user.id == bidDetail?.bidManagerId &&
                  bidDetail.bidStatusId != 3 && (
                    <>
                      {" "}
                      <span className="separator"></span>
                      <a
                        onClick={() => {
                          setNotificationModal(true);
                          setSelectedItems(
                            bidDetail &&
                              bidDetail.bidMembers.filter((a) => a.roleId != 3)
                          );
                          setIsSelectAll(true);
                        }}
                        className={
                          canShowLive
                            ? "btn btn-primary"
                            : "btn btn-primary disabled"
                        }
                      >
                        <img src="/images/live-icon.png" /> Go Live
                      </a>
                    </>
                  )}
              </div>
            )}

          <div className="col-12">
            <hr />
          </div>
        </div>
      )}

      <div className="row">
        <Skeleton loading={isLoading} avatar active>
          <div className="col-12">
            <Tabs
              onChange={(key) => setSelectedTab(key)}
              activeKey={selectedTab}
              className="bid-manage-tab"
            >
              <TabPane
                tab={
                  <>
                    {" "}
                    <div className="tab-header">Bid Details</div>{" "}
                  </>
                }
                key="details"
              >
                <Details
                  tab={selectedTab}
                  bidDetail={bidDetail}
                  getBidStats={bidStats}
                  bidManagers={bidMembers}
                  setHandleChangeManager={handleChangeManager}
                />
              </TabPane>

              <TabPane
                tab={
                  <>
                    {" "}
                    <div className="tab-header">
                      {" "}
                      {isPlanChange && <i class="fa fa-asterisk"></i>}Bid Plan
                    </div>{" "}
                  </>
                }
                key="plan"
              >
                <div className="tab-content">
                  <Plan
                    updateLive={updateLive}
                    bidDetail={bidDetail}
                    setPlanChange={handlePlanChange}
                    bidStatsMembers={bidStats}
                  />
                </div>
              </TabPane>

              <TabPane
                tab={
                  <>
                    {" "}
                    <div className="tab-header">
                      {" "}
                      {isResponseTrackerChange && (
                        <i class="fa fa-asterisk"></i>
                      )}{" "}
                      Response Tracker
                    </div>{" "}
                  </>
                }
                key="response-tracker"
              >
                <ResponseTracker
                  bidStatsMembers={bidStats}
                  bidDetail={bidDetail}
                  tab={selectedTab}
                  setResponseTrackerChange={handleResponseTrackerChange}
                />
              </TabPane>

              <TabPane
                tab={
                  <>
                    {" "}
                    <div className="tab-header">EoD Update</div>{" "}
                  </>
                }
                key="eod-update"
              >
                <EodUpdate bidDetail={bidDetail} tab={selectedTab} />
                {/* </div> */}
              </TabPane>

              <TabPane
                tab={
                  <>
                    {" "}
                    <div className="tab-header">Flags</div>{" "}
                  </>
                }
                key="flags"
              >
                <Flags bidStatsMembers={bidStats} bidDetail={bidDetail} />
              </TabPane>
            </Tabs>
          </div>
        </Skeleton>
      </div>

      <Modal
        okText={"Yes"}
        cancelText={"No"}
        title="Confirmation for Close"
        open={closeBidModal}
        onOk={() => closeBidCall()}
        onCancel={() => setCloseBidModal(false)}
        destroyOnClose
        maskClosable={true}
      >
        <p className="text-para">This action can not be reversed </p>
        <p className="confirmation-text mt-3">
          Are you sure you want to proceed?
        </p>
      </Modal>
      <Modal
        okText={"Yes"}
        cancelText={"No"}
        title="Confirmation Message"
        open={isLiveToEdit}
        onOk={() => liveToDraft()}
        onCancel={() => setIsLiveToEdit(false)}
        destroyOnClose
        maskClosable={true}
      >
        <p className="text-para">
          This Bid is currently live. if you edit it will move the bid to a
          "Draft" status?
        </p>
        <p className="confirmation-text">Are you sure you want to proceed?</p>
      </Modal>
      <Modal
        title="Notification to Team Members"
        className="notification-popup"
        open={notificationModal}
        // onOk={() => liveBidCall()}
        onCancel={() => cancelLiveBidModal(false)}
        okText="Go Live"
        destroyOnClose
        maskClosable={true}
        footer={[
          <button
            className="btn btn-secondary-border px-3 m-2"
            key="cancel"
            onClick={() => cancelLiveBidModal(false)}
          >
            Cancel
          </button>,
          <button
            disabled={isSentLive}
            className="btn ml-1 btn-primary"
            key="ok"
            type="primary"
            onClick={liveBidCall}
          >
            <img src="/images/live-icon.png" alt="OK" />
            Go Live
          </button>,
        ]}
      >
        <div className="row form-wrapper mt-n2">
          <div className="col-12">
            <div className="form-group search-group">
              <label>Add/Remove team member from notification list</label>

              {/* <Checkbox checked={isSelectAll} onChange={(e)=>onChangeSelectAll(e)} >{isSelectAll?"Remove All":"Select All"}
                  </Checkbox>
              <Select
                placeholder="Search and Add Team Members"
                mode="multiple"
                value={[]}
                //labelInValue={true}
                className="custom-select-wrap"
                showSearch
                onChange={(v) => handleChange(v)}
                notFoundContent={
                  <p
                    className="font-weight-bold text--center mb-0 "
                    style={{ color: "#7a7a7a" }}
                  >
                    Sorry! No Team member found
                  </p>
                }
                style={{
                  width: "100%",
                }}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {teamMembers.map((item) => (
                  <Option
                    key={item.id}
                    value={item.id}
                    label={item.fullName}
                    disabled={selectedItems.some(
                      (a) => a.userId == item.userId
                    )}
                  >
                    <div style={{ pointerEvents: "none", cursor: "none" }}>
                      <div className="custom-select-dropdown">
                        <Avatar
                          src={
                            item?.avatar != null && item?.avatar != "null"
                              ? avatarURL + item?.avatar
                              : "/images/user-circle.png"
                          }
                        ></Avatar>{" "}
                        <div
                          style={{
                            flex: 3,
                            pointerEvents: "none",
                            cursor: "none",
                          }}
                        >
                          <label className="mid-label">{item.fullName}</label>
                          {item.role?.name == EXTERNAL_ROLE ? (
                            <span className="tag tag-blue">External </span>
                          ) : (
                            ""
                          )}
                          <p className="user-email">{item.email}</p>
                        </div>
                        {!selectedItems.some(
                          (a) => a.userId == item.userId
                        ) && (
                          <a
                            style={{ pointerEvents: "auto" }}
                            class="btn btn-bordered btn-small me-2"
                          >
                            Add
                          </a>
                        )}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
              <i className="fa fa-search team-member-icon"></i> */}

              <div class="">
                <div style={{ flex: 3, position: "relative" }}>
                  <Select
                    placeholder="Search and Add Team Members"
                    mode="multiple"
                    value={[]}
                    className="custom-select-wrap"
                    showSearch
                    onChange={(v) => handleChange(v)}
                    notFoundContent={
                      <p
                        className="font-weight-bold text--center mb-0 "
                        style={{ color: "#7a7a7a" }}
                      >
                        Sorry! No Team member found
                      </p>
                    }
                    style={{
                      width: "100%",
                    }}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {teamMembers.filter(a=>a?.user?.isDeleted==0).map((item) => (
                      <Option
                        key={item.id}
                        value={item.id}
                        label={item?.user?.fullName}
                        disabled={selectedItems.some(
                          (a) => a.userId == item.userId
                        )}
                      >
                        <div style={{ pointerEvents: "none", cursor: "none" }}>
                          <div className="custom-select-dropdown">
                            <Avatar
                              src={
                                item?.user?.avatar != null && item?.user?.avatar != "null"
                                  ? avatarURL + item?.user?.avatar
                                  : "/images/user-circle.png"
                              }
                            ></Avatar>{" "}
                            <div
                              style={{
                                flex: 3,
                                pointerEvents: "none",
                                cursor: "none",
                              }}
                            >
                              <label className="mid-label">
                                {item?.user?.fullName}
                              </label>
                              {item?.user?.userRole?.name == EXTERNAL_ROLE ? (
                                <span className="tag tag-blue">External </span>
                              ) : (
                                ""
                              )}
                              <p className="user-email">{item?.user?.email}</p>
                            </div>
                            {!selectedItems.some(
                              (a) => a.userId == item.userId
                            ) && (
                              <a
                                style={{ pointerEvents: "auto" }}
                                class="btn btn-bordered btn-small me-2"
                              >
                                Add
                              </a>
                            )}
                          </div>
                        </div>
                      </Option>
                    ))}
                  </Select>
                  <i className="fa fa-search team-member-icon"></i>
                </div>

                <div style={{ flex: 1 }} className="remove-all-checkbox">
                  <Checkbox
                    checked={isSelectAll}
                    onChange={(e) => onChangeSelectAll(e)}
                  >
                    {isSelectAll ? "Remove All" : "Select All"}
                  </Checkbox>
                </div>
              </div>
            </div>
          </div>
          <div className="row team-member-list">
            {selectedItems &&
              selectedItems.length > 0 &&
              selectedItems.filter(a=>a?.user?.isDeleted==0).map((item, ind) => {
                return (
                  <div className="team-list-item" key={ind}>
                    <div className="user-thumb">
                      {item?.user?.avatar != null &&
                      item?.user?.avatar != "null" &&
                      item?.user?.avatar ? (
                        <img
                          src={avatarURL + item?.user?.avatar}
                          alt="Header Avatar"
                        />
                      ) : (
                        <img
                          class="header-profile-user img-fluid"
                          src="/images/user-circle.png"
                          alt="Header Avatar"
                        />
                      )}
                    </div>
                    <div className="user-info">
                      <h3 className="user-name text-ellipse">
                        {item?.user?.fullName}{" "}
                        </h3>
                        {item?.user?.userRole?.name === EXTERNAL_ROLE ? (
                          <span className="tag tag-blue mx-1">External </span>
                        ) : (
                          ""
                        )}
                      
                      <span className="user-email">{item?.user?.email}</span>
                    </div>
                    {/* <a href="#" className="delete-list"><i className="fa fa-trash"></i> </a> */}
                    <a
                      onClick={() => {
                        showDeleteModal(item);
                      }}
                      className="delete-list"
                    >
                      <Tooltip placement="top" color="#fff" title="Delete">
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
                    </a>
                  </div>
                );
              })}
          </div>
          {!selectedItems.length && (
            <div className="row m-0">
              <div className="no-data mt-n3 mb-4 small-no-data bg-gray border-rounded">
                <img src="/images/user-thumb.png" alt="" />
                <h3>
                  You have not added any Team Member yet
                  <br />
                  Please Search your Team Member and add here.
                </h3>
              </div>
            </div>
          )}
          <div className="col-12 form-group">
            {/* <textarea
              className="form-control mt-2"
              rows="5"
              placeholder="Enter Content for Go Live Notification"
              name="questionText"
              value={emailText}
              onChange={(e) => {
                setEmailText(e.target.value);
              }}
            ></textarea> */}
            <ReactQuill
              className="form-control"
              value={emailText}
              onChange={(value) => setEmailText(value)}
              modules={{ toolbar: null }}
              placeholder="Enter Content for Go Live Notification"
            />

            {!emailText && emailContentError ? (
              <span className="text-danger text-error">
                Email content cannot be empty.
              </span>
            ) : null}
          </div>
          <div className="col-12">
            <hr className="mb-0" />
          </div>
        </div>
      </Modal>
      <Modal
        okText={"Yes"}
        cancelText={"No"}
        title="Confirmation Message"
        open={isDeleteModal}
        destroyOnClose
        onOk={() => {
          handleOk(teamMemberToRemove);
        }}
        onCancel={handleCancel}
        maskClosable
      >
        <p className="confirmation-text">
          Are you sure you want to delete this team member?{" "}
        </p>
      </Modal>
    </>
  );
}

export default BidSetup;
