import React, { useEffect, useState } from "react";
import bidShushi from "../../Services/Api/Api";
import { Select, Avatar, Modal, Tooltip, Skeleton,Spin } from "antd";

import {
  TEAMS_ADD_ACTION,
  TEAMS_ADD_ACTION_API,
  TEAMS_DELETE_ACTION,
} from "../../Context/Actions";
import { useBidContext } from "../../hooks/useBidContext";
import { EXTERNAL_ROLE, EXTERNAL_TAG_TYPE, avatarURL } from "../../Common";
import { useNavigate, useParams } from "react-router-dom";
import BIDSUSHI_TEXT from "../../Common/Constant";

const { Option } = Select;
const Team = ({ disabled, setTeamMembersChange, loading }) => {
  const { bidId } = useParams();

  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [teamMemberToRemove, setRemoveTeamMember] = useState("");
  const [canShowDialogLeavingPage, setCanShowDialogLeavingPage] = useState(false);
  const [isTeamLoader,setIsTeamLoader] = useState(false)

  const { teams, questions, dispatch, allQuestions } = useBidContext();

  useEffect(() => {
    bidShushi
      .getAllActiveUsers()
      .then((res) => {
        let teamMembersResponse = res?.data;
        let teamMembers =
          teamMembersResponse &&
          teamMembersResponse.map((r) => {
            return {
              role: r.userRole,
              isDeleted: false,
              ...r,
            };
          });
        setTeamMembers(teamMembers);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleChange = (value) => {
    //remove selected
    let itemToPush = teamMembers.find(
      (teamMember) => teamMember.id === value[0]
    );
    itemToPush.userId = value[0];
    setTeamMembersChange(true);
    setSelectedItems((preState) => {
      return [...preState, value];
    });
    dispatch({ type: TEAMS_ADD_ACTION, payload: itemToPush });
    setCanShowDialogLeavingPage(true);
  };

  const showModal = (item) => {
    setRemoveTeamMember(item);
    let bidMember = {
      id: item.id,
      userId: item.userId,
    };
    let data = {
      bidMember,
    };
    setIsTeamLoader(true);
    bidShushi
      .isTeamMemberExist(data, bidId)
      .then((res) => {
      //  console.log(res);
        setIsTeamLoader(false);
        if (res) {
          setIsModalOpen1(true);
        } else {
          setIsModalOpen(true);
        }
      })
      .catch((err) => {
        setIsTeamLoader(false);
        console.log(err);
      });
  };

  const handleOk = (teamMemberToRemove) => {
    deleteUser(teamMemberToRemove);
    setIsModalOpen(false);
    setIsModalOpen1(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsModalOpen1(false);
  };

  const deleteUser = (user) => {
    let updatedUsers = selectedItems.filter((u) => u !== user);
    updatedUsers = teamMembers.map((a) => {
      if (a.id == user.userId) {
        a.isDeleted = true;
        return a;
      }
      return a;
    });
    setTeamMembers(updatedUsers);

    //dispatch({ type: TEAMS_ADD_ACTION_API, payload: updatedUsers })
    if (updatedUsers && updatedUsers.length == 0) {
      setCanShowDialogLeavingPage(false);
    }

    dispatch({ type: TEAMS_DELETE_ACTION, payload: user });
    setTeamMembersChange(true);
    setSelectedItems(updatedUsers);
  };

  return (
    <div>
   
      <Modal
        okText={BIDSUSHI_TEXT.Yes}
        cancelText={BIDSUSHI_TEXT.No}
        title={BIDSUSHI_TEXT.confirmation}
        open={isModalOpen}
        onOk={() => {
          handleOk(teamMemberToRemove);
        }}
        onCancel={handleCancel}
      >
        <p className="confirmation-text">
          {BIDSUSHI_TEXT.deleteTeamMember}{" "}
        </p>
      </Modal>
      <Modal
        okText={"Yes"}
        cancelText={"No"}
        title="Confirmation Message"
        open={isModalOpen1}
        onOk={() => {
          handleOk(teamMemberToRemove);
        }}
        onCancel={handleCancel}
      >
        <p className="confirmation-text color-gray mb-3">
          You have deleted a team member which is used in one of the questions.
          Proceeding this action will also remove them from the question.
        </p>
        <p className="confirmation-text">{BIDSUSHI_TEXT.wantToProceed}</p>
      </Modal>
      <div className="row form-wrapper">
        <div className="col-4">
          <div className="form-group search-group">
            <Select
              disabled={disabled}
              placeholder="Search and Add Team Members"
              mode="multiple"
              value={[]}
              //labelInValue={true}
              onChange={(v) => handleChange(v)}
              className="custom-select-wrap"
              showSearch
              notFoundContent={
                <p
                  className="font-weight-bold text--center mb-0 "
                  style={{ color: "#7a7a7a" }}
                >
                   {BIDSUSHI_TEXT.NoTeamMemberFound}
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
                  disabled={teams.some((a) => a.userId == item.id)}
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
                      {!teams.some((a) => a.userId == item.id) && (
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
            <i
              style={{ opacity: disabled ? "0.4" : "1" }}
              className="fa fa-search"
            ></i>
          </div>
        </div>
      </div>
      {/*If there is no data starts*/}
      {!teams.length && !loading && (
        <div className="row m-0">
          <div className="no-data bg-gray border-rounded">
            <img src="/images/user-thumb.png" alt="" />
            <h3>
               {BIDSUSHI_TEXT.teamMemberListing}
              <br />
               {BIDSUSHI_TEXT.teamMemberListing1}
            </h3>
          </div>
        </div>
      )}
      {loading && (
        <Skeleton avatar loading={loading} className="row m-0">
          <div className="no-data bg-gray border-rounded">
            <img src="/images/user-thumb.png" alt="" />
            <h3>
            {BIDSUSHI_TEXT.teamMemberListing}
              <br />
              {BIDSUSHI_TEXT.teamMemberListing1}
            </h3>
          </div>
        </Skeleton>
      )}
      {/*If there is no data ends*/}

      <div className="row team-member-list">
      {
        isTeamLoader&&   <div className="lds-ripple loader">
        <div></div>
      </div>
      }
        {teams &&
          teams.length > 0 &&
          teams.map((item, ind) => {
            return (
              <div className="team-list-item" key={ind}>
                <div className="user-thumb">
                  {item?.user?.avatar != null &&
                  item?.user?.avatar != "null" &&
                  item?.user?.avatar ? (
                    <img src={avatarURL + item?.user?.avatar} alt="Header Avatar" />
                  ) : (
                    <img
                      class="header-profile-user img-fluid"
                      src="/images/user-circle.png"
                      alt="Header Avatar"
                    />
                  )}
                </div>
                <div className="user-info">
                  <h3 className="user-name">
                    <Tooltip placement="top" color="#fff" title={item?.user?.fullName ||item?.fullName}>
                      {item?.user?.fullName ||item?.fullName}{" "}
                      {item?.user?.userRole?.name === EXTERNAL_ROLE||item.role?.name === EXTERNAL_ROLE ? (
                        <span className="tag tag-blue">External </span>
                      ) : (
                        ""
                      )}
                    </Tooltip>
                  </h3>
                  <span className="user-email">{item?.user?.email||item?.email}</span>
                </div>
                {/* <a href="#" className="delete-list"><i className="fa fa-trash"></i> </a> */}
                <a
                  onClick={() => {
                    showModal(item);
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
    </div>
  );
};

export default Team;
