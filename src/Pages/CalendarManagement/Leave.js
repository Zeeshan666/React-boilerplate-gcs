import React, { useState, useEffect } from "react";
import moment from "moment";
import { Modal, DatePicker, Avatar, Select,notification,Skeleton,Tooltip } from "antd";
import dayjs from "dayjs";
import InfiniteScroll from "react-infinite-scroll-component";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  BACKEND_DATE_FORMAT,
  FRONTEND_DATE_FORMAT,
  avatarURL,
  EXTERNAL_ROLE
} from "../../Common";

import bidShushiText from "../../Common/Constant";
import bidShushi from "../../Services/Api/Api";
import { changeConfirmLocale } from "antd/es/modal/locale";
dayjs.extend(customParseFormat);
const { Option } = Select;
const Leave = ({tab}) => {
  const [api, contextHolder] = notification.useNotification();
  const [leaves, setLeaves] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedLeaves, setSelectedLeaves] = useState(null);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMember] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [startDate, setStartDate] = useState(
    moment().format(FRONTEND_DATE_FORMAT)
  );
  const [endDate, setEndDate] = useState(
    moment().add(1, "days").format(FRONTEND_DATE_FORMAT)
  );
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [description, setDescription] = useState(null);
  const [totalLeaves,setTotalLeaves] = useState(null);
  const [page, setPage] = useState(0);
  const [error, setError] = useState({
    startDate: false,
    endDate: false,
    description: false,
  });
  const [isDataSending,setIsDataSending]= useState(false);
  const [sortColumn, setSortColumn] = useState('Date');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedUserPop,setSelectedUserPop] = useState(null)

  useEffect(() => {
   setIsLoading(true); 
  fetchMoreData(true, sortColumn, sortDirection);
 }, [sortColumn,sortDirection,selectedUser]);

useEffect(()=>{
  users();
},[])
 const fetchMoreData = (p=false,sortColumnBy = sortColumn,  sortBy = sortDirection,) => {
  setIsLoadingData(true);
  if (p) {
    setPage(0)
    setLeaves([])
    setIsLoading(true);
  }
  bidShushi.getCalendar(p?0:page,25,2,sortColumnBy, sortBy,selectedUser?.id).then((res)=>{
    setIsLoadingData(false); 
    //console.log(res)
    if (res && res.data) {
      let modifiesDates =
        res.data &&
        res.data
          .filter((a) => a.calendarTypeId === 2)
          .map((h) => {
            return {
              formatedStartDate: moment(h.startDate).format(
                "ddd, MMM D, YYYY"
              ),
              formatedEndDate:h.endDate? moment(h.endDate).format(
                "ddd, MMM D, YYYY"
              ):null,
              sameDate:moment(h.startDate).isSame(h.endDate)?true:false,
              ...h,
            };
          }); 
      setTotalLeaves(res.totalItems)
      setLeaves((preState) => {
        return [...preState, ...modifiesDates];
      });
      setPage(p=>p+1)
    }
    setIsLoading(false);
    setIsLoadingData(false);
  }).catch(err=>{
   console.log(err)
  })
 }
  const deleteLeave = () => {
    //Api needed
    setIsLoading(true);
    setIsLoadingData(true);

    bidShushi.deleteCalendar(selectedLeaves.id).then(res=>{
      let updatedData = leaves.filter((a) => a.id !== selectedLeaves.id);
    setLeaves(updatedData);
    setIsLoading(false);
    setIsLoadingData(false);
    clearSelectedLeave();
      api.success({
        message:"Success",
        description:bidShushiText.leaveDeleted
      })
    }).catch(err=>{
      console.log(err);
    })
  };

  const clearSelectedLeave = () => {
    setSelectedLeaves(null);
    setShowDelete(false);
    setShowLeaveForm(false);
    setDescription(null);
     //setSelectedUser(null);
    setError((preState) => {
      return {
        ...preState,
        startDate: false,
        endDate: false,
        description: false,
      };
    });
  };

  const leaveToDelete = (holiday) => {
    setSelectedLeaves(holiday);
    setShowDelete(true);
  };

  const showForm = () => {
    setShowLeaveForm(true);
    setDescription(null);
    setStartDate("");
    setEndDate("");
    setSelectedLeaves(null)
    setSelectedUserPop(selectedUser);
    setError((preState) => {
      return {
        ...preState,
        startDate: false,
        endDate: false,
        description: false,
      };
    });
  };

  const disabledDate = (current) => {
    return current && current < moment(startDate, "DD-MM-YYYY");
  };

  const disabledDateStart = (current) => {
    return current && current > moment(endDate, "DD-MM-YYYY");
  };

  const onChangeStartDate = (date, dateString) => {
    if (dateString) {
      //  setCanShowDialogLeavingPage(true);
      setStartDate(dateString);
      if(!endDate){
        setEndDate(dateString);
      }
      setError((preState) => {
        return {
          ...preState,
          startDate: false,
        };
      });
    } else {
      setStartDate("");
    }
  };

  const onChangeEndDate = (date, dateString) => {
    if (dateString) {
      // setCanShowDialogLeavingPage(true);
      setEndDate(dateString);
      setError((preState) => {
        return {
          ...preState,
          endDate: false,
        };
      });
    } else {
      setEndDate("");
    }
  };

  const users = () => {
    let page, size;
    bidShushi
      .getAllUsers((page = 0), (size = -1))
      .then((res) => {
      //  console.log(res);
        if(res?.data&&res?.data?.length>0){
          setMember(res.data&&res.data.filter(a=>a.isActive==true&&a.activated==true));
        }else{
            setMember([]);
        }
      
      })
      .catch((err) => {
        console.log(err);
      });
  };


  const holidayToEdit = (holiday) => {
    if(holiday&&holiday.user){
     // setSelectedUser(holiday.user)
        setSelectedUserPop(holiday.user);
    }
    setSelectedLeaves(holiday)
    setShowLeaveForm(true);
    setStartDate( moment(holiday.startDate, BACKEND_DATE_FORMAT).format(FRONTEND_DATE_FORMAT))
    if(holiday.endDate){
      setEndDate( moment(holiday.endDate, BACKEND_DATE_FORMAT).format(FRONTEND_DATE_FORMAT));
    }else{
      setEndDate(null);
    }
    setDescription(holiday&&holiday.description)
  };



  const saveLeave = () => {
    if(startDate&&description &&endDate&&error.description==false){
      setIsDataSending(true)
      setIsLoading(true);
      setIsLoadingData(true);
      if (selectedLeaves) { 
        // setIsStageLoader(true)
        let index = leaves.findIndex((h) => h.id === selectedLeaves.id);
        const updatedData = [...leaves];
        updatedData[index] = {
          ...updatedData[index],
        //  userId:userId.id,
          startDate: moment(startDate, FRONTEND_DATE_FORMAT).format(
            BACKEND_DATE_FORMAT
          ),
          formatedStartDate: moment(startDate, FRONTEND_DATE_FORMAT).format(
            "ddd, MMM D, YYYY"
          ),
          endDate:endDate? moment(endDate, FRONTEND_DATE_FORMAT).format(
            BACKEND_DATE_FORMAT
          ):null,
          sameDate: startDate==endDate ? true : false,
          formatedEndDate:endDate? moment(endDate, FRONTEND_DATE_FORMAT).format(
            "ddd, MMM D, YYYY"
          ):null,
          description: description,
           calendarTypeId: 2
        };
        bidShushi.updateCalendar(updatedData[index],selectedLeaves.id).then((res)=>{
          // setIsStageLoader(false);
          setIsLoading(false);
          setIsLoadingData(false);
          setIsDataSending(false)
          api.success({
            message:"Success",
            description:bidShushiText.leaveUpdated
          })
          setLeaves(updatedData);
        //  setSelectedLeaves(null);
          setShowLeaveForm(false);
       //   setSelectedUser(null);
          setIsDataSending(false)
        }).catch(err=>{
          setIsLoading(false);
          setIsLoadingData(false);
          console.log(err)
          setIsDataSending(false)
          api.error({
            message: `Failed`,
            description: bidShushiText.calendarEntryExist,
          })
        })
 
      } else {
        setIsLoading(true);
        setIsLoadingData(true);
        const newHoliday = {
          userId:selectedUser.id,
          startDate: moment(startDate, FRONTEND_DATE_FORMAT).format(
            BACKEND_DATE_FORMAT
          ),
          formatedStartDate: moment(startDate, FRONTEND_DATE_FORMAT).format(
            "ddd, MMM D, YYYY"
          ),
          endDate: endDate?moment(endDate, FRONTEND_DATE_FORMAT).format(
            BACKEND_DATE_FORMAT
          ):null,
          formatedEndDate: endDate? moment(endDate, FRONTEND_DATE_FORMAT).format(
            "ddd, MMM D, YYYY"
          ):null,
          sameDate:moment(startDate,FRONTEND_DATE_FORMAT).isSame(moment(endDate,FRONTEND_DATE_FORMAT))?true:false,
          description: description,
           calendarTypeId: 2
        };
        bidShushi.createCalendar(newHoliday)
        .then((res)=>{
         // setSelectedUser(null)
        //  setIsStageLoader(false);
          setLeaves([]);
          setIsLoading(false);
          setIsLoadingData(false);
          setPage(0)
          setIsDataSending(false)
          fetchMoreData(true)
         // setIsDataSending(false)
          api.success({
             message:"Success",
            description:bidShushiText.leaveAdded
          })
          setShowLeaveForm(false);
        }).catch(err=>{
          setIsLoading(false);
          setIsLoadingData(false);
          setIsDataSending(false)
          api.error({ 
            message: `Failed`,
            description: bidShushiText.calendarEntryExist,
          })
          console.log(err)
        })

      }
    }else{
      checkForError();
    }
  };

  // };
  const handleChangeManager = (newValue) => {
    let itemToPush = members.find(
      (questionOwner) => questionOwner.id == newValue
    );
    setSelectedUser(itemToPush);
  };

  const checkForError = () => {
    if (!startDate) {
      setError((preState) => {
        return {
          ...preState,
          startDate: true,
        };
      });
    }
    if (!endDate) {
      setError((preState) => {
        return {
          ...preState,
          endDate: true,
        };
      });
    }
    if (!description) {
      setError((preState) => {
        return {
          ...preState,
          description: true,
        };
      });
    }
  };

  const onChangeHandler = (e) => {
    let name = e.target.name;
    let value = e.target.value.trimStart();
    if (name === "description") {
      setDescription(value);
      if (value.length < 255 && value.length > 2) {
        setError((preState) => {
          return {
            ...preState,
            description: value ? false : true,
          };
        });
      } else {
        setError((preState) => {
          return {
            ...preState,
            description: true,
          };
        });
      }
    }
  };

  const sortingFunction = (column) => {
    if (sortColumn === column) {
      // Reverse the sort direction if the same column is clicked again
      setSortDirection(sortDirection === 'asc' ?  'desc' :  'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <div>
      {/* when no data start*/}
      {/* when no data end*/}
       
      <Modal
        title={bidShushiText.confirmation}
        open={showDelete}
        onOk={deleteLeave}
        onCancel={clearSelectedLeave}
        okText={bidShushiText.Yes}
        cancelText={bidShushiText.No}
      >
        <p className="confirmation-text">
        {bidShushiText.deletingLeave}{" "}
        </p>
      </Modal>
      {contextHolder}
      <div className="tab-content">
        <div className="user-list">
          <div className={tab==='leave'?"row form-wrapper top-section leave":"row form-wrapper top-section"}>
            <div className="col-3 form-group ">
              <label className="color-light-gray">
                Please select team member to add leaves
              </label>
              <div className="form-group search-group leave-mngmnt-dropdown">
                <Select
                  showSearch
                  placeholder="Search..."
                  value={selectedUser?.id || null}
                  //labelInValue={true}
                  className="form-select"
                  onChange={(v) => handleChangeManager(v)}
                  //labelInValue={true}
                  allowClear
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
                  {members &&
                    members.map((item) => (
                      <Option
                        key={item.id}
                        value={item.id}
                        label={item.fullName}
                      >
                        <div>
                          <div className="custom-select-dropdown">
                            <Avatar
                              src={
                                item?.avatar != "null" && item?.avatar
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
                              <label className="email-label text-ellipse">
                                {item.fullName} </label>
                                  {item.userRole?.name == EXTERNAL_ROLE ? (
                          <span className="tag tag-blue mx-1">External </span>
                        ) : (
                          ""
                        )}<br/>
                              
                                <small>{item.email}</small>
                              
                            </div>
                          </div>
                        </div>
                      </Option>
                    ))}
                </Select>
                {/* <i className="fa fa-search"></i> */}
              </div>
            </div>
            <div className="col-2 form-group">
              <button
                disabled={!selectedUser}
                onClick={showForm}
                className="btn btn-success mb-2"
              >
                <i className="fa fa-plus-square-o me-2 font-18 align-middle leave"></i>{" "}
                Add Leaves
              </button>
            </div>
          </div>
          {!leaves || leaves.length == 0 && !isLoading && !isLoadingData && !isDataSending? (
        <div class="row m-0">
          <div class="no-data bg-gray border-rounded">
            <i className="fa fa-calendar no-holiday"></i>
            {
               !selectedUser?  <h3>
               You have not added any leaves yet.
               <br />
               Please search your team member and add leaves for him.
             </h3>: <h3>No leaves found for the selected team member.</h3>
            }
          
          </div>
        </div>
      ) : null}
          {!isLoading ? (
             <InfiniteScroll
             dataLength={leaves.length}
             next={fetchMoreData}
             hasMore={
               leaves.length === totalLeaves ? false : true
             }
             loader={
               <p>
                 <Skeleton loading={isLoadingData} />
               </p>
             }
           >
          <table class="table">
           {leaves&&leaves.length>0&& <thead>
              <tr>
                     <th onClick={()=>sortingFunction('Name')} className={sortColumn==='Name'&&sortDirection==="asc"?"asc-active sorting-th":sortColumn==='Name'&&sortDirection==="desc"?"desc-active sorting-th":"sorting-th"} scope="col" width="320">Holiday
                    <i className="fa fa-caret-up ms-2"></i>
                  
                    </th>
                    <th onClick={()=>sortingFunction('Date')} className={sortColumn==='Date'&&sortDirection==="asc"?"asc-active sorting-th":sortColumn==='Date'&&sortDirection==="desc"?"desc-active sorting-th":"sorting-th"} scope="col">Date
                    <i className="fa fa-caret-up ms-2"></i>
                    </th>
                <th scope="col">Actions</th>
              </tr>
            </thead>}
            <tbody>
            {leaves.map((leave, index) => (
              <>
                <tr>
                  <td scope="row">
                    <div class="user-full-name">
                      <img
                        class="header-profile-user img-fluid"
                        src="/images/leave.png"
                        alt="Header Avatar"
                      />
                      <div class=" m-2">
                        <Tooltip  color="#fff" title={leave.description}>
                        <span>{leave.description}</span>
                        </Tooltip>
                       
                      <Tooltip color="#fff" title={leave?.user?.fullName}>
                        <>
                       <div class="d-block leave-desc test">
                          <span>{leave?.user?.fullName}</span>
                          <span>{leave?.user?.userRoleId == 3 ? (
                          <span className="tag tag-blue">External </span>
                        ) : (
                          ""
                        )}</span></div>
                       
                      </>
                      </Tooltip>

                       </div>
                       
                    </div>
                  </td>
                  <td>{leave.formatedStartDate} {!leave.sameDate&&leave.formatedEndDate&&'-'} {!leave.sameDate&&leave.formatedEndDate}</td>
                  <td>
                    <div className="action-btn">
                      <Tooltip color="#fff" title="Edit">
                      <a onClick={()=>holidayToEdit(leave)}>
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
                      </a>
                       </Tooltip>
                      <Tooltip color="#fff" title="Delete">
                      <a onClick={() => leaveToDelete(leave)}>
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
                      </a>
                      </Tooltip>
                    
                    </div>
                  </td>
                </tr>
              </>
            ))}
            </tbody>
          </table> 
          </InfiniteScroll>
          ):(
            <Skeleton active avatar />
          )}
            
          <Modal
            destroyOnClose
            title={!selectedLeaves?"Add Leave":"Edit Leaves"}
            open={showLeaveForm}
            onCancel={clearSelectedLeave}
            okText={"Submit Leave"}
            onOk={saveLeave}
            okButtonProps={{disabled:isDataSending?true:false}}
          >
            <div className="row form-wrapper">
              <div className="search-group">
                <span className="bid-manager-info mb-3">
                  {selectedUserPop?.avatar != null &&
                  selectedUserPop?.avatar != "null" ? (
                    <img
                      src={avatarURL + selectedUserPop.avatar}
                      alt="BidManager"
                    />
                  ) : (
                    <img src="/images/user-circle.png" alt="BidManager" />
                  )}

                  <span className="name">
                    {selectedUserPop ? selectedUserPop?.fullName : null}
                    {selectedUserPop?.userRole?.name == EXTERNAL_ROLE||selectedUserPop?.userRoleId==3? (
                          <span className="tag tag-blue mx-2">External </span>
                        ) : (
                          ""
                        )}
                  </span>
                </span>
              </div>
              <div className="col-6 form-group">
                <label>From</label>
                <DatePicker
                  className="form-control"
                  value={
                    startDate ? dayjs(startDate, FRONTEND_DATE_FORMAT) : ""
                  }
                  format={FRONTEND_DATE_FORMAT}
                  onChange={onChangeStartDate}
                  allowClear={true}
                  disabledDate={disabledDateStart}
                  // onBlur={(e) => onChangeHandler(e)}
                />
                {!startDate && error.startDate ? (
                  <span className="text-danger text-error">
                    Start Date is required.
                  </span>
                ) : null}
              </div>
              <div className="col-6 form-group">
                <label>To</label>
                <DatePicker
                  className="form-control"
                  value={endDate ? dayjs(endDate, FRONTEND_DATE_FORMAT) : ""}
                  format={FRONTEND_DATE_FORMAT}
                  onChange={onChangeEndDate}
                  allowClear={true}
                  // onBlur={(e) => onChangeHandler(e)}
                  disabledDate={disabledDate}
                />
                {!endDate && error.endDate ? (
                  <span className="text-danger text-error">
                    End Date is required.
                  </span>
                ) : null}
              </div>
            </div>
            <div className="row form-wrapper">
              <div className="col-md-12 form-group">
                <label>Reason</label>
                <textarea
                  className="d-block w-100 text-area"
                  value={description??""}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  onBlur={(e) => onChangeHandler(e)}
                  placeholder="Enter Comment"
                  resize="false"
                  name="description"
                ></textarea>
                {description && error.description ? (
                  <span className="text-danger text-error">
                   Description must be greater than 2 characters and less than 255 characters
                  </span>
                ) : null}
                {!description && error.description ? (
                  <span className="text-danger text-error">
                    Description cannot be empty.
                  </span>
                ) : null}
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Leave;
