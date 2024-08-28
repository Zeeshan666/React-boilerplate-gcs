import React, { useEffect, useState, useRef } from "react";
import {
  Tooltip,
  Skeleton,
  Select,
  notification,
  Modal,
  Checkbox,
  DatePicker,
  Progress,
} from "antd";
import ReactDOMServer from "react-dom/server";
import bidShushi from "../../Services/Api/Api";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";
import moment from "moment";
import { useNavigatingAway } from "../../hooks/navigateaway";
import dayjs from "dayjs";
import bidShushiText from "../../Common/Constant";
import InfiniteScroll from "react-infinite-scroll-component";

import DialogLeavingPage from "../../hooks/leave";
import { BACKEND_DATE_FORMAT, EXTERNAL_ROLE } from "../../Common";
const { Option } = Select;
const ResponseTracker = ({
  bidDetail,
  setResponseTrackerChange,
  bidStatsMembers,
  tab
}) => {
  const { bidId } = useParams();
  const [pageNumber,setPageNumber] = useState(0);
  const [responseEmail, setResponseEmail] = useState([]);
  const [api, contextHolder] = notification.useNotification();
  const [response, setResponse] = useState([]);
  const [isLoader, setIsLoader] = useState(null);
  const [bidStages, setBidStages] = useState(null);
  const [isResponseShow, setIsResponseShow] = useState(null);
  const [isEdit, setIsEdit] = useState(null);
  const [isCancel, setIsCancel] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [ResponseStatus, setResponseStatus] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [bidType, setBidType] = useState("Word count");

  const [emailModal, setEmailModal] = useState(false);
  const [planShow, setPlanShow] = useState(false);
  const [statsShow, setStatsShow] = useState(false);
  const [totalBid, setTotalBid] = useState(false);
  const [endOFDay, setEndOFDay] = useState(false);
  const [endOFDayTable, setEndOFDayTable] = useState(false);
  const [includeAmber, setIncludeAmber] = useState(false);
  const [includeResolved, setIncludeResolved] = useState(false);
  const [showFlags, setShowFlags] = useState(false);
  const [bidStats, setBidStats] = useState(false);
  const [filteredDates, setFilteredDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState([]);
  const [bidflags, setBidFlags] = useState([]);

  const [eodUser,setEodUser]= useState([]);
  const [eodData,setEodData] = useState([])
  const [isDateError,setDateError] = useState(false);
  const [isDownloadLoader,setIsDownloadLoader] = useState(false);
  const [btnDisabled,setIsBtnDisabled] = useState(false);
  const [dataLoading,setIsDataLoading] = useState(false);
  const [hoursPerDay,setHoursPerDay] =  useState(8);
  const [allUser,setAllUser] = useState(null);

  const { user } = useAuthContext();
  const timerRef = useRef(null);

  const [canShowDialogLeavingPage, setCanShowDialogLeavingPage] =
    useState(false);

  const [showDialogLeavingPage, confirmNavigation, cancelNavigation] =
    useNavigatingAway(canShowDialogLeavingPage);

  useEffect(() => {
    getALLStats();
    const start = moment(bidDetail.startDate);
    const end = moment(bidDetail.endDate);
    const dates = [];

    let current = start.clone();
    while (moment(current).isSameOrBefore(end)&&current<=moment()) {
      if (current.day() !== 0 && current.day() !== 6) {
        // Exclude weekends (Sunday = 0, Saturday = 6)
        dates.push(current.clone().format("MMM D, YYYY"));
      }
      current.add(1, "days");
    }

    setFilteredDates(dates);
  }, []);

  useEffect(()=>{
    let data = [
      {
        id: 1,
        name: "NOT_STARTED",
        isActive: true,
        label: "Not Started",
      },
      {
        id: 2,
        name: "IN_PROGRESS",
        isActive: true,
        label: "In Progress",
      },
      {
        id: 3,
        name: "Completed",
        isActive: true,
        label: "Completed",
      },
    ];
    setResponseStatus(data)
   if(tab=="response-tracker"&& !isEdit){
    setPageNumber(0)
    //  setResponse([]);
    //  setIsLoader(true);
    // getData(true,'',0)
   }
  },[tab])
  useEffect(() => {
    //getData(true)
    let data = [
      {
        id: 1,
        name: "NOT_STARTED",
        isActive: true,
        label: "Not Started",
      },
      {
        id: 2,
        name: "IN_PROGRESS",
        isActive: true,
        label: "In Progress",
      },
      {
        id: 3,
        name: "Completed",
        isActive: true,
        label: "Completed",
      },
    ];
    setResponseStatus(data);
    if(!isEdit){
      setIsLoader(true);
    }
   
    const timer = setTimeout(() => {
      // Perform the desired action after a delay
   
      if(!isEdit){
        setResponse([])
        if (inputValue) {
          getData(false, inputValue,0);
        } else {
          getData(true,'',0);
        }
      }
     
    }, 700); // Adjust the delay time as needed

    // Clear the timer if the component unmounts or inputValue changes
    return () => clearTimeout(timer);
  }, [inputValue,tab]);

  const getResponses = () => {
    bidShushi
      .getResponseTracker(222)
      .then((res) => {})
      .catch((err) => {
        console.log(err);
      });
  };

  const getUserName=(id)=>{
    return allUser&&allUser.find(a=>a.userId==id)?.fullName||"N/A";
 };

 const getRole=(id)=>{
  return allUser&&allUser.find(a=>a.userId==id)?.role;
};

  useEffect(() => {
    let query = "";
    if (includeAmber&&showFlags) {
      // let query = "";
    //  query += `&flagLevel=`;
    }else{
      query += `&flagLevel=${1}`;
    }
    if (includeResolved&&showFlags) {
  //      query += `&flagStatus=${1}`;
    }else{
      query += `&flagStatus=${2}`;
    }

    bidShushi
      .getFlags(bidDetail.id, query)
      .then((res) => {
        console.log(res);
        setBidFlags(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [showFlags, includeAmber, includeResolved]);
  const handleBidsCall = (event) => {
    window.scrollTo({top:0})
    setIsLoader(true);
    setPageNumber(0)
    setResponse([]);
    setInputValue(event.target.value.trimStart());
  };

 

  const getData = (show = false, value = null,pa) => {
    if(dataLoading) return;
    //setIsLoader(true);
    bidShushi
      .getResponseTracker(bidId, value,pa)
      .then((res) => {
      setAllUser(res&&res?.users)
      setHoursPerDay(res&&res?.hoursPerDay)
       // console.log(res);
        setBidStages(
          res.bidStages &&
            res.bidStages
              .filter((a) => a.isChecked)
              .sort((a, b) => a.sortOrder - b.sortOrder)
        );
        let sortedStages =
          res.bidStages &&
          res.bidStages
            .filter((a) => a.isChecked)
            .sort((a, b) => a.sortOrder - b.sortOrder);
        setIsLoader(false);
        let updatedData =
          res.bidQuestions &&
          res.bidQuestions.map((a) => {
            return {
              ...a,
              bidQuestionStagesJSON: a.bidQuestionStagesJSON
                .filter((b) => b.isChecked)
                .sort((a, b) => a.sortOrder - b.sortOrder),
            };
          });
        let newUpdatedData = updatedData.map((a) => {
          return {
            ...a,
            bidQuestionStagesJSON: sortedStages.map((i, j) => {
              const stage = a.bidQuestionStagesJSON.find(stage => stage.bidStageId === i.id || stage.id === i.id)
              if (
                stage
              ) {
                return{...stage, isEdit: isEdit};
              } else {
                return { isChecked: false };
              }
            }),
          };
        });
       // console.log(newUpdatedData, sortedStages);
        setResponse((preState)=>{
          return [...preState,...newUpdatedData]
        });
        setCanShowDialogLeavingPage(false);
        setShowModal(false);
        setResponseTrackerChange(false);
        if(isEdit){
          setIsEdit(isEdit);
        }
        if (res && res.isPlanGenerated && show) {
          setIsResponseShow(true);
        }
        setTimeout(()=>{
          setIsDataLoading(false)
        },700)
      })
      .catch((err) => {
        setIsLoader(false);
        console.log(err);
        api.success({
          message: "Unable to get response tracker",
        });
      });
  };
  const getALLData = (show = false, value = null,p=false) => {
    setIsBtnDisabled(true);
    bidShushi
       .getResponseTracker(bidId, '',0,-1)
       .then((res) => {
        // console.log(res);
        setIsBtnDisabled(false);
         setBidStages(
           res.bidStages &&
             res.bidStages
               .filter((a) => a.isChecked)
               .sort((a, b) => a.sortOrder - b.sortOrder)
         );
         let sortedStages =
           res.bidStages &&
           res.bidStages
             .filter((a) => a.isChecked)
             .sort((a, b) => a.sortOrder - b.sortOrder);
         setIsLoader(false);
         let updatedData =
           res.bidQuestions &&
           res.bidQuestions.map((a) => {
             return {
               ...a,
               bidQuestionStagesJSON: a.bidQuestionStagesJSON
                 .filter((b) => b.isChecked)
                 .sort((a, b) => a.sortOrder - b.sortOrder),
             };
           });
         let newUpdatedData = updatedData.map((a) => {
           return {
             ...a,
             bidQuestionStagesJSON: sortedStages.map((i, j) => {
               const stage = a.bidQuestionStagesJSON.find(stage => stage.bidStageId === i.id || stage.id === i.id);
               if (stage) {
                 return { ...stage, isEdit: isEdit };
               } else {
                 return { isChecked: false,  };
               }
             })
           };
         });
         setResponseEmail(newUpdatedData)    
         if(isEdit){
           setIsEdit(isEdit);
         }
         if (res && res.isPlanGenerated && show) {
           setIsResponseShow(true);
         }
       })
       .catch((err) => {
         setIsLoader(false);
         console.log(err);
       });
   };

  useEffect(() => {
    if (bidDetail && bidDetail.questionLimitType == "WORD_COUNT") {
      setBidType("Word count");
    } else {
      setBidType("Page count");
    }
  }, [bidDetail]);

  const editResponse = () => {
    setIsEdit(true);
    setIsLoader(true);
    console.log(response);
    let updatedResponse = response.map((a) => {
      return {
        ...a,
        bidQuestionStagesJSON:
          a.bidQuestionStagesJSON &&
          a.bidQuestionStagesJSON.map((b) => {
            return {
              ...b,
              isEdit: true,
            };
          }),
      };
    });
    // console.log(updatedResponse);
   setResponse(updatedResponse);
    setTimeout(()=>{
      setIsLoader(false)
    },10)
  };

  const saveResponse = () => {
    setIsEdit(false);
    let filterToBack = response
      .filter((a) => a.isChanged)
      .map((a) => {
        return {
          ...a,
          bidQuestionStagesJSON:
            a.bidQuestionStagesJSON &&
            a.bidQuestionStagesJSON.filter((b) => b.isChanged),
        };
      });

    let updatedResponse = response.map((a) => {
      return {
        ...a,
        isChanged: false,
        bidQuestionStagesJSON:
          a.bidQuestionStagesJSON &&
          a.bidQuestionStagesJSON.map((b) => {
            return {
              ...b,
              isEdit: false,
              isChanged: false,
            };
          }),
      };
    });

    let sendingData = filterToBack.map((a) => {
      return {
        ...a,
        isChanged: false,
        bidQuestionStagesJSON:
          a.bidQuestionStagesJSON &&
          a.bidQuestionStagesJSON.map((b) => {
            return {
              ...b,
              isChanged: false,
              isEdit: false,
            };
          }),
      };
    });
    setResponse(updatedResponse);

    let data = {
      bidQuestions: sendingData,
    };

    bidShushi
      .updateResponseTracker(data, bidId)
      .then((res) => {
      //  console.log(res);
        getALLStats();
        api.success({
          message: `Success`,
          description: bidShushiText.responseAdded,
        });
      })
      .catch((err) => {
        api.success({
          message: `failed`,
          description: "Response not updated  successfully.",
        });
      });
    setResponseTrackerChange(false);
    setCanShowDialogLeavingPage(false);
    setShowModal(false);
    setResponse(updatedResponse);
  };



  const changeStatues = (e, index, ind) => {
    // console.log(e, index, ind);
     setCanShowDialogLeavingPage(true);
     let updatedBid = response.map((a, i) => {
       if (i === index) {
         let updatedA = { ...a, isChanged: true };
         let updatedStages = a.bidQuestionStagesJSON.map((b, c) => {
           if (c === ind) {
             let updatedB = {
               ...b,
               isChanged: true,
               responseTrackerStatusId: e,
             };
             updatedB.responseTrackerStatus = ResponseStatus.find((rs) => rs.id === e);
             return updatedB;
           }
           return b;
         });
         updatedA.bidQuestionStagesJSON = updatedStages;
         return updatedA;
       }
       return a;
     });
     
     
     setResponseTrackerChange(true);
     setResponse(updatedBid);
   };

   const cancelGenerate = (handle = false) => {
    if (canShowDialogLeavingPage) {
      setShowModal(true);
      return;
    }
    setShowModal(false);
    setIsEdit(false);
    setResponseTrackerChange(false);
    //getData(false);
    let updatedResponse = response.map((a) => {
      return {
        ...a,
        bidQuestionStagesJSON:
          a.bidQuestionStagesJSON &&
          a.bidQuestionStagesJSON.map((b) => {
            return {
              ...b,
              isEdit: false,
            };
          }),
      };
    });
    // console.log(updatedResponse);
    setResponse(updatedResponse);
  };

  const cancelModal = () => {
    setShowModal(false);
  };
  const getLabel = (id = 1) => {
    return ResponseStatus.find((a) => a.id == id)?.label;
  };

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
    if (endOFDay && selectedDate != null) {
      setIsBtnDisabled(true);
      bidShushi
        .getEodData(bidDetail?.id, selectedDate)
        .then((res) => {
          setEodUser(res?.bidMembers);
          setEodData(res?.eodUpdate);
          setIsBtnDisabled(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [selectedDate]);

  const cancelEmailModal = () => {
    setEmailModal(false);
    setStatsShow(false);
    setTotalBid(false);
    setEndOFDayTable(false);
    setEndOFDay(false);
    setIncludeAmber(false);
    setIncludeResolved(false)
    setSelectedDate(false)
    setShowFlags(false)

  }


  const openEmlFileInOutlook = () => {
    if (selectedDate == null && endOFDay) {
      setIsDownloadLoader(false);
      setDateError(true);
      return;
    }
    if (selectedDate && endOFDay && eodData && eodUser) {
      setIsDownloadLoader(false);
    }
    setIsDownloadLoader(false);
    const headerString =
      bidStages &&
      bidStages
        .map(
          (stage) =>
            `<th scope="col" width="160" style="text-align: left; vertical-align: middle; padding: 15px;">${stage.name}</th>`
        )
        .join("");

    const flagsStatusDetail =
      bidflags && bidflags.length > 0
        ? bidflags
            .map((stage, index) => {
              return (
                "<tr>" +
                "<td>" +
                (index + 1) +
                "</td>" +
                "<td>" +
                (stage ? stage.issueDetail : "") +
                "</td>" +
                "<td>" +
                (stage ? stage.dateReported : "") +
                "</td>" +
                "<td>" +
                (stage && stage.flagLevel ? stage.flagLevel.name : "") +
                "</td>" +
                "<td>" +
                (stage && stage.flagStatus ? stage.flagStatus.name : "") +
                "</td>" +
                "</tr>"
              );
            })
            .join("")
        : '<tr><td colspan="5" style="text-align:center "><div>No Flags Available.</div></td></tr>';

    const eodView =
      eodUser && eodUser.length > 0
        ? eodUser &&
          eodUser
            .map((eod, i) => {
              return (
                "<tr>" +
                '<td style="border: 1px solid #eee;">' +
                (eod ? eod.fullName : "") +
                "</td>" +
                '<td style="border: 1px solid #eee;">' +
                (eod && eodData.find((a) => a.createdByUserId == eod.userId)
                  ? eodData.find((a) => a.createdByUserId == eod.userId)
                      ?.messageText
                  : "N/A") +
                "</td>" +
                "</tr>"
              );
            })
            .join("")
        : '<tr><td colspan="5" style="text-align:center "><div>No Users Available.</div></td></tr>';

    let bodyTracker =
    responseEmail  &&
    responseEmail.length > 0 &&
    responseEmail 
        .map((a, index) => {
          let tableRows = "";
          a.bidQuestionStagesJSON.forEach((s, ind) => {
            let cellContent = "";
            if (
              user &&
              user.userRoleId == 1 &&
              user &&
              user.id == bidDetail?.bidManagerId
            ) {
              if (s.isChecked && !s.isEdit && !s.responseTrackerStatusId) {
                cellContent = `
                  <table>
                    <tr>
                      <td class="box" style="padding: 8pt;">
                        Not Started<br />
                        <span class="bm-name">(${getUserName(s.bidMember?.user?.id)})</span><br />
                        <span class="bm-name">${moment(s?.date).format(
                          "ddd, MMM D, YYYY"
                        )}</span>
                      </td>
                    </tr>
                  </table>
                `;
              } else if (
                s.isChecked &&
                !s.isEdit &&
                s.responseTrackerStatusId
              ) {
                cellContent = `
                  <table>
                    <tr>
                      <td style="padding: 8pt;" class="${
                        s.responseTrackerStatus?.name == "IN_PROGRESS"
                          ? "yellow box"
                          : s.responseTrackerStatus?.name == "NOT_STARTED" ||
                            !s.responseTrackerStatus?.name
                          ? "box"
                          : "green box"
                      }">
                        ${
                          s.responseTrackerStatus?.name == "IN_PROGRESS"
                            ? "In Progress "
                            : s.responseTrackerStatus?.name == "NOT_STARTED" ||
                              !s.responseTrackerStatus?.name
                            ? "Not Started "
                            : "Completed"
                        }<br />
                        <span class="bm-name">(${getUserName(s.bidMember?.userId)})</span><br/>
                        <span class="${
                          s.responseTrackerStatus?.name == "NOT_STARTED" ||
                          !s.responseTrackerStatus?.name
                            ? "bm-name "
                            : "hide"
                        }">${moment(s?.date).format("ddd, MMM D, YYYY")}</span>
                      </td>
                    </tr>
                  </table>
                `;
              } else {
                cellContent = `
                  <table>
                    <tr>
                      <td class="box" style="text-align: center; padding: 8pt;">N/A</td>
                    </tr>
                  </table>
                `;
              }
            } else if (user && user.id != bidDetail?.bidManagerId) {
              if (s.isChecked && !s.isEdit && !s.responseTrackerStatusId) {
                cellContent = `
                  <table>
                    <tr>
                      <td class="box" style="padding: 8pt;">
                        Not Started<br />
                        <span class="bm-name">(${getUserName(s.bidMember?.userId)})</span><br />
                        <span class="bm-name">${moment(s?.date).format(
                          "ddd, MMM D, YYYY"
                        )}</span>
                      </td>
                    </tr>
                  </table>
                `;
              } else if (
                s.isChecked &&
                !s.isEdit &&
                s.responseTrackerStatusId
              ) {
                cellContent = `
                  <table>
                    <tr>
                      <td style="padding: 8pt;" class="${
                        s.responseTrackerStatus?.name == "IN_PROGRESS"
                          ? "yellow box"
                          : s.responseTrackerStatus?.name == "COMPLETED" ||
                            "Completed"
                          ? "green box"
                          : "box"
                      }">
                    
                      ${
                        s.responseTrackerStatus?.name == "IN_PROGRESS"
                          ? "In Progress "
                          : s.responseTrackerStatus?.name == "COMPLETED" ||
                            "Completed"
                          ? "Completed "
                          : "Not Started "
                      }(${s.bidMemberName}) <br/>
                      <span class="bm-name">${moment(s?.date).format(
                        "ddd, MMM D, YYYY"
                      )}</span>
                      </td>
                    </tr>
                  </table>
                `;
              } else if (!s.isChecked) {
                cellContent = `<div style="text-align: center;">N/A</div>`;
              } else {
                cellContent = `
                  <div>
                    ${s.responseTrackerStatus?.id}
                  </div>
                `;
              }
            }

            tableRows += `
              <td>
                ${cellContent}
              </td>
            `;
          });

          return `
            <tr>
              <td>
                <table>
                  <tr>
                    <td class="priority-name">
                      ${a?.questionPriority?.name || "N/A"}
                    </td>
                  </tr>
                </table>
              </td>
              <td>
                <table>
                  <tr>
                    <td class="q-no" style="background-color: ${a?.color}">
                      ${a?.questionNumber || "N/A"}
                    </td>
                  </tr>
                </table>
              </td>
              <td scope="row">
                <div class="q-name">
                  ${
                    a?.questionName
                      ? "<strong>" + a?.questionName + "</strong>"
                      : "N/A"
                  }<br /><br />
                </div>
                <div class="q-f-name">
                  <strong>Owner:</strong> ${a?.questionOwner?.fullName || "N/A"}
                </div>
                <div class="q-f-name">
                  <strong>Word Count:</strong> ${a?.wordCount || "N/A"}
                </div>
                <div class="q-f-name">
                  <strong>Weighting:</strong> ${a?.weighting || "N/A"}
                </div>
              </td>
              ${tableRows}
            </tr>
          `;
        })
        .join("");
    let endOFDayTableJSX = "";

    if (endOFDayTable) {
      endOFDayTableJSX = `<h3 style="padding-left: 16px">Please find below the current status of responses:</h3>
         <table className="table" cellspacing="0"
        cellpadding="0">
        <thead>
         <tr>
          <th scope="col" width="60" style="text-align: left; vertical-align: middle; padding: 10px 15px;">
             Priority
           </th>
           <th scope="col" width="60" style="text-align: left; vertical-align: middle; padding: 10px 15px;">
             Qn no.
           </th>
           <th scope="col" width="380" style="text-align: left; vertical-align: middle; padding: 10px 15px;">Description
           </th>
            ${headerString}
         </tr>
       </thead>
        ${bodyTracker}       
         </table> `;
    }

    let FlagsJsx = "";
    let flagHeading = "";
    const isRedFlagsExist =
      bidflags &&
      bidflags.length &&
      bidflags.some((a) => a?.flagLevel?.name == "Red");
    console.log(isRedFlagsExist);
    if (isRedFlagsExist) {
      flagHeading = `<h3 style="padding-left: 16px">Issues flagged as Red will seriously impact the bid unless resolved!
      </h3>`;
    }

    if (showFlags) {
      FlagsJsx = ` <div>
          <p style="padding-left: 16px; margin-bottom: 0px;">Please be aware of the following Issues:</p>
        
           ${flagHeading}
          <table class="user-list" cellpadding="10" cellspacing="0" style="border: 1px solid #eee; text-align: left;" >
            <thead>
              <tr>
                <th scope="col" width="30" style="padding: 10px 15px; text-align: left; background-color: #f5466f; color:#fff">No</th>
                <th scope="col" width="500" style="padding: 10px 15px; text-align: left; background-color: #f5466f; color:#fff">Issue</th>
                <th scope="col" width="190" style="padding: 10px 15px; text-align: left; background-color: #f5466f; color:#fff">Date Started</th>
                <th scope="col" width="190" style="padding: 10px 15px; text-align: left; background-color: #f5466f; color:#fff">Level</th>
                <th scope="col" width="190" style="padding: 10px 15px; text-align: left; background-color: #f5466f; color:#fff">Status</th>
              </tr>
            </thead>
            ${flagsStatusDetail}
          </table>
          <br/>
          <br/>
        </div>
      `;
    }

    let endOFDayJSX = "";
    if (endOFDay) {
      endOFDayJSX = `
        <div>
          <h3 style="padding-left: 16px">${selectedDate} Progress:</h3>
          <br />
          <table class="user-list eod-tbl" style="border: 1px solid #eee; text-align: left;" cellpadding="10" cellspacing="0">
            <tr>
              <th width="400" style="text-align: left; vertical-align: middle; padding: 10px 15px; border: 1px solid #eee; background-color: #f5f5f5;" >Name</th>
              <th width="300" style="text-align: left; vertical-align: middle; padding: 10px 15px; background-color: #f5466f; color:#fff; border: 1px solid #f5466f">Status</th>
            </tr>
            ${eodView}
          </table>
          <br/>
          <br/>
        </div>
      `;
    }
    let ProgressBar="";
    if(totalBid && bidStats?.bidCompletion>0){
     ProgressBar = `

      <tr>
        <td>
          <table width="250" cellpadding="0" cellspacing="0" style="height: 30px;">
            <tr>
            <td bgcolor="#f83f83"  class=${bidStats?.bidCompletion>=100?"color-green":"color-yellow"} style="width:${bidStats?.bidCompletion+'%'}; float:left; height:10pt; padding:0px; border: none;"></td>
            <td bgcolor="#cccccc" style="width:50%; background-color:#cccccc; float:left; height:10pt; padding:0px; border: none;"></td>
            </tr>
          </table>
        </td>

       
        </tr>`;
    }
    const statsTableClass = statsShow ? "show" : "hide";
    const statsTable = statsShow
      ? '<table class="' +
        statsTableClass +
        '" cellpadding="10" cellspacing="0" style="border: 1px solid #eee;">' +
        "<tr>" +
        '<th colspan="3" style="text-align: center; vertical-align: middle; padding: 10px 15px; color: #000; font-weight: 700;">Bid Stats</th>' +
        "</tr>" +
        "<tr>" +
        '<th colspan="1" width="300" style="text-align: left; vertical-align: middle; padding: 10px 15px; background-color: #f5466f; color:#fff">Basic Info</th>' +
        '<th colspan="1" width="300" style="text-align: left; vertical-align: middle; padding: 10px 15px; background-color: #f5466f; color:#fff">Response Stats</th>' +
        '<th colspan="1" width="200" style="text-align: left; vertical-align: middle; padding: 10px 15px; background-color: #f5466f; color:#fff">Words</th>' +
        "</tr>" +
        '<tr class="' +
        statsTableClass +
        '">' +
        "<td>" +
        '<div class="small">Total Days</div>' +
        "<div>" +
        (bidStats?.totalDays || "0") +
        "</div>" +
        "</td>" +
        "<td>" +
        '<div class="small">Questions</div>' +
        "<div>" +
        (bidStats?.totalBidQuestions || "0") +
        "</div>" +
        "</td>" +
        "<td>" +
        '<div class="small">Total Words</div>' +
        "<div>" +
        (bidStats?.totalWords || "0") +
        "</div>" +
        "</td>" +
        "</tr>" +
        '<tr class="' +
        statsTableClass +
        '">' +
        "<td>" +
        '<div class="small">Days Remaining</div>' +
        "<div>" +
        (bidStats?.totalDays - bidStats?.days || "0") +
        "</div>" +
        "</td>" +
        "<td>" +
        '<div class="small">Questions Complete</div>' +
        "<div>" +
        (bidStats?.completedBidQuestions || "0") +
        "</div>" +
        "</td>" +
        "<td>" +
        '<div class="small">Words Written</div>' +
        "<div>" +
        (bidStats?.totalWords - bidStats?.remainingWords || "0") +
        "</div>" +
        "</td>" +
        "</tr>" +
        '<tr class="' +
        statsTableClass +
        '">' +
        "<td>" +
        '<div class="small">Team Size</div>' +
        "<div>" +
        (bidStats?.totalTeamMembers || "0") +
        "</div>" +
        "</td>" +
        "<td>" +
        '<div class="small">Questions % Complete</div>' +
        "<div>" +
        (bidStats?.questionsCompletionPercentage + "%" || "0") +
        "</div>" +
        "</td>" +
        "<td>" +
        '<div class="small">Words Remaining</div>' +
        "<div>" +
        (bidStats?.remainingWords || "0") +
        "</div>" +
        "</td>" +
        "</tr>" +
        '<tr class="' +
        statsTableClass +
        '">' +
        "<td>" +
        '<div class="small">Words/Person</div>' +
        "<div>" +
        (bidStats?.wordsPerPerson || "0") +
        "</div>" +
        "</td>" +
        "<td></td>" +
        "<td>" +
        '<div class="small">% Words Written</div>' +
        "<div>" +
        (bidStats?.wordsWrittenPercent + "%" || "0") +
        "</div>" +
        "</td>" +
        "</tr>" +
        '<tr class="' +
        statsTableClass +
        '">' +
        "<td>" +
        '<div class="small">Words/Person/Day</div>' +
        "<div>" +
        (bidStats?.wordsPerPersonPerDay || "0") +
        "</div>" +
        "</td>" +
        "<td></td>" +
        "<td></td>" +
        "</tr>" +
        "</table>"
      : "";

    const emailContent = `
      <html>
        <body  style="overflow-x: scroll;width:20000px">
        <style>

        @import url("https://fonts.googleapis.com/css2?family=Lato&display=swap");
        body{
            font-family: "Lato", Arial;
            padding: 0px 20px;
            white-space: nowrap !important;
            word-break: keep-all !important;
            
        }
  table {
    text-align: left;
    table-layout: fixed;
              white-space: nowrap !important;
            word-break: keep-all !important;
  }
 
  th {
    color: #747474;
    font-size: 13px;
    font-weight: 600;
    text-transform: capitalize;
    text-align: left;
    padding: 0px 10px;
    vertical-align : middle;
  }
  td{
    height: 40px;
    vertical-align : middle;
    font-size: 13px;
    font-weight: 400;
    padding: 10px 15px;
  }

  span {
    font-size: 14px;
    font-weight: 600;
  }
  .small {
    font-size: 12px;
    margin-bottom: 5px;
    display: block;
    font-weight: 800;
  }
  .hide{
   display:none;
  }
  .show{
   display:inline
  }

  .you{
    color: red;
    font-size: 10px;
    padding: 1pt;
    border: 1px solid red;
    font-style: normal;
    margin : 5px;
  }

  strong{
    min-width: 1000px;
  }

  .box{
    background-color: #efeeee;
    padding: 30px;
    width: 200pt;
    height: 45pt;
    display: block;
    color: #7a7a7a;
    font-size: 12px;
    font-weight: 600;
  }

  .green{
    color: #7a7a7a;
    font-size: 12px;
    background-color: #e6ffea;
    padding: 30px;
    height: 45pt;
    display: block;
    width: 200pt;
    height: 35pt;
    font-weight: 600;
  }
  .yellow{
    background-color: #fbefd9;
    color: #7a7a7a;
    font-size: 12px;
    padding: 30px;
    width: 200pt;
    height: 45pt;
    display: block;
    font-weight: 600;
  }
  .q-no{
    background-color: #7814ff;
    color: #fff;
    padding: 0px 8pt;
  }
  .q-name{
    font-size: 14px;
    font-weight: 700;
    font-weight: 900;
  }
  .q-name strong{

  }
  .q-f-name{
    font-size: 11px;
    color: #333;
  }
  .eod-tbl td{
    border: 1px solid #ebebeb;
  }
  .bm-name{
    font-size: 10px;
    font-weight: 500;
    display: block;
  }
  .priority-name{
    background-color: #f3f3f3;
    color: #000;
    padding: 0px 8pt;
  }
  .color-green{
    background-color: #45c62e;
  }
  .color-yellow{
    background-color: #ec9c09;
  }
  .progress-bar{
    height: 40px;
  }
</style>
      <p>Hello,<p>
      <p>[Replace this text with a personlized text]</p>
      ${endOFDayTableJSX} 
      ${endOFDayJSX}
      ${FlagsJsx}
      ${statsTable}
       <br /> 
       <br />

    <table  cellpadding="0" cellspacing="0" class=${
      totalBid ? "show" : "hide progress-bar"
    } style="text-align: left; border: 1px solid #eee;">

    <tr>
     <th style="text-align: center; vertical-align: middle; padding: 10px 15px; background-color: #f5466f; color:#fff" width="220">Total Bid Completion</th>
   </tr>

   <tr>
      <td align="center"style="text-align: center;  padding:10px 0px 0px 0px; height: 20px; vertical-align: bottom; border:none; font-weight: 700; font-size: 20px">${bidStats?.bidCompletion +'%' || "-"}</td>
    </tr>

    ${ProgressBar}
    
  </table>

  <br /> <br/>
  


  <br />
       <br />
        </body>
     
       
      </html>
    `;
    var emlContent = "data:message/rfc822 eml;charset=utf-8,";
    emlContent += "To: " + user?.email + "\n";
    emlContent += "Subject: " + "Kittle Group End of Day Update" + "\n";
    emlContent += "X-Unsent: 1" + "\n";
    emlContent += "Content-Type: text/html" + "\n";
    emlContent += "Content-Transfer-Encoding: base64" + "\n";
    emlContent += "" + "\n";
    emlContent += btoa(emailContent);

    var encodedUri =
      "data:message/rfc822;charset=utf-8," + encodeURIComponent(emlContent);
    emlContent += emailContent;

    var a = document.createElement("a"); //make a link in document
    var linkText = document.createTextNode("fileLink");
    a.appendChild(linkText);
    a.href = encodedUri;
    a.id = "fileLink";
    a.download = "Kittle Group End of Day Update.eml";
    a.style = "display:none;"; //hidden link

    ///    var mailtoURL = 'mailto:?attach=' + encodeURIComponent(a.download);

    //  // Create a hidden anchor element
    //var mailtoURL = 'mailto:?attach=' + encodeURIComponent(emlFilePath);
    //   window.location.href = mailtoURL;
    //var link = document.createElement("a");
    //link.setAttribute("class", "email-link");
    //link.setAttribute("href", mailtoURL);
    // var link = document.createElement("a");
    // link.setAttribute("class", "email-link");
    // link.setAttribute("href", mailtoURL);
    // Trigger a click event on the anchor element
    // link.click();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // document.body.removeChild(link);
    cancelEmailModal();
    api.success({
      message: "Success",
      description: "Email has been generated successfully",
    });
  };

  const conversionToHours=(wordEquivRt)=>{
    if(wordEquivRt == 1){
      return  "Full day"
    } 
    // else if (wordEquivRt > 1){
    //   return  wordEquivRt + " day"
    // }
     else {
      return  wordEquivRt*hoursPerDay + " hours"
    }
  }

  return (
    <div>
      {" "}
      {contextHolder}
      <DialogLeavingPage
        showDialog={showDialogLeavingPage}
        setShowDialog={setCanShowDialogLeavingPage}
        confirmNavigation={confirmNavigation}
        cancelNavigation={cancelNavigation}
      />
         {isDownloadLoader && (
        <div className="lds-ripple loader">
          <div></div>
        </div>
      )}
      <div className="tab-content mt-0">
        {isResponseShow && (
          <div className="form-wrapper">
            <div className="row">
              <div className="form-group col-5">
                <div className="search-group">
                  <input
                    type="text"
                    className={
                      !response.length && !isLoader && !isResponseShow
                        ? "disabled form-control mt-2"
                        : "form-control mt-2"
                    }
                    placeholder="Search..."
                    value={inputValue}
                    onChange={(e) => handleBidsCall(e)}
                  />
                  <i className="fa fa-search"></i>
                </div>
              </div>
              <div className="col-7 text-end">
                {bidDetail.bidStatusId == 2 &&
                user.id == bidDetail?.bidManagerId && !isEdit? (
                  <a
                    onClick={() => {
                      setEmailModal(true);
                    }}
                    className="text-blue text-center d-inline-block me-3"
                  >
                    <img src="/images/email-round.png" />
                    <br />
                    <span>Generate Email</span>
                  </a>
                ) : (
                  ""
                )}
                {((bidStatsMembers &&
                  bidStatsMembers.bid?.bidMembers.find(
                    (member) =>
                      member.userId == user.id &&
                      bidDetail &&
                      bidDetail.bidStatusId == 2
                  )) ||
                  (bidDetail.bidManagerId == user.id &&
                    bidDetail.bidStatusId == 1) ||
                  (bidDetail.bidManagerId == user.id &&
                    bidDetail &&
                    bidDetail.bidStatusId == 2)) && (
                  <>
                    {!isEdit ? (
                      <a
                        onClick={editResponse}
                        className="text-primary text-center d-inline-block"
                      >
                        <img src="/images/edit-round.png" />
                        <br />
                        <span>Enter Response</span>
                      </a>
                    ) : (
                      <>
                        {" "}
                        <a
                          onClick={() => {
                            cancelGenerate(false);
                          }}
                          className="text-primary text-center d-inline-block me-4"
                        >
                          <img src="/images/cancel-round.png" />
                          <br />
                          <span className="text-para">Cancel</span>
                        </a>{" "}
                        <a
                          onClick={saveResponse}
                          className="text-primary text-center d-inline-block me-3"
                        >
                          <img src="/images/save-round.png" />
                          <br />
                          <span>Save </span>
                        </a>{" "}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
           <div id="test" className="table-responsive user-list tracker-table">
          <InfiniteScroll
            dataLength={response.length}
            next={() => {
              setTimeout(() => {
                if (isLoader) return;
                getData(false, inputValue, pageNumber + 1);
                setPageNumber((preState) => preState + 1);
              }, 800);
              console.log("sss", pageNumber + 1);
            }}
            scrollThreshold={0.9}
            hasMore={true}
            scrollableTarget="test"
          >
            {!isLoader && (
              <table className="table">
                {
                  <thead>
                    <tr>
                      {isResponseShow && (
                        <>
                          <th width="60">Priority</th>
                          <th width="60">Qn no.</th>
                          <th width="380">Description</th>
                        </>
                      )}
                      {bidStages &&
                        bidStages.map((stage) => {
                          return (
                            <th scope="col" width="160">
                              {stage.name}
                            </th>
                          );
                        })}
                    </tr>
                  </thead>
                }

                <tbody>
                  {response &&
                    response.length > 0 &&
                    response.map((a, index) => {
                      return (
                        <tr>
                          <td>
                            <span className="priority-number">
                              {" "}
                              {a?.questionPriority?.name || "N/A"}
                            </span>
                          </td>
                          <td>
                            <span
                              className="rounded-number"
                              style={{ backgroundColor: a.color }}
                            >
                              {" "}
                              {a?.questionNumber || "N/A"}
                            </span>
                          </td>
                          <td scope="row">
                            <div className="question-title">
                              {a?.questionName ? (
                                <Tooltip
                                  title={a?.questionName}
                                  placement="topLeft"
                                  color="#fff"
                                >
                                  <span className="main-question">
                                    {a?.questionName}
                                  </span>
                                </Tooltip>
                              ) : (
                                "N/A"
                              )}

                              <div className="row">
                                <div className="col-4 owner">
                                  <span className="sub-question">Owner:</span>
                                  <span className="sub-question dark-para">
                                    <Tooltip
                                      color="#fff"
                                      placement="topLeft"
                                      title={
                                        bidDetail &&
                                        bidDetail?.bidMembers.find(
                                          (member) =>
                                            member.userId ==
                                            a?.questionOwner?.id
                                        )?.user?.fullName
                                      }
                                    >
                                      {(bidDetail &&
                                        bidDetail?.bidMembers.find(
                                          (member) =>
                                            member.userId ==
                                            a?.questionOwner?.id
                                        )?.user?.fullName) ||
                                        "N/A"}
                                    </Tooltip>
                                  </span>
                                </div>
                                <div className="col-4 word-count">
                                  <span className="sub-question">
                                    {bidType == "Word count"
                                      ? "Word Count:"
                                      : "Page Count:"}{" "}
                                  </span>
                                  <span className="sub-question dark-para">
                                    {a?.wordCount || "N/A"}
                                  </span>
                                </div>

                                <div className="col-4 weighting">
                                  <span className="sub-question">
                                    Weighting:
                                  </span>
                                  <span className="sub-question dark-para">
                                    {a?.weighting || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {a.bidQuestionStagesJSON &&
                            a.bidQuestionStagesJSON.map((s, ind) => {
                              return (
                                <>
                                  {user &&
                                    user.userRoleId == 1 &&
                                    user &&
                                    user.id == bidDetail?.bidManagerId && (
                                      <td>
                                        {s.isChecked &&
                                        !s.isEdit &&
                                        !s.responseTrackerStatusId ? (
                                          <span className="tag-not-started">
                                            <Tooltip
                                              color="#fff"
                                              title={
                                                <span className="dark-para">
                                                  {getUserName(s.bidMember?.userId)|| "N/A"}           
                                                  <span >{getRole(s.bidMember?.userId)== EXTERNAL_ROLE ? (
                                                   <>  <br/>
                          <span className="tag tag-blue">
                            External </span></>
                        ) : (
                          ""
                        )}</span>
                                                  <br />
                                                  {s?.label || 0}
                                                </span>
                                              }
                                            >
                                              Not Started{" "}
                                            </Tooltip>

                                            {user &&
                                              user.id ==
                                                s?.bidMember?.userId && (
                                                <span class="tag tag-primary ms-1">
                                                  You
                                                </span>
                                              )}
                                            {moment().diff(s?.date, "days") >
                                            0 ? (
                                              <Tooltip
                                                color="red"
                                                title="Overdue"
                                              >
                                                <i className="fa fa-exclamation-triangle text-danger ms-2"></i>
                                              </Tooltip>
                                            ) : null}
                                            <br />
                                            <small className="text-para">
                                              {moment(s?.date).format(
                                                "ddd, MMM D, YYYY"
                                              )}
                                            </small>
                                          </span>
                                        ) : s.isChecked &&
                                          !s.isEdit &&
                                          s.responseTrackerStatusId ? (
                                          <>
                                            <span
                                              className={
                                                s.responseTrackerStatusId == 1
                                                  ? "tag-not-started tag-na"
                                                  : s.responseTrackerStatusId ==
                                                    2
                                                  ? "completed tag-na"
                                                  : "in-progress tag-na"
                                              }
                                            >
                                              <Tooltip
                                                color="#fff"
                                                title={
                                                  <span className="dark-para">
                                                    {getUserName(s.bidMember?.userId) || "N/A"}
                                                    <span >{getRole(s.bidMember?.userId) == EXTERNAL_ROLE ? (
                                                   <>  <br/>
                          <span className="tag tag-blue">
                            External </span></>
                        ) : (
                          ""
                        )}</span>
                                                    
                                                    <br />
                                                    {s?.label || 0}
                                                  </span>
                                                }
                                              >
                                                {getLabel(
                                                  s.responseTrackerStatus?.id
                                                )}
                                              </Tooltip>
                                              {user &&
                                                user.id ==
                                                  s?.bidMember?.userId && (
                                                  <span class="tag tag-primary ms-1 you-margin align-top">
                                                    You
                                                  </span>
                                                )}
                                              {(s.responseTrackerStatusId ==
                                                2 ||
                                                s.responseTrackerStatusId ==
                                                  1) &&
                                              moment().diff(s?.date, "days") >
                                                0 ? (
                                                <Tooltip
                                                  color="red"
                                                  title="Overdue"
                                                >
                                                  <i className="fa fa-exclamation-triangle text-danger ms-2"></i>
                                                </Tooltip>
                                              ) : null}
                                              {s.responseTrackerStatusId ==
                                                1 && (
                                                <small>
                                                  <br />
                                                  {moment(s?.date).format(
                                                    "ddd, MMM D, YYYY"
                                                  )}
                                                </small>
                                              )}

                                              {/* <br /> */}
                                            </span>
                                          </>
                                        ) : s.isChecked && s.isEdit ? (
                                          <>
                                            <Select
                                              className="form-select mt-3"
                                              onChange={(e) =>
                                                changeStatues(e, index, ind)
                                              }
                                              value={
                                                s.responseTrackerStatus?.id || 1
                                              }
                                            >
                                              {ResponseStatus.map((item) => {
                                                return (
                                                  <Option
                                                    key={item.id}
                                                    value={item.id}
                                                    label={item.label}
                                                  >
                                                    {item.label}
                                                  </Option>
                                                );
                                              })}
                                            </Select>
                                            <br />
                                          </>
                                        ) : (
                                          <>
                                            <span className="tag-na">
                                              N/A
                                              {/* {moment(s?.date).format(
                                        "ddd, MMM D, YYYY"
                                      )} */}
                                            </span>
                                            <br />
                                          </>
                                        )}
                                      </td>
                                    )}

                                  {user &&
                                    user.id != bidDetail?.bidManagerId && (
                                      <td>
                                        {s.isChecked &&
                                        !s.isEdit &&
                                        !s.responseTrackerStatusId ? (
                                          <span className="tag-not-started">
                                            <Tooltip
                                              color="#fff"
                                              title={
                                                <span className="dark-para">
                                                  {getUserName(s.bidMember?.userId)|| "N/A"}
                                                  <span >{getRole(s.bidMember?.userId) == EXTERNAL_ROLE ? (
                                                   <>  <br/>
                          <span className="tag tag-blue">
                            External </span></>
                        ) : (
                          ""
                        )}</span>
                                                  <br />
                                                  {s?.label || 0}
                                                </span>
                                              }
                                            >
                                              Not Started{" "}
                                            </Tooltip>
                                            {user &&
                                              user.id ==
                                                s?.bidMember?.userId && (
                                                <span class="tag tag-primary ms-1">
                                                  You
                                                </span>
                                              )}
                                            {moment().diff(s?.date, "days") >
                                            0 ? (
                                              <Tooltip
                                                color="red"
                                                title="Overdue"
                                              >
                                                <i className="fa fa-exclamation-triangle text-danger ms-2"></i>
                                              </Tooltip>
                                            ) : null}
                                            <br />
                                            <small className="text-para">
                                              {moment(s?.date).format(
                                                "ddd, MMM D, YYYY"
                                              )}
                                            </small>
                                          </span>
                                        ) : s.isChecked &&
                                          !s.isEdit &&
                                          s.responseTrackerStatusId ? (
                                          <>
                                            <span
                                              className={
                                                s.responseTrackerStatusId == 1
                                                  ? "tag-not-started tag-na"
                                                  : s.responseTrackerStatusId ==
                                                    2
                                                  ? "completed tag-na"
                                                  : "in-progress tag-na"
                                              }
                                            >
                                              <Tooltip
                                                color="#fff"
                                                title={
                                                  <span className="dark-para">
                                                    {getUserName(s.bidMember?.userId) || "N/A"}
                                                    <span >{getRole(s.bidMember?.userId) == EXTERNAL_ROLE ? (
                                                   <>  <br/>
                          <span className="tag tag-blue">
                            External </span></>
                        ) : (
                          ""
                        )}</span>
                                                    <br />
                                                    {s?.label || 0}
                                                  </span>
                                                }
                                              >
                                                {getLabel(
                                                  s.responseTrackerStatus?.id
                                                )}
                                              </Tooltip>
                                              {user &&
                                                user.id ==
                                                  s?.bidMember?.userId && (
                                                  <span class="tag tag-primary ms-1 you-margin align-top">
                                                    You
                                                  </span>
                                                )}
                                              {(s.responseTrackerStatusId ==
                                                2 ||
                                                s.responseTrackerStatusId ==
                                                  1) &&
                                              moment().diff(s?.date, "days") >
                                                0 ? (
                                                <Tooltip
                                                  color="red"
                                                  title="Overdue"
                                                >
                                                  <i className="fa fa-exclamation-triangle text-danger ms-2"></i>
                                                </Tooltip>
                                              ) : null}
                                              {s.responseTrackerStatusId ==
                                                1 && (
                                                <small>
                                                  <br />
                                                  {moment(s?.date).format(
                                                    "ddd, MMM D, YYYY"
                                                  )}
                                                </small>
                                              )}

                                              {/* <br /> */}
                                            </span>
                                          </>
                                        ) : s.isChecked &&
                                          s.isEdit &&
                                          user.id == s?.bidMember?.userId ? (
                                          <>
                                            <Select
                                              className="form-select mt-3"
                                              onChange={(e) =>
                                                changeStatues(e, index, ind)
                                              }
                                              value={
                                                s.responseTrackerStatus?.id || 1
                                              }
                                            >
                                              {ResponseStatus.map((item) => {
                                                return (
                                                  <Option
                                                    key={item.id}
                                                    value={item.id}
                                                    label={item.label}
                                                  >
                                                    {item.label}
                                                  </Option>
                                                );
                                              })}
                                            </Select>
                                            <br />
                                          </>
                                        ) : !s.isChecked ? (
                                          <>
                                            <span
                                              className={
                                                "tag-not-started tag-na"
                                              }
                                            >
                                              N/A
                                            </span>
                                          </>
                                        ) : (
                                          <>
                                            <>
                                              <span
                                                className={
                                                  s.responseTrackerStatusId ==
                                                    1 ||
                                                  !s.responseTrackerStatusId
                                                    ? "tag-not-started tag-na"
                                                    : s.responseTrackerStatusId ==
                                                      2
                                                    ? "completed tag-na"
                                                    : "in-progress tag-na"
                                                }
                                              >
                                                {getLabel(
                                                  s.responseTrackerStatus?.id
                                                )}

                                                {s.responseTrackerStatusId ==
                                                  1 && (
                                                  <>
                                                    <br />
                                                    {moment(s?.date).format(
                                                      "ddd, MMM D, YYYY"
                                                    )}
                                                  </>
                                                )}
                                                {/* </Tooltip> */}
                                                {user &&
                                                  user.id ==
                                                    s?.bidMember?.userId && (
                                                    <span class="tag tag-primary ms-1 you-margin align-top">
                                                      You
                                                    </span>
                                                  )}

                                                {/* <br /> */}
                                                {(s.responseTrackerStatusId ==
                                                  2 ||
                                                  s.responseTrackerStatusId ==
                                                    1) &&
                                                moment().diff(s?.date, "days") >
                                                  0 ? (
                                                  <Tooltip
                                                    color="red"
                                                    title="Overdue"
                                                  >
                                                    <i className="fa fa-exclamation-triangle text-danger ms-2"></i>
                                                  </Tooltip>
                                                ) : null}
                                              </span>
                                            </>
                                          </>
                                        )}
                                      </td>
                                    )}
                                </>
                              );
                            })}
                        </tr>
                      );
                    })}
                </tbody>
                {isLoader && <Skeleton avatar active />}
              </table>
            )}
          </InfiniteScroll>
          {!response.length && !isLoader && !isResponseShow && (
          <div className="no-data bg-gray border-rounded">
            <img src="/images/response-tracker.png" alt="" />
            <h3>{bidShushiText.yetPlanGenerated}</h3>
          </div>
        )}
      
        {!response.length && !isLoader && inputValue && (
          <div className="no-data bg-gray border-rounded">
            <img src="/images/response-tracker.png" alt="" />
            <h3>{bidShushiText.noResultsFound}</h3>
          </div>
        )}
          </div>
        {isLoader && <Skeleton avatar active />} 
    
      </div>
      <Modal
        okText={bidShushiText.Yes}
        cancelText={bidShushiText.No}
        title={bidShushiText.confirmation}
        open={showModal}
        maskClosable={true}
        onOk={() => {
          pageNumber(0);
          getData(false, null, true);
        }}
        onCancel={() => {
          cancelModal();
        }}
      >
        <p className="confirmation-text">
          Are you sure you want to cancel? All unsaved data will be lost.
        </p>
      </Modal>
      <Modal
        okText={"Generate Email"}
        cancelText={"Cancel"}
        title="Generated Email Options"
        open={emailModal}
        maskClosable={true}
        className="generate-email-modal"
        onCancel={() => {
          cancelEmailModal();
        }}
        onOk={() => {
          setIsDownloadLoader(true)
          setTimeout(()=>{
            openEmlFileInOutlook();
          },900)
        }}
        okButtonProps={{
          disabled:(
            !statsShow &&
            !totalBid &&
            !endOFDay &&
            !endOFDayTable &&
            !showFlags)||btnDisabled
        }}
      >
        <p
          className="confirmation-text mb-2"
          style={{ color: "#000000e0", fontWeight: "800" }}
        >
          Included In:{" "}
        </p>
        <div className="generated-email">
          <Checkbox
            checked={endOFDayTable}
            onChange={(e) => {
              setEndOFDayTable(e.target.checked);
              if (e.target.checked) {
                getALLData();
              }
            }}
          >
            End of Day Table
          </Checkbox>
          <Checkbox
            checked={statsShow}
            onChange={(e) => {
              setStatsShow(e.target.checked);
            }}
          >
            Bid Stats
          </Checkbox>
        </div>

        <div className="generated-email">
          {/* <Checkbox onChange={(e)=>{
          setPlanShow(e.target.checked)
        }}>Plan</Checkbox> */}

          <Checkbox
            checked={totalBid}
            onChange={(e) => {
              setTotalBid(e.target.checked);
            }}
          >
            Total Bid Compeletion Progress Bar
          </Checkbox>
        </div>
        <div className="generated-email">
          <Checkbox
            checked={endOFDay}
            onChange={(e) => {
              setEndOFDay(e.target.checked);
              setSelectedDate(null);
              setDateError(false);
            }}
          >
            End of Day Updates
          </Checkbox>
        </div>
        {endOFDay && (
          <div className="form-wrapper">
            <div className="form-group">
              <label
                className="me-2 d-block"
                style={{
                  fontSize: "14px",
                  marginBottom: "6px",
                }}
              >
                Date for Updates:
              </label>
              <Select
                placeholder="Select Date"
                onChange={(e) => {
                  setSelectedDate(e);
                  if (e) {
                    setDateError(false);
                  }
                }}
                className="form-select generate-email-select"
                value={selectedDate}
                allowClear={true}
              >
                {filteredDates &&
                  filteredDates.map((date) => {
                    return (
                      <Option
                        key={date}
                        value={date}
                        label={moment(date).format("DD-MM-YYYY")}
                      >
                        {date}
                      </Option>
                    );
                  })}
              </Select>
              {isDateError && (
                <small className="text-error">
                  Date for updates is required.
                </small>
              )}
            </div>
          </div>
        )}

        <div className="generated-email mb-0">
          <Checkbox
            checked={showFlags}
            onChange={(e) => {
              setShowFlags(e.target.checked);
              setIncludeResolved(false);
              if(e.target.checked){
                setIncludeAmber(true);
              }else{
                setIncludeAmber(false);
              }
           
            }}
          >
            Flags
          </Checkbox>
        </div>
        {showFlags && (
          <div className="generated-email small-checkboxes">
            <i className="mx-3">&nbsp;</i>
            <Checkbox
              checked={includeAmber}
              className="amber"
              onChange={(e) => {
                setIncludeAmber(e.target.checked);
              }}
            >
              Include Amber
            </Checkbox>
            <Checkbox
              checked={includeResolved}
              className="resolved"
              onChange={(e) => {
                setIncludeResolved(e.target.checked);
              }}
            >
              Include Resolved
            </Checkbox>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResponseTracker;
