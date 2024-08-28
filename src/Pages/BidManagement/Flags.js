import React, { useEffect } from "react";
import { Switch, Skeleton, Modal, notification, Select, Tooltip } from "antd";
import bidShushi from "../../Services/Api/Api";
import { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import FlagForm from "./FlagForm";
import { DEFAULT_FLAG_LEVEL, DEFAULT_FLAG_STATUS } from "../../Common";
import InfiniteScroll from "react-infinite-scroll-component";
import bidShushiText from "../../Common/Constant";
const Flags = ({ bidDetail ,bidStatsMembers}) => {
  const { Option } = Select;

  const { user } = useAuthContext();

  const [api, contextHolder] = notification.useNotification();
  const [flagLevels, setFlagLevels] = useState([]);
  const [flagStatuses, setFlagStatuses] = useState([]);
  const [flags, setFlags] = useState([]);
  const [pageNumber, setPageNumeber] = useState(0);
  const [totalFlagsLength, setTotalFLagsLength] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [flagModal, setFlagModal] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [addByMe, setAddByMe] = useState(false);
  const [level, setLevel] = useState("0");
  const [status, setStatus] = useState("0");
  const [dataLoading, setDataLoading] = useState(false);
  const [isModalOpenStatus, setIsModalOpenStatus] = useState(false);
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc'); 

  useEffect(() => {
    setLoading(true);
    fetchMoreData(true, sortColumn, sortDirection)
    bidShushi
      .getFlagLevels()
      .then((res) => {
        setFlagLevels(res);
      })
      .catch((err) => console.log(err));

    bidShushi
      .getFlagStatuses()
      .then((res) => {
        setFlagStatuses(res);
      })
      .catch((err) => console.log(err));
  }, [sortColumn,sortDirection]);

  const fetchMoreData = (start = false, sortColumnBy = sortColumn,  sortBy = sortDirection) => {
    setDataLoading(true);
    if (start) {
      setPageNumeber(0)
      setFlags([])
      setLoading(true);
    }
    let size;
    bidShushi
      .getFlags(bidDetail.id, "", pageNumber, (size = 25),  sortColumnBy, sortBy)
      .then((res) => {
        setFlags((preState) => {
          return [...preState, ...res.data];
        });
        setLoading(false);
        setDataLoading(false);
        setTotalFLagsLength(res.totalItems);
        setPageNumeber((preState) => preState + 1); // bcz page starts from 0
      })
      .catch((err) => {
        setLoading(false);
        setDataLoading(false);
        console.log(err);
      });
  };

  const showModal = (flag) => {
    setSelectedFlag(flag);
    setIsModalOpen(true);
  };

  const handleOk = (flag) => {
    bidShushi.deleteFlag(flag.id).then(() => {
      let updatedFlags = flags.filter((f) => f.id !== flag.id);
      setFlags(updatedFlags);
      api.success({
        message: `Success`,
        description: bidShushiText.deletedFlag,
        placement: "topRight",
      });
    });
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setSelectedFlag(null);
    setIsModalOpen(false);
  };

  const handleCancelStatus = () => {
    setSelectedFlag(null);
    setIsModalOpenStatus(false);
  };
  
  const handleOkStatus = (flag) => {
    let data = {
      issueDetail: selectedFlag?.issueDetail,
      dateReported: selectedFlag?.dateReported,
      bidId: bidDetail.id,
      createdByUserId: selectedFlag?.createdByUserId,
      flagLevelId: selectedFlag?.flagLevel?.id,
      flagStatusId: selectedFlag?.flagStatus?.id == 2 ? 1 : 2,
      createdBy: "SYSTEM",
      updatedBy: "SYSTEM",
    };
    bidShushi
      .updateFlag(data, selectedFlag.id)
      .then((res) => {
        let index = flags.findIndex((f) => f.id === selectedFlag.id);
        const updatedFlags = [...flags];
        updatedFlags[index] = {
          ...updatedFlags[index],
          issueDetail: res.issueDetail,
          flagLevel: res.flagLevel,
          flagStatus: res.flagStatus,
          flagLevelId: res.flagLevelId,
          flagStatusId: res.flagStatusId,
        };
        api.success({
          message: `Success`,
          description: bidShushiText.flagUpdated,
          placement: "topRight",
        });
        setFlags(updatedFlags);
        handleCancelStatus();
      })
      .catch((err) => {
        console.log(err);
      });
    handleCancelStatus(false);
  };

  const showFlagModal = (flag = null) => {
    setFlagModal(true);
    setSelectedFlag(flag);
  };
  
  const showStatusModal = (flag = null) => {
    setIsModalOpenStatus(true);
    setSelectedFlag(flag);
  };

  const sortingFunction = (column) => {
    if (sortColumn === column) {
      // Reverse the sort direction if the same column is clicked again
      setSortDirection(sortDirection === 'asc' ?  'desc' : sortDirection==="desc"? " ":  'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setPageNumeber(0)
  };

  const isSavedData = (data, show, updated) => {
    ///setIsloading(true);
    if (updated) {
      let index = flags.findIndex((f) => f.id === data.id);
      const updatedFlags = [...flags];
      updatedFlags[index] = {
        ...updatedFlags[index],
        issueDetail: data.issueDetail,
        flagLevel: data.flagLevel,
        flagStatus: data.flagStatus,
        flagLevelId: data.flagLevelId,
        flagStatusId: data.flagStatusId,
      };
      api.success({
        message: `Success`,
        description: bidShushiText.flagUpdated,
        placement: "topRight",
      });
      setFlags(updatedFlags);
      setFlagModal(show);
    } else {
      const updatedFlags = [data, ...flags];
      setFlags(updatedFlags);
      api.success({
        message: `Success`,
        description: bidShushiText.flagAdded,
        placement: "topRight",
      });
      setFlagModal(show);
    }
  };

  const cancelHandler = () => {
    setSelectedFlag(null);
    setFlagModal(false);
  };

  const filterFlagData = (value, target) => {
    let query = "";
    switch (target) {
      case "add":
        setAddByMe(value);
        if (value) {
          query += `&createdByUserId=${
            user.id
          }`;
        }
        if (level > 0) {
          query += `&flagLevel=${level}`;
        }
        if (status > 0) {
          query += `&flagStatus=${status}`;
        }
        break;
      case "status":
        setStatus(value);
        if (value > 0) {
          query += `&flagStatus=${value}`;
        }
        if (level > 0) {
          query += `&flagLevel=${level}`;
        }
        if (addByMe) {
          query += `&createdByUserId=${
            user.id
          }`;
        }
        break;
      case "level":
        setLevel(value);
        if (value > 0) {
          query += `&flagLevel=${value}`;
        }
        if (status > 0) {
          query += `&flagStatus=${status}`;
        }
        if (addByMe) {
          query += `&createdByUserId=${
            user.id
          }`;
        }
        break;
    }


    setLoading(true);
    bidShushi
      .getFlags(bidDetail.id, query)
      .then((res) => {
        setFlags(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  return (
    <div>
      {contextHolder}
    
        <div className="tab-content flag-main">
          <div className="form-wrapper">
            <div className="row">
              <div className="col-12 flag-filters">
                {
                  //flags.length > 0 &&
                  (bidStatsMembers&&bidStatsMembers.bid?.bidMembers.find(
                    (member) => member.userId == user.id
                  ) || bidDetail.bidManagerId == user.id ||flags&&flags.find(a=>a.createdByUserId==user?.id)) && (
                    <div className="form-check form-check-inline form-group">
                      <input
                        checked={addByMe}
                        onChange={(e) => {
                          setAddByMe(e.target.checked);
                          filterFlagData(e.target.checked, "add");
                        }}
                        className="form-check-input"
                        type="checkbox"
                        id="check1"
                        value="option1"
                        disabled={(level==0 && status ==0)&&!flags.length && !addByMe}
                      />
                      <label
                        className="check1 text-para"
                        style={{ fontSize: "13px" }}
                        htmlFor="check1"
                      >
                        Added By Me
                      </label>
                    </div>
                  )
                }

                {
                  //flags.length > 0 &&
                  <div className="form-group d-inline-block me-3">
                    <Select
                      id="flagLevel"
                      onChange={(e) => {
                        setLevel(e);
                        filterFlagData(e, "level");
                      }}
                      className="form-select w-150"
                      defaultValue={level}
                      disabled={(level==0 && status ==0)&&!flags.length && !addByMe}
                    >
                      <Option key="0" value="0">
                        All Levels
                      </Option>
                      {flagLevels &&
                        flagLevels.map((flagLevel) => {
                          return (
                            <Option
                              key={flagLevel.id}
                              value={flagLevel.id}
                              label={flagLevel.name}
                            >
                              {flagLevel.name}
                            </Option>
                          );
                        })}
                    </Select>
                  </div>
                }

                {
                  //flags.length > 0 &&
                  <div className="form-group d-inline-block">
                    <Select
                      id="flagStatus"
                      onChange={(e) => {
                        setStatus(e);
                        filterFlagData(e, "status");
                      }}
                      className="form-select w-150"
                      defaultValue={status}
                      disabled={(level==0 && status ==0)&&!flags.length&& !addByMe}
                    >
                      <Option key="0" value="0">
                        All Status
                      </Option>
                      {flagStatuses &&
                        flagStatuses.map((flagStatus) => {
                          return (
                            <Option
                              key={flagStatus.id}
                              value={flagStatus.id}
                              label={flagStatus.name}
                            >
                              {flagStatus.name}
                            </Option>
                          );
                        })}
                    </Select>
                  </div>
                }

                {(bidStatsMembers&&bidStatsMembers.bid?.bidMembers.find(
                  (member) => member.userId == user.id &&   bidDetail && bidDetail.bidStatusId ==2)||(bidDetail.bidManagerId == user.id && bidDetail.bidStatusId !=3))&&<span className="separator"></span>}
                {(bidStatsMembers&&bidStatsMembers.bid?.bidMembers.find(
                  (member) => member.userId == user.id &&   bidDetail && bidDetail.bidStatusId ==2)||(bidDetail.bidManagerId == user.id && bidDetail.bidStatusId !=3)) && (
                  <a
                    onClick={() => {
                      setFlagModal(true);
                      setSelectedFlag(null);
                    }}
                    className="text-success text-center d-inline-block align-middle add-flag-btn"
                  >
                    <img src="/images/add-round.png" />
                    <br />
                    <span>Add Flag</span>
                  </a>
                )}
              </div>
            </div>
          </div>
          <Skeleton avatar loading={loading} className="row m-0">
          {!flags.length && (
            <div className="no-data bg-gray border-rounded">
              <img src="/images/flag.png" alt="" />
              <h3>
                { level!=0 || status !=0 || addByMe
                  ? "No result found for this search"
                  : bidShushiText.noFlagsAvailable}
              </h3>
            </div>
          )}

          {flags && flags.length > 0 && (
            <div className="table-container table-responsive user-list small-table flag-table">
              <InfiniteScroll
                dataLength={flags.length}
                next={fetchMoreData}
                hasMore={
                  flags && flags.length === totalFlagsLength ? false : true
                }
                loader={
                  <p>
                    <Skeleton loading={loading} />
                  </p>
                }
              >
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col" width="400">
                        Issue Details
                      </th>
                      <th onClick={()=>sortingFunction('date')} className={sortColumn==='date'&&sortDirection==="asc"?"asc-active sorting-th":sortColumn==='fullName'&&sortDirection==="desc"?"desc-active sorting-th":"sorting-th"} scope="col" width="230">
                        Date Reported <i className="fa fa-caret-up ms-2"></i>
                      </th>
                      <th onClick={()=>sortingFunction('level')} className={sortColumn==='level'&&sortDirection==="asc"?"asc-active sorting-th":sortColumn==='level'&&sortDirection==="desc"?"desc-active sorting-th":"sorting-th"}   scope="col" width="120">Level <i className="fa fa-caret-up ms-2"></i></th>
                      <th onClick={()=>sortingFunction('status')} className={sortColumn==='status'&&sortDirection==="asc"?"asc-active sorting-th":sortColumn==='status'&&sortDirection==="desc"?"desc-active sorting-th":"sorting-th"} scope="col">Status <i className="fa fa-caret-up ms-2"></i></th>
                      <th onClick={()=>sortingFunction('addedBy')} className={sortColumn==='addedBy'&&sortDirection==="asc"?"asc-active sorting-th":sortColumn==='addedBy'&&sortDirection==="desc"?"desc-active sorting-th":"sorting-th"} scope="col" width="320">Added By <i className="fa fa-caret-up ms-2"></i></th>
                      <th scope="col" width="100">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {flags &&
                      flags.map((flag, index) => {
                        return (
                          <tr key={flag.id}>
                            <td scope="row">
                              <Tooltip
                                placement="topLeft"
                                color="#fff"
                                title={flag.issueDetail}
                              >
                                <span className="mid-label dark-para">
                                  {flag.issueDetail}
                                </span>
                              </Tooltip>
                            </td>
                            <td>
                              <span className="text-para">
                                {" "}
                                {formatDate(flag.dateReported)}
                              </span>
                            </td>
                            <td>
                              <span
                                className={
                                  flag?.flagLevel?.name == DEFAULT_FLAG_LEVEL
                                    ? "text-amber"
                                    : "text-danger"
                                }
                              >
                                <i className="fa fa-circle small align-middle flag-level-icon"></i>{" "}
                                {flag?.flagLevel?.name}
                              </span>
                            </td>
                            <td>
                              <span className="text-para">
                                <span
                                  className={
                                    flag?.flagStatus?.name ==
                                    DEFAULT_FLAG_STATUS
                                      ? ""
                                      : "text-success"
                                  }
                                >
                                    {/* flag.flagStatus?.name=='!Unresolved'?false:true */}
                                  <Switch 
                                  disabled={bidStatsMembers&&bidStatsMembers.bid?.bidMembers.find(
                                    (member) => member.userId == user.id )&&flag?.createdByUserId == user.id && bidDetail && bidDetail.bidStatusId ==2|| bidDetail.bidManagerId == user.id && (bidDetail && bidDetail.bidStatusId ==1||bidDetail && bidDetail.bidStatusId ==2)?false:true}
                                    style={{
                                        pointerEvents:
                                          (bidDetail.bidMembers.find(
                                            (member) => member.userId == user.id && bidDetail && bidDetail.bidStatusId ==2
                                          ) || bidDetail.bidManagerId == user.id && bidDetail && bidDetail.bidStatusId ==1 )
                                            ? "cursor"
                                            : "none",
                                      }}
                                      onClick={() => showStatusModal(flag)}
                                  checked={flag?.flagStatus?.name ==
                                    DEFAULT_FLAG_STATUS?false:true} />{" "}
                                  <label className="color-green">
                                    {flag.flagStatus?.name}
                                  </label>{" "}
                                </span>
                              </span>
                            </td>

                            <td>
                              {
                                flag?.createdByUserId == user.id ? 
                                (
                                  <span className="mid-label dark-para">
                                  {flag?.user?.fullName}{" "}
                                    <span className="tag tag-primary">You</span>
                                </span>
                                ) : (
                                  <span className="mid-label text-para">
                                  {flag?.user?.fullName}{" "}
                                </span>
                                )
                              }

                            </td>
                            <td>
                              {
                                  <div className="action-btn">
                                  <Tooltip
                                    color="#fff"
                                    placement="top"
                                    title={"Edit"}
                                  >
                                    <a
                                      style={{
                                        pointerEvents:
                                          bidStatsMembers&&bidStatsMembers.bid?.bidMembers.find(
                                            (member) => member.userId == user.id &&flag?.createdByUserId == user.id && bidDetail && bidDetail.bidStatusId ==2|| bidDetail.bidManagerId == user.id && (bidDetail && bidDetail.bidStatusId ==1||bidDetail && bidDetail.bidStatusId ==2) )
                                            ? "cursor"
                                            : "none",
                                      }}
                                      onClick={() => showFlagModal(flag)}
                                      className={ bidStatsMembers&&bidStatsMembers.bid?.bidMembers.find(
                                        (member) => member.userId == user.id &&flag?.createdByUserId == user.id && bidDetail && bidDetail.bidStatusId ==2|| bidDetail.bidManagerId == user.id && (bidDetail && bidDetail.bidStatusId ==1 || bidDetail && bidDetail.bidStatusId ==2))?"":"disabled"}
                                    >
                                      <svg
                                        className="pencil"
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
                                          className="cls-1"
                                          d="M4497,624a21.77952,21.77952,0,0,0,15-15v15Z"
                                          transform="translate(-4128 -240)"
                                        />
                                        <path
                                          className="cls-1"
                                          d="M4128,609a21.65194,21.65194,0,0,0,15,15h-15Z"
                                          transform="translate(-4128 -240)"
                                        />
                                      </svg>
                                    </a>
                                  </Tooltip>

                                  <Tooltip
                                    color="#fff"
                                    placement="top"
                                    title={"Delete"}
                                  >
                                    <a
                                      style={{
                                        pointerEvents:
                                         bidStatsMembers&&bidStatsMembers.bid?.bidMembers.find(
                                          (member) => member.userId == user.id && flag?.createdByUserId == user.id && bidDetail && bidDetail.bidStatusId ==2|| bidDetail.bidManagerId == user.id && (bidDetail && bidDetail.bidStatusId ==1 || bidDetail && bidDetail.bidStatusId ==2))
                                            ? "cursor"
                                            : "none",
                                      }}
                                      onClick={() => showModal(flag)}
                                      className={bidStatsMembers&&bidStatsMembers.bid?.bidMembers.find(
                                        (member) => member.userId == user.id && flag?.createdByUserId == user.id && bidDetail && bidDetail.bidStatusId ==2|| bidDetail.bidManagerId == user.id && (bidDetail && bidDetail.bidStatusId ==1 || bidDetail && bidDetail.bidStatusId ==2))?"":"disabled"}
                                    >
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
                              }
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                {dataLoading && <Skeleton avatar active />}
              </InfiniteScroll>
            </div>
          )}
            </Skeleton>
        </div>
    
      <Modal
        okText={bidShushiText.Yes}
        cancelText={bidShushiText.No}
        title={bidShushiText.confirmation}
        open={isModalOpen}
        onOk={() => handleOk(selectedFlag)}
        onCancel={handleCancel}
      >
        <p className="confirmation-text">
           {bidShushiText.deletingflag}{" "}
        </p>
      </Modal>
      <Modal
        okText={bidShushiText.Yes}
        cancelText={bidShushiText.No}
        title={bidShushiText.confirmation}
        open={isModalOpenStatus}
        onOk={() => handleOkStatus(selectedFlag)}
        onCancel={handleCancelStatus}
      >
        <p className="confirmation-text">
         { selectedFlag?.flagStatus?.id == 2 ? bidShushiText.resolveFlag: bidShushiText.unResolveFlag}
        </p>
      </Modal>
      <Modal
        className="edit-flag-modal"
        destroyOnClose={true}
        maskClosable={true}
        open={flagModal}
        onCancel={() => cancelHandler(false)}
        okButtonProps={{ className: "d-none" }}
        cancelButtonProps={{ className: "d-none" }}
        title={selectedFlag ? "Edit Flag" : "Add Flag"}
      >
        <FlagForm
          bidDetail={bidDetail}
          flagStatuses={flagStatuses}
          flagLevels={flagLevels}
          isCancel={() => cancelHandler(false)}
          title={selectedFlag ? "Edit Flag" : "Add Flag"}
          selectedFlag={selectedFlag}
          isSaved={(data, show, updated) => isSavedData(data, show, updated)}
        />
      </Modal>
    </div>
  );
};

export default Flags;
