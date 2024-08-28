import {
  Card,
  Progress,
  Skeleton,
  Tooltip,
  Select,
  Modal,
  notification,
  Avatar,
  Checkbox,
} from "antd";
import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Link, useNavigate } from "react-router-dom";
import RoutesConstant from "../../Routes/Constant";
import {
  avatarURL,
  BID_MANAGER_ROLE,
  thousandSeprator,
  EXTERNAL_ROLE,
  FRONTEND_DATE_FORMAT
} from "../../Common";
import bidShushiText from "../../Common/Constant";
import bidShushi from "../../Services/Api/Api";
import { useAuthContext } from "../../hooks/useAuthContext";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import moment from "moment";

const Index = () => {
  const navigate = useNavigate();
  const [totalBidsLength, setTotalBidsLength] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [bids, setBids] = useState([]);
  const [bidStatuses, setBidStatuses] = useState([]);
  const [bidStatus, setBidStatus] = useState("0");
  const [isChecked, setIsChecked] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setIsloading] = useState(true);
  const [lazyloading, setLazyLoading] = useState(false);
  const { user, role } = useAuthContext();
  const [isLiveToEdit, setIsLiveToEdit] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [bidsInProgress, setBidInProgress] = useState(null);
  const [bidsDueThisWeek, setBidDue] = useState(null);
  const [tasksOverDue, setTasksOverDue] = useState(null);

  ///notification things
  const [bidId, setBidId] = useState(null);
  const [bidDetail, setBidDetail] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [liveBidModal, setLiveBidModal] = useState(false);
  const [teamMemberToRemove, setRemoveTeamMember] = useState("");
  const [isDeleteModal, setIsDeleteModal] = useState("");
  const [emailText, setEmailText] = useState();
  const [notificationModal, setNotificationModal] = useState(null);
  const [emailContentError, setEmailContentError] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [liveLoader, setLiveLoader] = useState(false);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [isSentLive, setIsSentLive] = useState(false);

  const { Option } = Select;

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropogation();
  };

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

  const liveBidCall = () => {
    // if(selectedItems&&selectedItems.length==0&&removeHtmlTagsAndWhitespace(emailText).length>0){
    //    notification.error({
    //      message:"Failed",
    //      description:"Please add team member to proceed to go live."
    //    });
    //    return;
    // }

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
      const data = {
        emailContent: emailText,
        userIds: selectedItems && selectedItems.map((a) => a.userId),
      };
      setIsSentLive(true);
      bidShushi
        .liveBid(data, bidId)
        .then((res) => {
          setLiveBidModal(false);
          //  setBidDetail((preState) => {
          //    return {
          //      ...preState,
          //      bidStatus: { id: 2, name: "LIVE", isActive: true },
          //      bidStatusId: "2",
          //    };
          //  });

          setSelectedItems([]);
          setTeamMembers([]);
          let updatedBids =
            bids &&
            bids.map((a) => {
              if (a.id == bidDetail?.id) {
                return {
                  ...a,
                  bidStatus: { id: 2, name: "LIVE", isActive: true },
                  bidStatusId: "2",
                };
              } else {
                return a;
              }
            });
          setIsSentLive(false);
          setBids(updatedBids);
          setBidDetail(null);
          setNotificationModal(false);
          bidShushi
          .bidStatsDashboard()
          .then((res) => {
            console.log(res);
            setBidInProgress(res.bidsInProgress);
            setBidDue(res.bidsDueThisWeek);
            setTasksOverDue(res.tasksOverDue);
          })
          .catch((err) => {
            console.log(err);
          });
          api.success({
            message: "Success",
            description: `The Bid has been live successfully`,
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

  const cancelLiveBidModal = () => {
    // setSelectedItems([]);
    setNotificationModal(false);
  };

  function removeHtmlTagsAndWhitespace(str) {
    return str && str.replace(/<[^>]+>|[\s]+|<p><\/p>/g, "");
  }
  useEffect(() => {
    if (!user) {
      navigate(RoutesConstant.login);
    }
    bidShushi
      .getBidStatuses()
      .then((res) => {
        console.log(res);
        setBidStatuses(res);
      })
      .catch((err) => console.log(err));

    bidShushi
      .bidStatsDashboard()
      .then((res) => {
        console.log(res);
        setBidInProgress(res.bidsInProgress);
        setBidDue(res.bidsDueThisWeek);
        setTasksOverDue(res.tasksOverDue);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Perform the desired action after a delay
      console.log("Debounced action:", inputValue);
      if (inputValue) {
        console.log("Sending Api Call for input Value: ", inputValue);
        //setIsloading(true);
        setBids([]);
        setPageNumber(0);
        if (isChecked) {
          fetchMoreData(true, inputValue, user.id, bidStatus);
        } else {
          fetchMoreData(true, inputValue, "", bidStatus);
        }
      } else {
        //setIsloading(true);
        setPageNumber(0);
        setBids([]);
        if (isChecked) {
          fetchMoreData(true, inputValue, user.id, bidStatus);
        } else {
          fetchMoreData(true, inputValue, "", bidStatus);
        }
      }
    }, 500); // Adjust the delay time as needed

    // Clear the timer if the component unmounts or inputValue changes
    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleBidsCall = (event) => {
    setInputValue(event.target.value.trimStart());
  };

  const fetchMoreData = (p = false, query, mybid, status) => {
    setLazyLoading(true);
    bidShushi
      .getBids(p ? 0 : pageNumber, query, mybid, status)
      .then((res) => {
        console.log(res);
        setIsloading(false);
        setLazyLoading(false);
        setTotalBidsLength(res.totalItems);
        setPageNumber((preState) => preState + 1); // bcz page starts from 0
        if (res && res.data) {
          setBids((preBids) => {
            // Merge the previous bids with the new data
            const mergedBids = [...preBids, ...res.data];

            // Create a map to store unique bids based on their ID
            const uniqueBidsMap = new Map();
            mergedBids.forEach((bid) => {
              uniqueBidsMap.set(bid.id, bid);
            });

            // Convert the map values back to an array of unique bids
            const uniqueBids = Array.from(uniqueBidsMap.values());

            return uniqueBids;
          });
        }
      })
      .catch((err) => console.log());
  };

  const onChangeHandlerSelect = (status) => {
    //setIsloading(true)
    setBids([]);
    setPageNumber(0);
    if (isChecked) {
      fetchMoreData(true, inputValue, user.id, status);
    } else {
      fetchMoreData(true, inputValue, "", status);
    }
  };

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    //setIsloading(true);
    setBids([]);
    setPageNumber(0);
    if (isChecked) {
      fetchMoreData(true, inputValue, "", bidStatus);
    } else {
      fetchMoreData(true, inputValue, user.id, bidStatus);
    }
  };

  const liveToDraft = () => {
    bidShushi
      .draftBid(selectedBid && selectedBid.id)
      .then((res) => {
        setIsLiveToEdit(false);
        navigate(`${RoutesConstant.bidSetup}/${selectedBid && selectedBid.id}`);
        
      })
      .catch((err) => {
        setIsLiveToEdit(false);
        console.log(err);
      });
  };

  const getID = (detail) => {
    setBidDetail(detail);
    setBidId(detail?.id);
    setLiveLoader(true);
    getTeamMemberOfBid(detail);
  };

  const getTeamMemberOfBid = (detail) => {
    bidShushi
      .getTeamMember(detail?.id)
      .then((data) => {
        console.log(data);
        setNotificationModal(true);
        setEmailText(
          ` The Bid ${detail?.name} is live now. Please <a href=${window.location.href}bidmanagement/${detail?.id}>click here</a> to visit the details`
        );
        setTeamMembers(data);
        setSelectedItems(data);
        setIsSelectAll(true);
        setLiveLoader(false);
      })
      .catch((err) => {
        console.log(err);
        setLiveLoader(false);
      });
  };

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
      {contextHolder}
      <div className="row mb-4 overview-list">
        {liveLoader && (
          <div className="lds-ripple loader">
            <div></div>
          </div>
        )}
        <div className="col-md-4">
          <Card
            className="wellness-wrap overview-item  green-card"
            loading={loading}
          >
            <div className="overview-card">
              <div className="overview-card-img-wrap">
                <img
                  className="img-fluid"
                  src="/images/bidinprogress.svg"
                  alt=""
                  width="20px"
                />
              </div>
              <div className="overview-card-details">
                <h4>Bids In Progress</h4>
                <span>{bidsInProgress || "-"}</span>
              </div>
            </div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card
            className="wellness-wrap overview-item blue-card"
            loading={loading}
          >
            <div className="overview-card">
              <div className="overview-card-img-wrap">
                <img
                  className="img-fluid"
                  src="/images/bid.svg"
                  alt=""
                  width="25px"
                />
              </div>
              <div className="overview-card-details">
                <h4>Bids Due This Week</h4>
                <span>{bidsDueThisWeek || "-"}</span>
              </div>
            </div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card
            className="wellness-wrap overview-item blue-card"
            loading={loading}
          >
            <div className="overview-card">
              <div className="overview-card-img-wrap">
                <img
                  className="img-fluid"
                  src="/images/taskoverdue.svg"
                  alt=""
                  width="28px"
                />
              </div>
              <div className="overview-card-details">
                <h4>Tasks Over Due</h4>
                <span>{tasksOverDue || "-"}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card className="bg-gray border-rounded grids-wrapper">
        <Skeleton loading={loading} avatar active>
          <div className="row form-wrapper mb-2">
            <div className="col-4 form-group">
              <div className="search-group">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleBidsCall}
                  className="form-control"
                  placeholder="Search..."
                />
                <i className="fa fa-search"></i>
              </div>
            </div>
            <div className="col-8 form-group text-end">
              <div className="form-check form-check-inline me-3">
                <input
                  className="form-check-input"
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                  type="checkbox"
                  id="mybid"
                  value="mybid"
                />
                <label className="form-check-label" htmlFor="mybid">
                  {" "}
                  My Bids
                </label>
              </div>

              <div className="small-select text-start">
                <Select
                  className="form-select"
                  optionFilterProp="children"
                  placeholder="Select Bid Status"
                  onChange={(e) => {
                    setBidStatus(e);
                    onChangeHandlerSelect(e);
                  }}
                  value={bidStatus}
                  // notFoundContent="No Bid Status found"
                  // filterOption={(input, option) =>
                  //   (option?.label ?? "")
                  //     .toLowerCase()
                  //     .includes(input.toLowerCase())
                  // }
                >
                  <Option key="0" value="0" label="All">
                    All
                  </Option>
                  {bidStatuses.map((status) => (
                    <Option
                      key={status.id}
                      value={status.id}
                      label={status.name}
                    >
                      {status.name.charAt(0).toUpperCase() +
                        status.name.slice(1).toLowerCase()}
                    </Option>
                  ))}
                </Select>
              </div>
              {role == BID_MANAGER_ROLE && (
                <button
                  onClick={() => navigate("/bidsetup")}
                  className="btn btn-success ms-3 align-bottom"
                >
                  <i className="fa fa-plus-square-o me-2 font-18 align-middle"></i>{" "}
                  New Bid Plan
                </button>
              )}
            </div>
          </div>
          {bids && bids.length == 0 && !loading && !lazyloading ? (
            <div className="row m-0">
              <div className="no-data bg-gray border-rounded">
                <img src="/images/bidplan.png" alt="Bid Plan" width="60px" />
                <h3>
                  {inputValue != "" || bidStatus != "0" || isChecked
                    ? bidShushiText.noResultsFound
                    : bidShushiText.noBidsInSystem }
                </h3>
              </div>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={bids.length}
              next={() => {
                if (isChecked) {
                  fetchMoreData(false, inputValue, user.id, bidStatus);
                } else {
                  fetchMoreData(false, inputValue, "", bidStatus);
                }
              }}
              hasMore={bids.length === totalBidsLength ? false : true}
              loader={
                <p>
                  <Skeleton loading={lazyloading} />
                </p>
              }
            >
              <div className="row">
                {bids &&
                  bids.length > 0 &&
                  bids.map((bid) => {
                    return (
                      <div className="col-4 bid-info-box">
                        <Link
                          style={{ textDecoration: "none" }}
                          to={`/bidmanagement/${bid?.id}`}
                        >
                          <Card hoverable>
                            <div className="progress-bar-wrapper">
                              <div className="bid-img">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  id="Layer_1"
                                  width="25"
                                  height="25"
                                  data-name="Layer 1"
                                  viewBox="0 0 298.59877 344.01813"
                                >
                                  <defs></defs>
                                  <path
                                    className="cls-1"
                                    d="M259.4975,103.905h-17.185c-11.377-.001-22.756.091-34.132-.026-16.776-.173-28.493-11.915-28.59-28.647-.09-15.5-.021-31.001-.021-46.502V24.254c-1.559-.088-2.874-.228-4.189-.228q-64.70249-.01653-129.404-.002c-13.883.006-21.933,7.977-21.937,21.834q-.039,126.19347.002,252.389c.005,13.64,8.088,21.67,21.713,21.684,31.383.033,52.765.002,84.147.017,7.257.004,12.324,3.555,13.538,9.383,1.645,7.904-3.835,14.55-12.291,14.585-20.129.082-30.259.039-50.389.026-12.877-.009-25.763.226-38.63-.146A43.45782,43.45782,0,0,1,.2075,302.719c-.095-1.622-.182-3.247-.182-4.87Q.012,172.029.0005,46.21c-.009-17.539,6.953-31.183,22.097-40.313A38.448,38.448,0,0,1,42.02049.129Q90.217-.0045,138.41449.017c13.753-.006,27.507-.071,41.257.099a40.41512,40.41512,0,0,1,28.718,11.914q31.74448,31.36948,63.12,63.112c8.175,8.277,11.935,18.611,11.968,30.236.048,16.625.08,73.252-.007,89.877-.038,7.402-5.164,12.735-11.903,12.761-6.672.027-11.967-5.359-12.026-12.699-.124-15.5-.042-71.002-.044-86.503v-4.909m-55.754-62.064c-.062,1.126-.158,2.082-.159,3.037q-.0165,14.61,0,29.218c.012,4.936.897,5.787,6.008,5.798q14.424.0315,28.849-.005c1.036-.003,2.072-.168,3.078-.256-12.608-12.614-25.031-25.041-37.776-37.792"
                                    transform="translate(-0.00049 0.00013)"
                                  />
                                  <path
                                    className="cls-1"
                                    d="M116.0804,151.90581c-15.874.001-31.75.085-47.623-.031-8.959-.066-14.672-8.168-11.646-16.179,1.821-4.82,6.2-7.712,12.118-7.765,8.374-.075,16.75-.022,25.124-.022q34.3125,0,68.623.015c7.52.013,12.814,4.462,13.285,10.965.529,7.31-4.636,12.939-12.258,12.986-15.874.098-31.749.03-47.623.031"
                                    transform="translate(-0.00049 0.00013)"
                                  />
                                  <path
                                    className="cls-1"
                                    d="M91.8434,103.9019c-7.623,0-15.247.049-22.869-.013-7.611-.063-13.051-5.16-12.981-12.03.069-6.75,5.399-11.877,12.786-11.924q23.244-.1485,46.488-.001c7.614.049,12.824,5.248,12.708,12.3-.113,6.832-5.321,11.596-12.888,11.654-7.747.06-15.496.014-23.244.014"
                                    transform="translate(-0.00049 0.00013)"
                                  />
                                  <path
                                    className="cls-1"
                                    d="M91.9635,199.91721c-7.748,0-15.497.061-23.244-.018-7.356-.075-12.715-5.161-12.728-11.904-.012-6.741,5.318-11.987,12.668-12.039q23.43-.168,46.863.006c7.387.06,12.518,5.276,12.456,12.168-.062,6.856-5.258,11.707-12.771,11.772-7.747.068-15.496.015-23.244.015"
                                    transform="translate(-0.00049 0.00013)"
                                  />
                                  <path
                                    d="M298.59778,258.13647a20.88853,20.88853,0,0,0-5.95062-14.92718,56.4644,56.4644,0,0,0-15.11579-11.2074,123.20644,123.20644,0,0,0-40.01471-13.227c-9.65777-1.50452-19.20581-.61786-28.68347,1.56085-12.90192,2.96686-25.21973,7.40589-36.475,14.48249-5.00623,3.147-9.77741,6.67828-12.93714,11.79565-1.451,2.3476-2.22937,5.109-3.313,7.68317v50.07641a73.75845,73.75845,0,0,0,3.261,8.17578c2.38281,4.43763,6.07306,7.82813,10.01953,10.86255,12.22491,9.40448,26.17963,15.03138,41.08289,18.50635a69.06645,69.06645,0,0,0,22.06433,1.86481,102.97444,102.97444,0,0,0,25.63214-5.945c9.72955-3.50873,18.937-8.0069,27.1001-14.42621,5.03436-3.9591,9.593-8.40936,11.86883-14.581a20.82063,20.82063,0,0,0,1.34692-6.88513C298.602,287.34351,298.43451,272.73859,298.59778,258.13647Zm-15.40436,6.52344a39.05983,39.05983,0,0,1-12.11517,11.6817A92.038,92.038,0,0,1,235.155,290.05707c-1.14.18854-2.29547.30957-3.44959.40393-1.56927.12945-3.14422.20123-4.31237.273a82.21266,82.21266,0,0,1-27.97272-5.89716,74.58721,74.58721,0,0,1-19.5506-10.68377,32.63638,32.63638,0,0,1-9.10889-10.17432c-2.995-5.62128-2.51086-10.95123,1.33-15.98566,3.58893-4.70221,8.339-8.01812,13.42688-10.83581a101.78213,101.78213,0,0,1,33.49689-11.32276A62.10407,62.10407,0,0,1,242.734,227.021c10.72888,2.42358,20.96228,6.10827,30.29211,12.03637a36.218,36.218,0,0,1,9.20465,7.97168Q288.93784,255.51581,283.19342,264.65991Z"
                                    transform="translate(-0.00049 0.00013)"
                                  />
                                  <path
                                    fill="#fff"
                                    d="M268.26654,244.60333a55.70049,55.70049,0,0,0-10.75.912c-6.9682,1.27234-36.8606,1.98309-43.68664,2.45178-7.983.54749-15.97718,1.10626-23.56324.61505-4.21527-.27307-8.01111,1.5918-8.49811,4.446-.24346,1.43.34766,2.76422.56159,4.14349.15344-.03375.30682-.06756.4588-.09991,2.01263,2.32507,5.08929,3.9577,8.75568,5.16809,7.3186,2.41516,38.91266,3.25116,47.90332,3.33984a106.1246,106.1246,0,0,0,23.15228-2.08722c6.94421-1.45953,11.48883-4.40808,14.11371-8.74859C280.24091,248.9101,277.00525,244.75812,268.26654,244.60333Z"
                                    transform="translate(-0.00049 0.00013)"
                                  />
                                  <path
                                    fill="#fff"
                                    d="M195.96045,266.65594c-5.30182-.97113-10.3714-2.22375-15.68164-3.37921a26.12067,26.12067,0,0,0,7.28345,8.85834c6.46154,4.96259,38.451,6.84857,50.60278,4.40106a90.64813,90.64813,0,0,0,22.77649-8.2926c1.3385-.66992,2.61358-1.4032,3.6593-1.969-4.65857.71215-9.45648,1.66638-14.14886,2.11956C239.0968,269.48914,205.73645,268.44763,195.96045,266.65594Z"
                                    transform="translate(-0.00049 0.00013)"
                                  />
                                  <path
                                    fill="#fff"
                                    d="M195.89679,244.71661a23.87182,23.87182,0,0,0,5.35809.57141c4.20825-.10833,8.47132-.30255,12.764-.70227,7.27924-.677,37.63049-1.32861,45.00543-3.1203a38.0698,38.0698,0,0,0,5.30316-1.6903c1.94367-.79242,2.26178-1.78608.91486-2.50525a11.90875,11.90875,0,0,0-2.874-1.04572,62.35352,62.35352,0,0,0-15.15949-1.29767c-8.34607.14783-39.5249,2.19562-47.98352,5.39753-.97113.55731-2.37579,1.24554-3.54394,2.06329C194.16986,243.44574,194.22339,244.37744,195.89679,244.71661Z"
                                    transform="translate(-0.00049 0.00013)"
                                  />
                                </svg>
                              </div>
                              <div className="bid-progress">
                                {bid && bid.name ? (
                                  <Tooltip
                                    placement="topLeft"
                                    color="#fff"
                                    title={bid.name}
                                  >
                                    <h4 className="text-ellipse">
                                      {bid?.name}
                                    </h4>
                                  </Tooltip>
                                ) : (
                                  <h4 className="text-ellipse">N/A</h4>
                                )}

                                <Progress
                                  percent={bid?.bidCompletion || 0}
                                  size="small"
                                />
                              </div>
                            </div>

                            <div className="bid-info-wrapper">
                              <div className="row">
                                <div className="col-6">
                                  <div className="bid-info-list">
                                    <div className="icon">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        id="Layer_1"
                                        data-name="Layer 1"
                                        viewBox="0 0 412.94279 412.86914"
                                      >
                                        <path
                                          d="M152.01465,446.59961l-.41553-.20313c-.19775-.09668-.394-.21093-.58887-.32812-.08837-.05274-.17382-.11133-.2622-.1543-32.72608-4.02929-57.26221-33.09375-57.09034-67.64941.26368-52.93653.22852-106.76367.19434-158.81885-.01807-28.00879-.03711-56.9707-.00928-85.457a77.41909,77.41909,0,0,1,1.376-15.45313,65.89835,65.89835,0,0,1,63.75879-52.852c2.2456-.043,4.63525-.063,7.521-.063,2.123,0,4.26025.01074,6.42382.02148q2.3379.01172,4.72217.02-.00952-1.6604-.02637-3.28125c-.03564-3.80859-.06933-7.40674.06788-11.061a17.98122,17.98122,0,0,1,17.8081-17.58349,18.48335,18.48335,0,0,1,5.80811.94824,18.00065,18.00065,0,0,1,12.22461,17.04248c.083,3.667.062,7.36426.0415,10.93994q-.00805,1.38209-.01416,2.75684h67.8706q-.00219-1.322-.00585-2.62695c-.00733-3.34424-.01514-6.61817.01513-9.89161.10205-11.11035,7.65186-19.17431,17.95166-19.17431,10.51856.03759,17.87891,7.96875,17.97168,19.28711.02637,3.25781.01953,6.51513.0127,9.8081l-.00391,2.57422h68.65625l-.00293-2.55566c-.00488-3.252-.00976-6.42578.00977-9.6001.07324-11.48975,7.45215-19.51416,17.94433-19.51416l.15625.00049c10.41114.07959,17.74121,8.03857,17.82617,19.35449.02442,3.24121.01856,6.48291.01172,9.84131l-.00293,2.769c1.80957-.01172,3.59765-.03711,5.36817-.062,2.37988-.03369,4.72851-.0669,7.05957-.0669,3.22363,0,5.89062.064,8.3916.20118,26.0957,1.43017,45.25488,13.87988,56.94336,37.00341,2.30566,4.562,3.64551,9.58692,4.94043,14.44678.57617,2.16309,1.17285,4.3999,1.84082,6.53467l.09082.2915V304.583l-.27344.46777c-.46679.79688-.89355,1.63672-1.34472,2.52539a23.44019,23.44019,0,0,1-3.81543,5.92871,16.70867,16.70867,0,0,1-12.12891,5.37793,18.956,18.956,0,0,1-6.52344-1.21777c-6.73437-2.46973-10.7832-7.67676-11.709-15.05957a31.04026,31.04026,0,0,1-.14844-4.26465c.00488-.39062.00977-.78027.00977-1.16894l-.002-63.83594q0-49.92554-.00879-99.85156c-.0039-13.44434-5.69043-23.07715-16.90234-28.63135a31.33117,31.33117,0,0,0-11.4541-3.00733c-2.582-.18115-5.39551-.26562-8.85352-.26562-2.1416,0-4.30566.03125-6.50586.0625-1.6455.02344-3.31054.04736-5,.05859.00684,1.03906.01856,2.07617.0293,3.11084.041,3.68262.083,7.49024-.07715,11.2417a17.81645,17.81645,0,0,1-27.38281,14.69287,17.6335,17.6335,0,0,1-8.458-15.38135c-.05371-3.49414-.041-6.92772-.02734-10.5625q.00439-1.4436.00879-2.91015h-68.666l.00293,2.43554c.00586,3.24415.01172,6.501-.01074,9.75782-.0791,11.3164-7.38086,19.30322-17.75733,19.42285l-.23193.001c-10.48437.001-17.86084-8.00049-17.938-19.457-.02148-3.18164-.01611-6.36328-.01025-9.62939l.00244-2.56494H213.56592l.00342,2.49023c.00634,3.293.01318,6.56446-.01221,9.83643-.08838,11.3208-7.43506,19.26709-17.86621,19.32373H195.583c-10.29541.00049-17.84375-8.05274-17.94922-19.14893-.03027-3.22509-.023-6.45019-.01514-9.9541.00244-1.0293.00489-2.08252.00635-3.167-2.28369.08594-4.55664.123-6.772.15967-6.44239.106-12.52735.20605-18.417,1.40088-13.43116,2.72558-22.33692,14.1748-22.687,29.16845-.07714,3.29493-.0581,6.6626-.04,9.91895.00831,1.46875.01661,2.9375.01661,4.40625l.00146,60.47168q.00366,85.74317-.01465,171.4873c-.00439,14.06739,5.49951,23.56348,16.82617,29.03028a33.67671,33.67671,0,0,0,14.082,3.22558c50.979.1084,105.45459.16114,166.53955.16114q56.23827,0,112.46386-.04883c17.2627-.01367,29.69922-11.73926,30.94629-29.17676.26856-3.75195,1.13184-9.23828,5.51563-13.54785a17.70593,17.70593,0,0,1,12.47461-5.12891,17.89267,17.89267,0,0,1,16.2539,10.27637c.40235.8418.77051,1.70019,1.1377,2.55762.1582.37109.64746,1.49609.64746,1.49609V388.294l-.15137.36718c-.09375.22657-.20117.4502-.31054.67383a3.89477,3.89477,0,0,0-.27832.65527c-3.74122,23.21485-16.25391,40.07715-37.19043,50.1211a78.71945,78.71945,0,0,1-13.90333,4.64551c-2.07226.55175-4.21582,1.12207-6.26757,1.7539l-.28809.08887Z"
                                          transform="translate(-93.65682 -33.73047)"
                                        />
                                        <path
                                          d="M218.03184,290.83887c-2.97168,0-5.43165-.07032-7.74415-.22071-18.082-1.18261-30.94238-13.78222-32-31.35351a350.39844,350.39844,0,0,1,.01954-42.52344c1.0625-17.1875,13.78906-29.93359,30.94824-30.99512,7.09082-.43847,14.27832-.66113,21.36426-.66113,7.20117,0,14.45312.22949,21.55273.68262,17.02539,1.08789,29.67188,13.7207,30.75586,30.7207a328.03158,328.03158,0,0,1-.02832,43.334c-1.23047,17.7539-15.09863,30.47461-33.72656,30.93359-2.06446.05078-4.25977.07519-6.91016.07519-1.91992,0-3.84082-.01269-5.76172-.02539-1.91211-.01171-3.82324-.02441-5.73535-.02441h-2v-.07617c-1.44434.01269-2.88867.03711-4.333.06152C222.29844,290.80273,220.16367,290.83887,218.03184,290.83887Zm29.20507-36.207V221.59473h-33.04v33.03711Z"
                                          transform="translate(-93.65682 -33.73047)"
                                        />
                                        <path
                                          d="M334.25427,290.84033a18.0338,18.0338,0,0,1-17.66993-17.87744,17.94086,17.94086,0,1,1,35.88135.09229,17.99878,17.99878,0,0,1-17.94238,17.78711Z"
                                          transform="translate(-93.65682 -33.73047)"
                                        />
                                        <path
                                          d="M403.88708,290.84033a18.03356,18.03356,0,0,1-17.83643-17.71094A18.02815,18.02815,0,0,1,403.871,254.95264l.1206-.00049a17.94441,17.94441,0,0,1,.001,35.88867Z"
                                          transform="translate(-93.65682 -33.73047)"
                                        />
                                        <path
                                          d="M334.2373,221.35742a18.02987,18.02987,0,0,1-17.64843-18.3457,18.04711,18.04711,0,0,1,17.9375-17.54151,17.94483,17.94483,0,0,1-.001,35.88965Z"
                                          transform="translate(-93.65682 -33.73047)"
                                        />
                                        <path
                                          d="M403.99316,221.35791a18.024,18.024,0,0,1-17.94043-18.05127,17.98748,17.98748,0,0,1,17.94141-17.8374l.21875.001a18.035,18.035,0,0,1,17.72168,17.82667,18.02485,18.02485,0,0,1-17.93555,18.061Z"
                                          transform="translate(-93.65682 -33.73047)"
                                        />
                                        <path
                                          d="M334.5238,360.32129a18.02255,18.02255,0,0,1-17.93946-17.98047A18.03477,18.03477,0,0,1,334.225,324.43359l.29834-.00195a18.00483,18.00483,0,0,1,17.94238,17.75684,18.02436,18.02436,0,0,1-17.86426,18.13281Z"
                                          transform="translate(-93.65682 -33.73047)"
                                        />
                                        <path
                                          d="M403.49743,360.31543a18.02576,18.02576,0,0,1-17.43555-18.54395A18.09384,18.09384,0,0,1,403.993,324.43164l.2671.00195a18.03114,18.03114,0,0,1,17.67138,18.3252,18.044,18.044,0,0,1-17.939,17.56348C403.82751,360.32227,403.66345,360.32031,403.49743,360.31543Z"
                                          transform="translate(-93.65682 -33.73047)"
                                        />
                                        <path
                                          d="M195.436,360.31934a18.03027,18.03027,0,0,1-17.78223-18.21485,18.03416,18.03416,0,0,1,17.875-17.67285,17.94439,17.94439,0,1,1,.0664,35.88867Z"
                                          transform="translate(-93.65682 -33.73047)"
                                        />
                                        <path
                                          d="M264.70068,360.31934a17.94571,17.94571,0,0,1,.36036-35.8877h.13525a18.02913,18.02913,0,0,1,17.80517,18.19141,18.01665,18.01665,0,0,1-17.94287,17.69922Z"
                                          transform="translate(-93.65682 -33.73047)"
                                        />
                                      </svg>
                                    </div>
                                    <div className="bid-info">
                                      <span className="label">Start Date</span>
                                      <span className="value">
                                        {moment(bid?.startDate).format(FRONTEND_DATE_FORMAT) || "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="col-6">
                                  <div className="bid-info-list">
                                    <div className="icon">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        id="Layer_1"
                                        data-name="Layer 1"
                                        viewBox="0 0 412.94279 412.86914"
                                      >
                                        <path
                                          d="M152.01465,446.59961l-.41553-.20313c-.19775-.09668-.394-.21093-.58887-.32812-.08837-.05274-.17382-.11133-.2622-.1543-32.72608-4.02929-57.26221-33.09375-57.09034-67.64941.26368-52.93653.22852-106.76367.19434-158.81885-.01807-28.00879-.03711-56.9707-.00928-85.457a77.41909,77.41909,0,0,1,1.376-15.45313,65.89835,65.89835,0,0,1,63.75879-52.852c2.2456-.043,4.63525-.063,7.521-.063,2.123,0,4.26025.01074,6.42382.02148q2.3379.01172,4.72217.02-.00952-1.6604-.02637-3.28125c-.03564-3.80859-.06933-7.40674.06788-11.061a17.98122,17.98122,0,0,1,17.8081-17.58349,18.48335,18.48335,0,0,1,5.80811.94824,18.00065,18.00065,0,0,1,12.22461,17.04248c.083,3.667.062,7.36426.0415,10.93994q-.00805,1.38209-.01416,2.75684h67.8706q-.00219-1.322-.00585-2.62695c-.00733-3.34424-.01514-6.61817.01513-9.89161.10205-11.11035,7.65186-19.17431,17.95166-19.17431,10.51856.03759,17.87891,7.96875,17.97168,19.28711.02637,3.25781.01953,6.51513.0127,9.8081l-.00391,2.57422h68.65625l-.00293-2.55566c-.00488-3.252-.00976-6.42578.00977-9.6001.07324-11.48975,7.45215-19.51416,17.94433-19.51416l.15625.00049c10.41114.07959,17.74121,8.03857,17.82617,19.35449.02442,3.24121.01856,6.48291.01172,9.84131l-.00293,2.769c1.80957-.01172,3.59765-.03711,5.36817-.062,2.37988-.03369,4.72851-.0669,7.05957-.0669,3.22363,0,5.89062.064,8.3916.20118,26.0957,1.43017,45.25488,13.87988,56.94336,37.00341,2.30566,4.562,3.64551,9.58692,4.94043,14.44678.57617,2.16309,1.17285,4.3999,1.84082,6.53467l.09082.2915V304.583l-.27344.46777c-.46679.79688-.89355,1.63672-1.34472,2.52539a23.44019,23.44019,0,0,1-3.81543,5.92871,16.70867,16.70867,0,0,1-12.12891,5.37793,18.956,18.956,0,0,1-6.52344-1.21777c-6.73437-2.46973-10.7832-7.67676-11.709-15.05957a31.04026,31.04026,0,0,1-.14844-4.26465c.00488-.39062.00977-.78027.00977-1.16894l-.002-63.83594q0-49.92554-.00879-99.85156c-.0039-13.44434-5.69043-23.07715-16.90234-28.63135a31.33117,31.33117,0,0,0-11.4541-3.00733c-2.582-.18115-5.39551-.26562-8.85352-.26562-2.1416,0-4.30566.03125-6.50586.0625-1.6455.02344-3.31054.04736-5,.05859.00684,1.03906.01856,2.07617.0293,3.11084.041,3.68262.083,7.49024-.07715,11.2417a17.81645,17.81645,0,0,1-27.38281,14.69287,17.6335,17.6335,0,0,1-8.458-15.38135c-.05371-3.49414-.041-6.92772-.02734-10.5625q.00439-1.4436.00879-2.91015h-68.666l.00293,2.43554c.00586,3.24415.01172,6.501-.01074,9.75782-.0791,11.3164-7.38086,19.30322-17.75733,19.42285l-.23193.001c-10.48437.001-17.86084-8.00049-17.938-19.457-.02148-3.18164-.01611-6.36328-.01025-9.62939l.00244-2.56494H213.56592l.00342,2.49023c.00634,3.293.01318,6.56446-.01221,9.83643-.08838,11.3208-7.43506,19.26709-17.86621,19.32373H195.583c-10.29541.00049-17.84375-8.05274-17.94922-19.14893-.03027-3.22509-.023-6.45019-.01514-9.9541.00244-1.0293.00489-2.08252.00635-3.167-2.28369.08594-4.55664.123-6.772.15967-6.44239.106-12.52735.20605-18.417,1.40088-13.43116,2.72558-22.33692,14.1748-22.687,29.16845-.07714,3.29493-.0581,6.6626-.04,9.91895.00831,1.46875.01661,2.9375.01661,4.40625l.00146,60.47168q.00366,85.74317-.01465,171.4873c-.00439,14.06739,5.49951,23.56348,16.82617,29.03028a33.67671,33.67671,0,0,0,14.082,3.22558c50.979.1084,105.45459.16114,166.53955.16114q56.23827,0,112.46386-.04883c17.2627-.01367,29.69922-11.73926,30.94629-29.17676.26856-3.75195,1.13184-9.23828,5.51563-13.54785a17.70593,17.70593,0,0,1,12.47461-5.12891,17.89267,17.89267,0,0,1,16.2539,10.27637c.40235.8418.77051,1.70019,1.1377,2.55762.1582.37109.64746,1.49609.64746,1.49609V388.294l-.15137.36718c-.09375.22657-.20117.4502-.31054.67383a3.89477,3.89477,0,0,0-.27832.65527c-3.74122,23.21485-16.25391,40.07715-37.19043,50.1211a78.71945,78.71945,0,0,1-13.90333,4.64551c-2.07226.55175-4.21582,1.12207-6.26757,1.7539l-.28809.08887Z"
                                          transform="translate(-93.65682 -33.73047)"
                                        />
                                        <path
                                          d="M356.65234,360.39648c-2.97168,0-5.43164-.07031-7.74414-.2207-18.082-1.18262-30.94238-13.78223-32-31.35351a350.40048,350.40048,0,0,1,.01953-42.52344c1.0625-17.1875,13.78907-29.9336,30.94825-30.99512,7.09082-.43848,14.27832-.66113,21.36425-.66113,7.20118,0,14.45313.22949,21.55274.68262,17.02539,1.08789,29.67187,13.7207,30.75586,30.7207a328.03143,328.03143,0,0,1-.02832,43.334c-1.23047,17.75391-15.09863,30.47461-33.72656,30.9336-2.06446.05078-4.25977.07519-6.91016.07519-1.91992,0-3.84082-.01269-5.76172-.02539-1.91211-.01172-3.82324-.02441-5.73535-.02441h-2v-.07617c-1.44434.01269-2.88867.0371-4.333.06152C360.919,360.36035,358.78418,360.39648,356.65234,360.39648Zm29.20508-36.207V291.15234h-33.04v33.03711Z"
                                          transform="translate(-93.65682 -33.73047)"
                                        />
                                        <path
                                          d="M195.32373,221.35791a18.03379,18.03379,0,0,1-17.66992-17.87744,17.94086,17.94086,0,1,1,35.88135.09228,17.99878,17.99878,0,0,1-17.94239,17.78711Z"
                                          transform="translate(-93.65682 -33.73047)"
                                        />
                                        <path
                                          d="M264.95654,221.35791A18.03355,18.03355,0,0,1,247.12012,203.647a18.02815,18.02815,0,0,1,17.82031-18.17676l.12061-.00048a17.94441,17.94441,0,0,1,.001,35.88867Z"
                                          transform="translate(-93.65682 -33.73047)"
                                        />
                                        <path
                                          d="M334.2373,221.35742a18.02987,18.02987,0,0,1-17.64843-18.3457,18.04711,18.04711,0,0,1,17.9375-17.54151,17.94483,17.94483,0,0,1-.001,35.88965Z"
                                          transform="translate(-93.65682 -33.73047)"
                                        />
                                        <path
                                          d="M403.99316,221.35791a18.024,18.024,0,0,1-17.94043-18.05127,17.98748,17.98748,0,0,1,17.94141-17.8374l.21875.001a18.035,18.035,0,0,1,17.72168,17.82667,18.02485,18.02485,0,0,1-17.93555,18.061Z"
                                          transform="translate(-93.65682 -33.73047)"
                                        />
                                        <path
                                          d="M195.59326,290.83887a18.02254,18.02254,0,0,1-17.93945-17.98047,18.03475,18.03475,0,0,1,17.64062-17.90723l.29834-.00195a18.00485,18.00485,0,0,1,17.94239,17.75683,18.0244,18.0244,0,0,1-17.86426,18.13282Z"
                                          transform="translate(-93.65682 -33.73047)"
                                        />
                                        <path
                                          d="M264.56689,290.833a18.02574,18.02574,0,0,1-17.43554-18.54395,18.09384,18.09384,0,0,1,17.93114-17.33984l.2671.00195a18.03114,18.03114,0,0,1,17.67139,18.3252,18.044,18.044,0,0,1-17.939,17.56347C264.897,290.83984,264.73291,290.83789,264.56689,290.833Z"
                                          transform="translate(-93.65682 -33.73047)"
                                        />
                                        <path
                                          d="M195.436,360.31934a18.03027,18.03027,0,0,1-17.78223-18.21485,18.03416,18.03416,0,0,1,17.875-17.67285,17.94439,17.94439,0,1,1,.0664,35.88867Z"
                                          transform="translate(-93.65682 -33.73047)"
                                        />
                                        <path
                                          d="M264.70068,360.31934a17.94571,17.94571,0,0,1,.36036-35.8877h.13525a18.02913,18.02913,0,0,1,17.80517,18.19141,18.01665,18.01665,0,0,1-17.94287,17.69922Z"
                                          transform="translate(-93.65682 -33.73047)"
                                        />
                                      </svg>
                                    </div>
                                    <div className="bid-info">
                                      <span className="label">End Date</span>
                                      <span className="value">
                                      {moment(bid?.endDate).format(FRONTEND_DATE_FORMAT) || "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="row">
                                <div className="col-6">
                                  <div className="bid-info-list">
                                    <div className="icon">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        id="Layer_1"
                                        data-name="Layer 1"
                                        viewBox="0 0 388 338.55078"
                                      >
                                        <path
                                          d="M304.61133,408.77539q-34.08544,0-68.167-.02344l-12.58594-.00683a27.57281,27.57281,0,0,1-18.42969-7.01465c-4.9126-4.23926-7.99316-9.80274-9.38672-16.96875,0,0-33.04492.01367-39.14892.01367q-13.74316,0-27.4834-.03516a24.00629,24.00629,0,0,1-23.39258-16.97656c-.16553-.50781-.36816-1.00293-.56885-1.498-.10595-.26074-.44824-1.13183-.44824-1.13183V272.25s.41553-1.66211.59131-2.373c.38916-1.57422.77832-3.14746,1.20361-4.71093a52.6321,52.6321,0,0,1,50.21387-38.84913q2.0515-.01172,4.11328-.0371c2.00977-.02149,4.02344-.043,6.03613-.043a110.8578,110.8578,0,0,1,18.57325,1.25195c15.64746,2.67969,27.86767,11.68164,36.35791,26.772,1.03808-.9873,2.04248-1.9414,3.06-2.88086,17.84717-16.48681,38.8462-24.90381,62.41407-25.01709q3.43578-.01611,6.88525-.02148c10.37256,0,21.45752.2124,32.24072,1.75342,17.65039,2.523,33.92871,11.0708,48.38477,25.40722q.36768.36328.7373.72461.42774-.65625.85254-1.3164a75.5381,75.5381,0,0,1,4.90918-7c10.49512-12.79834,24.0459-19.37793,40.27442-19.55664l3.00293-.03809c2.30273-.03125,4.61523-.0625,6.92578-.0625a104.76387,104.76387,0,0,1,19.55078,1.47461c21.27441,4.06006,36.97363,20.44043,40.96973,42.749a3.72617,3.72617,0,0,0,.26464.62891c.10059.209.2002.418.28711.62891l.15137.36718v92.623l-.45312.55273c-.06153.0752-.12793.14844-.19727.22168-4.43262,13.49219-12.44336,19.25879-26.72754,19.26172l-63.667.001c-.14259.54394-.27246,1.05176-.38574,1.56152-2.96289,13.37793-13.96973,22.38086-27.38868,22.40235Q339.398,408.78126,304.61133,408.77539Zm33.668-26.51172q16.87061,0,33.7373-.00683c3.55274-.002,3.72656-.17579,3.72754-3.7168q.00147-8.915.03711-17.8291c.042-14.29688.08594-29.08106-.10937-43.60938-.41114-30.60644-23.0918-57.56152-52.75782-62.69922-8.207-1.42187-16.78808-1.61718-24.83984-1.61718-1.89942,0-3.79834.01074-5.69336.02148q-2.09911.01318-4.1919.02051c-36.15673.09473-65.72753,29.71191-65.91845,66.02246-.07617,14.502-.05469,29.252-.03418,43.51562q.01171,8.03321.01855,16.06446c.00244,3.68359.00244,3.82715,3.98828,3.8291,11.49219.00391,72.69922.00293,72.69922.00293ZM466.4834,358.1543q.00147-11.07129.02246-22.14258c.02734-19.07715.05663-38.80371-.10254-58.19824-.09863-11.9795-9.084-22.58692-20.45605-24.14942a111.36948,111.36948,0,0,0-15.09278-1.01269,116.73153,116.73153,0,0,0-12.38965.66114A24.5993,24.5993,0,0,0,400.832,263.90039c-4.75488,6.917-5.96582,16.02637-3.41113,25.65039.25879.9707.52539,1.94531.793,2.92188,1.42968,5.22461,2.90918,10.62793,3.16894,16.10449.53907,11.38769.63672,22.96777.73047,34.166.03809,4.48633.0752,8.97364.14063,13.459.00976.65039.01074,1.30078.00879,1.95215Zm-270.6958-.04492c-.00977-3.59278-.04395-7.165-.07813-10.72266-.09375-9.73535-.19043-19.80274.25293-29.64551a134.44928,134.44928,0,0,1,2.40674-17.791c.46875-2.58887.95361-5.26661,1.355-7.88965.21826-1.42578.49072-2.85743.75391-4.24219a49.48517,49.48517,0,0,0,1.16113-8.98633,25.27529,25.27529,0,0,0-21.29541-25.38769,78.63513,78.63513,0,0,0-11.93457-.72559c-1.353,0-2.707.01367-4.06006.02734-1.36377.01368-2.72607.02735-4.08447.02735l-.64746-.001c-17.07031,0-28.106,11.08106-28.11426,28.23047q-.01245,26.24561-.00439,52.49121L131.5,358.10938Z"
                                          transform="translate(-105 -70.22461)"
                                        />
                                        <path
                                          d="M299.0127,204.73486a67.21686,67.21686,0,1,1,.0332,0Zm.00292-107.99951a40.76082,40.76082,0,1,0,.17187.00049Z"
                                          transform="translate(-105 -70.22461)"
                                        />
                                        <path
                                          d="M166.98389,204.72656a43.2439,43.2439,0,1,1,.01611,0Zm.02685-59.9873a16.74321,16.74321,0,0,0-.26758,33.48437l.21485.00147a16.72445,16.72445,0,0,0,11.92529-28.50489,16.58165,16.58165,0,0,0-11.7998-4.981l-.07276-2Z"
                                          transform="translate(-105 -70.22461)"
                                        />
                                        <path
                                          d="M430.96094,204.72656a43.2554,43.2554,0,1,1,.03808,0Zm.06054-59.98779a16.744,16.744,0,0,0-.34082,33.48486l.26856.002A16.72423,16.72423,0,0,0,442.915,149.75293a16.56074,16.56074,0,0,0-11.76856-5.01367Z"
                                          transform="translate(-105 -70.22461)"
                                        />
                                      </svg>
                                    </div>
                                    <div className="bid-info">
                                      <span className="label">Client</span>
                                      {bid && bid.clientName ? (
                                        <span className="value text-ellipse">
                                          <Tooltip
                                            placement="top"
                                            color="#fff"
                                            title={bid.clientName}
                                          >
                                            {bid.clientName}
                                          </Tooltip>
                                        </span>
                                      ) : (
                                        <span className="value text-ellipse">
                                          N/A
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="col-6">
                                  <div className="bid-info-list">
                                    <div className="icon">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        id="Layer_1"
                                        data-name="Layer 1"
                                        viewBox="0 0 337.54441 384"
                                      >
                                        <path
                                          d="M202.506,48H423.77021v90.919c28.05649,6.89233,44.5032,31.32431,45.0136,54.96424.486,22.5097-13.66059,48.74931-45.0136,56.425V432H131.25149q.006-4.872.01146-9.744.0014-147.28707.015-294.57412c.01331-33.81117,19.59642-62.55232,51.03333-74.48463C188.76994,50.74581,195.76062,49.69592,202.506,48ZM401.06638,409.32967V255.24138a47.887,47.887,0,0,0-4.46236,3.429c-7.99812,7.90867-15.989,15.82651-23.84181,23.87837a12.17541,12.17541,0,0,0-2.87773,5.13412c-1.25678,4.65708.6418,8.393,3.78016,11.8875,10.81421,12.04155,12.41754,29.79536,2.53425,42.01049-8.19166,10.12433-17.9386,18.9905-26.662,28.06606q-56.14443-56.13433-111.15822-111.13827c8.22324-8.41717,16.27074-17.54256,25.25095-25.63276,12.62635-11.37506,31.35054-10.47651,44.757,1.27631,5.67084,4.97137,11.76448,5.26123,16.72755.42423q11.41012-11.12024,22.4848-22.58251a30.95261,30.95261,0,0,0,8.90634-20.44922A54.387,54.387,0,0,1,374.72317,153.328a59.84881,59.84881,0,0,1,26.25893-14.02535V70.70622H221.18274V138.182H153.96518V409.32967ZM350.138,274.90079c2.46011-2.97171,4.949-6.40022,7.86475-9.416,6.94467-7.18288,14.17311-14.09107,21.13438-21.25836,7.959-8.19459,17.6589-12.84946,28.79284-14.77459,5.152-.89082,10.49857-1.15488,15.43088-2.72639,16.23006-5.17119,25.51706-21.59273,22.22724-38.46591-3.17292-16.27351-18.752-28.68219-34.74548-27.67459-16.775,1.05685-30.99508,15.37258-31.90355,32.61763-.60126,11.414-4.19745,21.68026-11.635,30.15773-10.756,12.26-22.01451,24.0961-34.64451,33.917C338.42517,263.09077,344.35062,269.06536,350.138,274.90079Zm-80.01009-17.1505,79.74157,79.79217c1.66152-1.77684,3.66635-4.00223,5.75833-6.14244,5.95985-6.09725,5.97516-12.22208-.06636-18.27751q-18.25621-18.29821-36.55023-36.55871c-8.47682-8.476-16.92118-16.98477-25.44693-25.41123-4.64449-4.59041-10.8386-5.08226-15.53009-1.10425C275.01486,252.60851,272.33948,255.57431,270.12792,257.75029ZM198.58172,72.0942c-18.88115,1.29714-43.73585,26.36507-42.99757,43.17173h42.99757Z"
                                          transform="translate(-131.25149 -48)"
                                        />
                                        <path
                                          d="M266.26025,341.07767a44.9934,44.9934,0,1,1-45.2428-44.82458A45.116,45.116,0,0,1,266.26025,341.07767Zm-22.50492.228a22.487,22.487,0,1,0-22.44285,22.43172A22.5219,22.5219,0,0,0,243.75533,341.30571Z"
                                          transform="translate(-131.25149 -48)"
                                        />
                                        <path
                                          d="M412.45893,180.10612c4.81838,4.82009,9.97815,9.98166,14.89118,14.89642l-14.95129,14.96492c-4.8464-4.8533-9.99582-10.01006-14.92261-14.94389C402.35617,190.16486,407.524,185.01955,412.45893,180.10612Z"
                                          transform="translate(-131.25149 -48)"
                                        />
                                      </svg>
                                    </div>
                                    <div className="bid-info">
                                      <span className="label">Authority</span>
                                      {bid && bid.authority ? (
                                        <span className="value text-ellipse">
                                          <Tooltip
                                            placement="top"
                                            color="#fff"
                                            title={bid.authority}
                                          >
                                            {bid.authority}
                                          </Tooltip>
                                        </span>
                                      ) : (
                                        <span className="value text-ellipse">
                                          N/A
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="row">
                                <div className="col-6">
                                  <div className="bid-info-list">
                                    <div className="icon img-icon">
                                      {bid?.bidManager?.avatar != null &&
                                      bid?.bidManager?.avatar != "null" ? (
                                        <img
                                          src={
                                            avatarURL + bid?.bidManager?.avatar
                                          }
                                          alt=""
                                          width="30"
                                        />
                                      ) : (
                                        <img
                                          src="/images/user-circle.png "
                                          alt=""
                                          width="30"
                                        />
                                      )}
                                    </div>
                                    <div className="bid-info">
                                      <span className="label">Bid Manager</span>
                                      {bid && bid.bidManager ? (
                                        <Tooltip
                                          placement="top"
                                          color="#fff"
                                          title={bid?.bidManager?.fullName}
                                        >
                                          <span className="value text-ellipse">
                                            {bid?.bidManager?.fullName}
                                          </span>
                                        </Tooltip>
                                      ) : (
                                        <span className="value text-ellipse">
                                          N/A
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="col-6">
                                  <div className="bid-info-list">
                                    <div className="icon">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        id="Layer_1"
                                        data-name="Layer 1"
                                        viewBox="0 0 149.37693 149.3406"
                                      >
                                        <path
                                          d="M149.97849,47.111c-.16342-.84772-.3278-1.69448-.5285-2.53312-1.75852-7.31646-5.96174-13.64375-12.84956-19.3441-9.1758-7.59361-20.39873-12.74634-34.311-15.754A124.69972,124.69972,0,0,0,78.85628,6.75749a7.98859,7.98859,0,0,1-.9452-.10035c-.173-.02485-.346-.0497-.51991-.06977l-.05639-.00669-3.57389.00191q-1.39056.08745-2.783.16534c-2.00413.11516-4.07659.23415-6.11752.40474C49.859,8.40848,37.89157,11.53079,27.19905,16.97836c-9.04773,4.61035-15.42615,9.69618-20.0733,16.00579A30.96264,30.96264,0,0,0,.86057,51.77155l.00144.43581c.053,18.53031.108,37.69139-.01769,56.53422-.07263,10.897,3.97481,19.89029,12.37314,27.49489,6.22216,5.63393,13.77421,9.85531,23.76666,13.28536a117.63875,117.63875,0,0,0,34.38893,6.18155c.44058.01434.88929.07073,1.36428.13.23176.02963.46352.0583.69528.08219l.05113.00573h4.11482l.03345-.00191c.87447-.06021,1.749-.11564,2.62343-.17107,1.86459-.11851,3.79322-.23988,5.69222-.409,15.36786-1.36476,28.36364-4.8837,39.73184-10.75559a51.17824,51.17824,0,0,0,16.90178-13.31212,33.6394,33.6394,0,0,0,7.39435-17.28215,1.18934,1.18934,0,0,1,.0755-.18637c.03823-.086.0755-.173.108-.26l.06117-.16439v-65.042S150.05113,47.48757,149.97849,47.111ZM17.52772,36.96183c5.03135-5.53119,11.48814-9.71482,20.31893-13.1659,11.16224-4.36283,23.40158-6.48355,37.4171-6.48355q1.90521,0,3.82094.05113c12.52748.33211,23.4226,2.32429,33.3085,6.09123,9.07927,3.45825,15.73389,7.6696,20.94253,13.25335a21.59674,21.59674,0,0,1,6.11369,12.08307c.47977,3.66516-.30583,7.30308-2.47147,11.448-2.69033,5.14986-7.00251,9.33015-13.57017,13.15539-7.82633,4.55827-16.875,7.6629-28.47736,9.77025a106.26167,106.26167,0,0,1-18.92407,1.75946h-.001q-1.10384,0-2.20817-.0258c-16.92949-.41669-31.29529-3.8109-43.91834-10.37522a41.83222,41.83222,0,0,1-12.64694-9.69C9.46724,55.862,9.57524,45.70325,17.52772,36.96183Zm6.0769,46.20488a63.98336,63.98336,0,0,1-12.009,7.65908V74.2308A59.97028,59.97028,0,0,0,23.60462,83.16671ZM12.86241,118.17733a15.977,15.977,0,0,1-1.3638-6.10987c-.03919-1.68206-.03441-3.39852-.03011-5.05859.00383-1.42879.00717-2.85758-.01481-4.28541a.77628.77628,0,0,1,.02389-.26187.84314.84314,0,0,1,.29293-.15387A73.93107,73.93107,0,0,0,33.632,88.61714a1.88928,1.88928,0,0,1,.65036-.35648A112.075,112.075,0,0,0,51.8961,93.23419,105.74516,105.74516,0,0,1,12.86241,118.17733ZM36.4169,137.22277a2.38024,2.38024,0,0,1-.74306.107,2.88315,2.88315,0,0,1-1.09764-.20452,54.2396,54.2396,0,0,1-14.52874-9.11941c-.31061-.27429-.60879-.56292-.90458-.85537l.14909-.064c1.00254-.43389,1.98262-.85727,2.96748-1.27014A114.41667,114.41667,0,0,0,63.53811,96.27048a2.91221,2.91221,0,0,1,2.42512-1.19273c.13954,0,.28433.00574.43629.01816,3.11753.24371,6.28572.36795,9.41759.36795a123.87522,123.87522,0,0,0,17.46469-1.252q-.152.24944-.30678.49315c-5.4447,8.52686-12.80082,16.30254-22.49031,23.77144A118.791,118.791,0,0,1,36.4169,137.22277Zm66.75079-7.57211a94.23663,94.23663,0,0,1-19.897,13.90562,14.07754,14.07754,0,0,1-6.78556,1.683l-.16056-.001A120.90122,120.90122,0,0,1,51.38,142.63975q1.0551-.54906,2.10591-1.08952c3.09269-1.597,6.29-3.24751,9.32536-5.03947,16.9252-9.991,29.78335-21.925,39.3099-36.48433,1.014-1.55016,1.9248-3.18443,2.805-4.76518.60115-1.079,1.20133-2.158,1.83784-3.216a1.852,1.852,0,0,1,.85154-.76648,84.39781,84.39781,0,0,0,24.212-10.81867q-.07884.36126-.15578.72109c-.4358,2.01225-.84772,3.91316-1.38387,5.79878C125.67,103.19844,116.799,117.15567,103.16769,129.65066ZM130.741,128.2601c-6.17295,5.43131-13.83586,9.44148-24.00942,12.5485,15.70236-13.21272,26.72746-29.21422,32.86409-47.69388q-.00429.55336-.01051,1.1048c-.04587,4.81584-.09462,9.797.10035,14.69791C139.98079,116.37581,137.05535,122.70263,130.741,128.2601Z"
                                          transform="translate(-0.84336 -6.58068)"
                                        />
                                        <path
                                          d="M46.73478,71.53808c9.54374,3.30819,19.46691,4.13823,31.42956,4.36665l.05352.001.05256-.00478c.755-.0669,1.67824-.13666,2.72474-.215,2.84325-.21408,6.73682-.507,10.55585-1.01115a57.367,57.367,0,0,0,20.54686-6.35548c5.0949-2.80884,8.65207-6.26327,10.87505-10.56063a14.10351,14.10351,0,0,0-.59349-14.88331,21.53587,21.53587,0,0,0-2.69129-3.42575,33.93768,33.93768,0,0,0-13.96009-8.36249A93.24439,93.24439,0,0,0,75.7397,26.08439a99.3157,99.3157,0,0,0-24.66408,3.204c-7.40534,1.90235-13.01728,4.55015-17.662,8.3319a18.35865,18.35865,0,0,0-6.85246,10.44881c-1.16358,5.33.47212,10.12577,5.00172,14.66063C35.26288,66.43361,40.084,69.23242,46.73478,71.53808ZM41.83054,57.41025H66.11328l1.0336,7.51621C58.14264,63.95163,49.44613,62.49321,41.83054,57.41025ZM82.34941,46.39232a40.478,40.478,0,0,1,12.52652-7.30164,1.4051,1.4051,0,0,1,.49315-.08315,1.31749,1.31749,0,0,1,.30678.03345c6.56288,1.59509,11.47333,3.80947,15.45579,6.96906,2.04426,1.6228,3.11275,3.23126,3.17392,4.78.06212,1.55447-.88213,3.25038-2.805,5.04139-3.19208,2.9737-7.15924,4.5339-10.97062,5.7768a83.06747,83.06747,0,0,1-20.96356,3.67089l-.15291.00383-.14432.05017a.9934.9934,0,0,1-.3192.0669c-.14145,0-.37751-.12233-.78369-1.17935C75.52275,57.33762,76.93051,51.33957,82.34941,46.39232Zm-42.383-.41573c3.51368-2.85806,7.77329-4.86123,13.81148-6.4955A82.68671,82.68671,0,0,1,75.64126,36.732q.81712,0,1.63427.0129l-.2915.29627c-1.8493,1.87368-3.68475,3.734-5.50777,5.60669a5.00209,5.00209,0,0,0-1.11961,1.61563c-.5892,1.52819-1.58888,2.1279-3.82,2.29276-4.34132.3192-8.74047.4812-13.07462.4812-3.432,0-6.91172-.10131-10.34368-.302-1.19608-.06976-2.39072-.1596-3.71294-.259C39.59512,46.29532,39.77767,46.13046,39.96642,45.97659Z"
                                          transform="translate(-0.84336 -6.58068)"
                                        />
                                      </svg>
                                    </div>
                                    <div className="bid-info">
                                      <span className="label">Bid Value</span>
                                      {bid && bid.value ? (
                                        <Tooltip
                                          placement="top"
                                          color="#fff"
                                          title={bid && bid.value}
                                        >
                                          {" "}
                                          <span
                                            className={
                                              bid && bid.value
                                                ? "value big-value text-ellipse"
                                                : "value text-ellipse"
                                            }
                                          >
                                            {bid.value && "£"}{" "}
                                            {(bid?.value &&
                                              thousandSeprator(bid?.value) +
                                                (bid?.value && ".00")) ||
                                              "N/A"}
                                          </span>
                                        </Tooltip>
                                      ) : (
                                        <span
                                          className={
                                            bid && bid.value
                                              ? "value big-value text-ellipse"
                                              : "value text-ellipse"
                                          }
                                        >
                                          N/A
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="row">
                                {bid && bid.bidStatusId == 1 && (
                                  <div className="col-12">
                                    <span className="tag tag-blue">Draft</span>
                                  </div>
                                )}

                                {bid && bid.bidStatusId == 2 && (
                                  <div className="col-12">
                                    <span className="tag tag-primary">
                                      Live
                                    </span>
                                  </div>
                                )}
                                {bid && bid.bidStatusId == 3 && (
                                  <div className="col-12">
                                    <span className="tag tag-gray">Closed</span>
                                  </div>
                                )}
                              </div>

                              <div className="card-footer row">
                                <div className="col-12">
                                  <hr />
                                </div>
                                {bid && bid.bidStatusId != 3 && (
                                  <div className="col-12">
                                    {bid &&
                                      bid.bidStatusId == 2 &&
                                      user.id == bid?.bidManagerId && (
                                        <Link
                                          to={""}
                                          onClick={() => {
                                            setSelectedBid(bid);
                                            setIsLiveToEdit(true);
                                          }}
                                          className="btn btn-bordered me-3"
                                        >
                                          <img src="/images/edit-icon.png" />{" "}
                                          Edit Bid Details
                                        </Link>
                                      )}
                                    {bid &&
                                      bid.bidStatusId != 2 &&
                                      user.id == bid?.bidManagerId && (
                                        <Link
                                          to={`/bidsetup/${bid?.id}`}
                                          className="btn btn-bordered me-3"
                                        >
                                          <img src="/images/edit-icon.png" />{" "}
                                          Edit Bid Details
                                        </Link>
                                      )}
                                    {bid &&
                                      bid.bidStatusId != 2 &&
                                      user.id == bid?.bidManagerId && (
                                        <Link
                                          onClick={() => getID(bid)}
                                          to={""}
                                          className={
                                            bid && bid.isBidPlanExists
                                              ? "btn btn-primary"
                                              : "btn btn-primary disabled"
                                          }
                                        >
                                          <img src="/images/live-icon.png" /> Go
                                          Live
                                        </Link>
                                      )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        </Link>
                      </div>
                    );
                  })}
              </div>
            </InfiniteScroll>
          )}
        </Skeleton>
      </Card>
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
        <p class="text-para">
          This Bid is currently live. if you edit it will move the bid to a
          "Draft" status?
        </p>
        <p className="confirmation-text">Are you sure you want to proceed?</p>
      </Modal>
      <Modal
        title="Notification to Team Members"
        className="notification-popup"
        open={notificationModal}
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
              <div class="">
                <div style={{position: 'relative'}}>
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
                              {item?.user?.userRole?.name === EXTERNAL_ROLE ? (
                          <span className="tag tag-blue mx-1">External </span>
                        ) : (
                          ""
                        )}
                              <p className="user-email">{item?.user?.email}</p>
                            </div>
                            {!selectedItems.some(
                              (a) => a.userId == item?.user?.userId
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

                <div style={{flex: 1}} className="remove-all-checkbox">
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
              selectedItems.map((item, ind) => {
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
};

export default Index;
