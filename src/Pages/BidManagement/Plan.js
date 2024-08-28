import React, { useEffect, useState } from "react";
import { DayPilot, DayPilotScheduler } from "daypilot-pro-react";
import { useParams } from "react-router-dom";
import bidShushi from "../../Services/Api/Api";
import moment from "moment";
import Slider from "react-slick";
import { Modal, Skeleton, notification } from "antd";
import { useNavigatingAway } from "../../hooks/navigateaway";
import DialogLeavingPage from "../../hooks/leave";
import { useAuthContext } from "../../hooks/useAuthContext";
import NumberFormat from "react-currency-format";
import { Select, Space, DatePicker } from 'antd';
import { DatePickerProps } from 'antd';

const {Option} = Select
const settings = {
  dots: false,
  infinite: false,
  speed: 500,
  variableWidth: true,
  slidesToShow: 7,
  slidesToScroll: 5,
  arrows: true,
  prevArrow: (
    <img src="/images/right-arrow.svg" alt="Arrow" className="scroll-left" />
  ),
  nextArrow: (
    <img src="/images/right-arrow.svg" alt="Arrow" className="scroll-right" />
  ),
};
const Plan = ({ bidDetail, setPlanChange, updateLive, bidStatsMembers }) => {
  const { bidId } = useParams();
  const [testPlan, setTestPlan] = [];
  const [api, contextHolder] = notification.useNotification();
  const [events, setEvents] = useState([]);
  const [myResources, setResources] = useState([]);
  const [uniqueStages, setUniqueStages] = useState([]);

  const [days, setDays] = useState(null);
  const [loading, setIsLoading] = useState(false);
  const [hideEvents, setHidEvents] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [isCancel, setIsCancel] = useState(false);
  const [isHolidays, setIsHolidays] = useState([]);
  const [isShowMsg, setIsShowMsg] = useState(false);
  const [bidType, setBidType] = useState("Word count");
  const [isEditModal, setIsEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(false);
  const [editTaskValue, setEditTaskValue] = useState(false);
  const [hoursPerDay,setHoursPerDay] =  useState(null);
  const [editTaskError,setEditTaskError] = useState(false);
  const [openAddTask,setOpenAddTask] = useState(false)
 
  //deleteTask for filter
  const[selecedTaskId,setSelectedTaskId]  = useState(null)
  const[isDeleteModal,setIsDeleteModal] = useState(false)
  //add Task
  const [allQuestions,setAllQuestions] = useState(null);
  const [selectedQuestion,setSelectedQuestion] = useState(null);

  const [selectedStages,setSelectedStages] = useState([]);
  const [selectedStage,setSelectedStage] = useState(null);
  const [selectedUser,setSelectedUser] = useState(null);
  
  const [filteredDates, setFilteredDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState([]);
  const [AddTaskValue, setAddTaskValue] = useState('');
  const [addTaskError,setAddTaskError] = useState(false);

  const [intialResponse,setInitialResponse] = useState(null)
  const [allUser,setAllUser] = useState(null);
  const [userHoliday,isUserHoliday] = useState(null);

  const [addDay,setAddDays]=useState(0);

  const [isSaveLoader,setIsSaveLoader]=useState(false);

  const nonBusinessDayClass = "non-business-day";
  const { user } = useAuthContext();

  const handleChangeQuestion=(id)=>{
     setSelectedStage(null);
     console.log(allQuestions&&allQuestions.find(a=>a.id==id)?.bidQuestionStagesJSON)
      setSelectedQuestion(allQuestions&&allQuestions.find(a=>a.id==id))
      setTimeout(()=>{
       let stages= allQuestions&&allQuestions.find(a=>a.id==id)?.bidQuestionStagesJSON
        setSelectedStages(stages.length>0&&stages.filter(a=>a.isChecked))
      },500)
  };

  const getUserName=(id)=>{
     return allUser&&allUser.find(a=>a.userId==id)?.fullName||"N/A";
  };
  const isUserDeleted=(id)=>{
    return allUser&&allUser.find(a=>a.userId==id)?.isDeleted;
 };
 const getRole=(id)=>{
  return allUser&&allUser.find(a=>a.userId==id)?.role;
};
  const handleStageChange=(id)=>{
    setSelectedStage(selectedStages&&selectedStages.find(a=>a.bidStageId==id))
    console.log(selectedStages&&selectedStages.find(a=>a.bidStageId==id))
     setSelectedUser(selectedStages&&selectedStages.find(a=>a.bidStageId==id)?.bidMember)
 };
  const onBeforeTimeHeaderRender = (args) => {
    const date = new Date(args.header.start).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    args.header.html = date;
    const nameOfDay = new Date(args.header.start).toLocaleDateString("en-US", {
      weekday: "long",
    });
    args.header.html = `<div class="day-header">
            <div class="day-of-week">${nameOfDay}</div>
            <div class="day-of-month">${date}</div>
          </div>`;
    if (args.header.start == DayPilot.Date.today()) {
      args.header.backColor = "#f16667";
    }
  };
  const [canShowDialogLeavingPage, setCanShowDialogLeavingPage] =
    useState(false);

  const [showDialogLeavingPage, confirmNavigation, cancelNavigation] =
    useNavigatingAway(canShowDialogLeavingPage);

  useEffect(() => {
    setIsLoading(true);
    getBidPlan();
  }, []);

  useEffect(()=>{
 const startDate = bidDetail&&bidDetail.startDate;
 const endDateReal = bidDetail&&bidDetail.endDate;
 const daysToAdd = days;
 const endDate = moment(startDate).add(daysToAdd, 'days').format('YYYY-MM-DD');
 const datesBetween = getDatesBetween(startDate, endDate);
 const finalFilterDates=filterDates(datesBetween)
 //setFilteredDates(finalFilterDates);
 if(endDateReal!=finalFilterDates[finalFilterDates.length - 1]&&!isShowMsg){
  finalFilterDates&&finalFilterDates.pop()
  setFilteredDates(finalFilterDates)
 }else{
  setFilteredDates(finalFilterDates)
 }


  },[days])


// Example function to filter dates based on a condition
function filterDates(datesArray) {
  // Define your filtering condition here, for example, excluding specific dates
  const filteredDates = datesArray.filter((date) => {
   let filterHolidays=isHolidays.map(a=>a.date);
    return !filterHolidays.includes(date);
  });

  return filteredDates;
}

  function handlePaste(event) {
    event.preventDefault();
  }

  function handleCopy(event) {
    event.preventDefault();
  }

  const isKeyDuplicated=(arr,key)=> {
    const keyCount = arr&&arr.reduce((acc, obj) => {
      const keyValue = obj[key];
      acc[keyValue] = (acc[keyValue] || 0) + 1;
      return acc;
    }, {});
    return Object.values(keyCount).some((count) => count > 1);
  }

  const filterTask=()=>{
    let updatedTask=events&&events.filter(a=>a.id!=selecedTaskId);
    addIsDeleteInEvents(updatedTask)
    const planToDetailPlan = (plan, i) => {
      const groupedPlan = {};
      plan.forEach((item, i) => {
        const key = `${
          item.start instanceof DayPilot.Date
            ? item.start.value.slice(0, 10)
            : item.start
        }`;
        if (!groupedPlan[key]) {
          groupedPlan[key] = {
            start:
              item.start instanceof DayPilot.Date
                ? item.start.value.slice(0, 10)
                : item.start,
            bidPlanDetailsJSON: [],
            bidId: bidId,
            date:
              item.start instanceof DayPilot.Date
                ? item.start.value.slice(0, 10)
                : item.start,
          };
        }
        groupedPlan[key].bidPlanDetailsJSON.push({
          // BidPlanDayId: parseInt(item.day),
          bidQuestionId: item.bidQuestionId,
          bidQuestionStageId: item.bidQuestionStageId,
          bidId: item.bidId,
          bidMemberId: item.bidMemberId,
          bidMemberName: item.bidMemberName,
          isChecked: item.isChecked,
          name: item.name,
          questionPriority: item.questionPriority,
          taskDuration: item.taskDuration,
          date:
            item.start instanceof DayPilot.Date
              ? item.start.value.slice(0, 10)
              : item.start,
          totalTaskDuration: item.totalTaskDuration,
          wordEquiv: item.wordEquiv,
          label:item.label,
          bidStageColor: item?.barColor,
          bidMemberRole:item?.bidMemberRole,
          userSkill:item?.userSkill,
          userId:item?.userId,
          sortOrder:item?.sortOrder,
          bidStageId:item?.bidStageId||null,
          hurdle:item?.hurdle
        });
      });
      return Object.values(groupedPlan);
    };

    const PlanDays = planToDetailPlan(updatedTask);

    const bidDays = PlanDays.map((d, ind) => {
      return {
        //day: ind,
        bidId: d.bidId,
        bidPlanDetailsJSON: d.bidPlanDetailsJSON,
        date: d.date,
        isHoliday: false,
      };
    });

    let bidHolidays =
      isHolidays.length > 0
        ? isHolidays.map((d, ind) => {
            return {
              bidId: d.bidId,
              bidPlanDetailsJSON: d.bidPlanDetailsJSON,
              date: d.date,
              isHoliday: true,
            };
          })
        : [];

    const combinedArray = [...bidDays, ...bidHolidays];
    let sortedArray = combinedArray.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const bidPlanDays = sortedArray.map((obj, ind) => {
      return {
        ...obj,
        day: ind + 1,
      };
    });

    setInitialResponse((preState)=>{
      return{
        ...preState,
        bidPlanDays:bidPlanDays
      }
    })
    setIsDeleteModal(false);
    setCanShowDialogLeavingPage(true);
    setPlanChange(true);
  }
  const setEventsAndDays = (res) => {
    const convertedPlan =
      res &&
      res.bidPlanDays.length > 0 &&
      res.bidPlanDays.flatMap((day, i) => {
        return day.bidPlanDetailsJSON.map((detail) => {
          return {
            start: day.date,
            end: day.date,
            id: Math.random(99999999) * Math.floor(99 * 990909) + i,
            resource: detail.bidQuestionId.toString(),
            text: detail.name,
            day: day.day,
            isHoliday: day.isHoliday,
            taskDuration: detail.taskDuration,
            owner: [],
            tooltip: detail.name,
            bidMemberName: detail.bidMemberName || "N/A",
            barColor: detail?.bidStageColor || "red",
            compositeKey:`${detail?.bidQuestionId}-${detail?.sortOrder}`,
            ...detail,
          };
        });
      });
    const maxStart =
      convertedPlan &&
      convertedPlan.reduce((max, item) => {
        const itemStart = new Date(item.start).getTime();
        return itemStart > max ? itemStart : max;
      }, 0);

    let whoIsMax = null;
    let addDay = 0;
    if (
      moment(maxStart).format("YYYY-MM-DD") >
      moment(bidDetail && bidDetail.endDate).format("YYYY-MM-DD")
    ) {
      whoIsMax = maxStart;
      addDay = 0;
      setAddDays(0)
      setIsShowMsg(true);
    } else {
      whoIsMax = bidDetail && bidDetail.endDate;
      addDay = 1;
      setAddDays(1)
      setIsShowMsg(false);
    }
    if (maxStart && bidDetail && bidDetail.startDate) {
      setDays(
        moment
          .duration(
            moment(whoIsMax).diff(moment(bidDetail && bidDetail.startDate))
          )
          .asDays() + addDay
      );
    }
    let holidays =
      res &&
      res.bidPlanDays.length > 0 &&
      res.bidPlanDays.filter((a) => a.isHoliday);
    // console.log(holidays, "holiday",convertedPlan);
    setIsHolidays(holidays);    
    addIsDeleteInEvents(convertedPlan)
  };

  function getDatesBetween(startDate, endDate) {
    const dates = [];
    let currentDate = moment(startDate);
    const stopDate = moment(endDate);
  
    while (currentDate <= stopDate) {
      if (currentDate.day() !== 0 && currentDate.day() !== 6) { // Skip weekends (Sunday and Saturday)
        dates.push(currentDate.format('YYYY-MM-DD'));
      }
      currentDate = currentDate.clone().add(1, 'days');
    }
  
    return dates;
  }
  
  const addIsDeleteInEvents=(arr)=>{
    const isBidQuestionStageIdDuplicated = isKeyDuplicated(
      arr,
      "compositeKey"
    );

    // Loop through the array and add the "isDeleted" key accordingly
    const convertedPlanWithIsDeleted = arr&&arr.map((obj) => ({
      ...obj,
      isDeleted: isBidQuestionStageIdDuplicated && isKeyDuplicated(arr.filter(o => o.compositeKey === obj.compositeKey), "compositeKey"),
    }));
    setEvents(convertedPlanWithIsDeleted);
    setIsLoading(false);
  }

  const regenratePlan = () => {
    setIsSaveLoader(true);
    const planToDetailPlan = (plan, i) => {
      const groupedPlan = {};
      plan.forEach((item, i) => {
        const key = `${
          item.start instanceof DayPilot.Date
            ? item.start.value.slice(0, 10)
            : item.start
        }`;
        if (!groupedPlan[key]) {
          groupedPlan[key] = {
            start:
              item.start instanceof DayPilot.Date
                ? item.start.value.slice(0, 10)
                : item.start,
            bidPlanDetailsJSON: [],
            bidId: bidId,
            date:
              item.start instanceof DayPilot.Date
                ? item.start.value.slice(0, 10)
                : item.start,
          };
        }
        groupedPlan[key].bidPlanDetailsJSON.push({
          // BidPlanDayId: parseInt(item.day),
          bidQuestionId: item.bidQuestionId,
          bidQuestionStageId: item.bidQuestionStageId,
          bidId: item.bidId,
          bidMemberId: item.bidMemberId,
          bidMemberName: item.bidMemberName,
          isChecked: item.isChecked,
          name: item.name,
          questionPriority: item.questionPriority,
          taskDuration: item.taskDuration,
          date:
            item.start instanceof DayPilot.Date
              ? item.start.value.slice(0, 10)
              : item.start,
          totalTaskDuration: item.totalTaskDuration,
          wordEquiv: item.wordEquiv,
          label:item.label,
          bidStageColor: item?.barColor,
          bidMemberRole:item?.bidMemberRole,
          userSkill:item?.userSkill,
          userId:item?.userId,
          sortOrder:item?.sortOrder,
          bidStageId:item?.bidStageId||null,
          hurdle:item?.hurdle
        });
      });
      return Object.values(groupedPlan);
    };

    const PlanDays = planToDetailPlan(events);

    const bidDays = PlanDays.map((d, ind) => {
      return {
        //day: ind,
        bidId: d.bidId,
        bidPlanDetailsJSON: d.bidPlanDetailsJSON,
        date: d.date,
        isHoliday: false,
      };
    });

    let bidHolidays =
      isHolidays.length > 0
        ? isHolidays.map((d, ind) => {
            return {
              bidId: d.bidId,
              bidPlanDetailsJSON: d.bidPlanDetailsJSON,
              date: d.date,
              isHoliday: true,
            };
          })
        : [];

    const combinedArray = [...bidDays, ...bidHolidays];
    let sortedArray = combinedArray.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const bidPlanDays = sortedArray.map((obj, ind) => {
      return {
        ...obj,
        day: ind + 1,
      };
    });
    setPlanChange(false);
    setCanShowDialogLeavingPage(false);
    bidShushi
      .bidPlanUpdate(bidPlanDays, bidId)
      .then((res) => {
        setInitialResponse(res);
        updateLive(true);
        //hide msg while manual adjustments
        const maxStart =
          bidPlanDays &&
          bidPlanDays.filter(p=>!p.isHoliday).reduce((max, item) => {
            const itemStart = new Date(item.date).getTime();
            return itemStart > max ? itemStart : max;
          }, 0);
        let whoIsMax = null;
        let addDay = 0;
        if (
          moment(maxStart).format("YYYY-MM-DD") >
          moment(bidDetail && bidDetail.endDate).format("YYYY-MM-DD")
        ) {
          whoIsMax = maxStart;
          addDay = 0;
          setAddDays(0)
          setIsShowMsg(true);
        } else {
          whoIsMax = bidDetail && bidDetail.endDate;
          addDay = 1;
          setAddDays(1)
          setIsShowMsg(false);
        }
        api.success({
          message: `Success`,
          description: "The plan has been updated successfully.",
          placement: "topRight",
        });
        setIsSaveLoader(false);
      })
      .catch(() => {
        api.success({
          message: `Failed`,
          description: "The plan has not been updated successfully.",
          placement: "topRight",
        });
        setIsSaveLoader(false);
      });
    editHandler();
  };

  useEffect(() => {
    if (bidDetail && bidDetail.bidStages) {
      setUniqueStages(bidDetail.bidStages);
      if (bidDetail && bidDetail.questionLimitType == "WORD_COUNT") {
        setBidType("Word count");
      } else {
        setBidType("Page count");
      }
    }

  }, [bidDetail]);

  const checkUserHoliday=()=>{
    bidShushi.checkUserHoliday(selectedStage?.bidMember?.userId,selectedDate).then(res=>{
      if(!res){
         if( isUserDeleted(selectedStage&&selectedStage?.bidMember?.user?.id)){
          setOpenAddTask(false);
          isUserHoliday(true);
         }else{
          taskAfterHoliday();
         }
      }else{
        setOpenAddTask(false);
        isUserHoliday(true);
      }
    }).catch((err)=>{
     console.log(err)
    })
  }
  const getBidPlan = () => {
    bidShushi
      .getBidPlan(bidId)
      .then((res) => {
       setAllUser(res&&res?.users)
       setHoursPerDay(res&&res?.hoursPerDay)
        let updatedResources =
          res.bidQuestions &&
          res.bidQuestions.map((r, i) => {
            return {
              isShow: true,
              ...r,
            };
          });
        setAllQuestions(res.bidQuestions) 
        setIsCancel(false);
        setIsEdit(false);
        setResources(updatedResources);
        setInitialResponse(res);
        setEventsAndDays(res);
        setCanShowDialogLeavingPage(false);
        setPlanChange(false);
        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false)
      });
  };

  const editHandler = () => {
    setIsEdit((preState) => !preState);
  };

  const cancelChangeHandler = () => {
    setIsCancel(false);
    setIsEdit(true);
  };

  const cancelChangeHandlerEditModal = () => {
    setIsEditModal(false);
    setIsEdit(true);
    setSelectedTask(null);
  };

  const afterEditSave = () => {
    if(!editTaskValue||editTaskValue==0||editTaskValue>999.99){
     setEditTaskError(true);
      return 
    }
    setEditTaskError(false);
    // displayTextboxValue = taskDuration*hoursPerDay = 5.28
    if (selectedTask?.taskDuration == selectedTask?.totalTaskDuration) {
      selectedTask.taskDuration = (editTaskValue / hoursPerDay);
      selectedTask.totalTaskDuration = selectedTask.taskDuration;
    } else {
      //multipart case
      let tempTaskDuration = editTaskValue/hoursPerDay;
      selectedTask.totalTaskDuration =  selectedTask.totalTaskDuration -  selectedTask.taskDuration;
      selectedTask.totalTaskDuration = selectedTask?.totalTaskDuration + tempTaskDuration
      selectedTask.taskDuration = tempTaskDuration
    }
    if (selectedTask?.taskDuration == 1) {
      selectedTask.label = "Full day";
    } 
    // else if (selectedTask?.taskDuration > 1) {
    //   selectedTask.label = selectedTask?.taskDuration + " day";
    // }
     else {
      selectedTask.label = selectedTask?.taskDuration * hoursPerDay + " hours";
    }

    setEvents(prevItems => {
      return prevItems.map(item => {
        if (item.id === selectedTask?.id) {
          return { ...item, ...selectedTask }; // Merge existing object with new data
        }
        return item;
      });
    });
  
  setIsEditModal(false);
  //setIsEdit(true);
  setCanShowDialogLeavingPage(true);
  setPlanChange(true);

  };
 
  useEffect(()=>{
   console.log(events)
   if(events&&events.length>0){
    const planToDetailPlan = (plan, i) => {
      const groupedPlan = {};
      plan.forEach((item, i) => {
        const key = `${
          item.start instanceof DayPilot.Date
            ? item.start.value.slice(0, 10)
            : item.start
        }`;
        if (!groupedPlan[key]) {
          groupedPlan[key] = {
            start:
              item.start instanceof DayPilot.Date
                ? item.start.value.slice(0, 10)
                : item.start,
            bidPlanDetailsJSON: [],
            bidId: bidId,
            date:
              item.start instanceof DayPilot.Date
                ? item.start.value.slice(0, 10)
                : item.start,
          };
        }
        groupedPlan[key].bidPlanDetailsJSON.push({
          // BidPlanDayId: parseInt(item.day),
          bidQuestionId: item.bidQuestionId,
          bidQuestionStageId: item.bidQuestionStageId,
          bidId: item.bidId,
          bidMemberId: item.bidMemberId,
          bidMemberName: item.bidMemberName,
          isChecked: item.isChecked,
          name: item.name,
          questionPriority: item.questionPriority,
          taskDuration: item.taskDuration,
          date:
            item.start instanceof DayPilot.Date
              ? item.start.value.slice(0, 10)
              : item.start,
          totalTaskDuration: item.totalTaskDuration,
          wordEquiv: item.wordEquiv,
          label:item.label,
          bidStageColor: item?.barColor,
          bidMemberRole:item?.bidMemberRole,
          userSkill:item?.userSkill,
          userId:item?.userId,
          sortOrder:item?.sortOrder,
          bidStageId:item?.bidStageId||null,
          hurdle:item?.hurdle
        });
      });
      return Object.values(groupedPlan);
    };

    const PlanDays = planToDetailPlan(events);

    const bidDays = PlanDays.map((d, ind) => {
      return {
        //day: ind,
        bidId: d.bidId,
        bidPlanDetailsJSON: d.bidPlanDetailsJSON,
        date: d.date,
        isHoliday: false,
      };
    });

    let bidHolidays =
      isHolidays.length > 0
        ? isHolidays.map((d, ind) => {
            return {
              bidId: d.bidId,
              bidPlanDetailsJSON: d.bidPlanDetailsJSON,
              date: d.date,
              isHoliday: true,
            };
          })
        : [];

    const combinedArray = [...bidDays, ...bidHolidays];
    let sortedArray = combinedArray.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const bidPlanDays = sortedArray.map((obj, ind) => {
      return {
        ...obj,
        day: ind + 1,
      };
    });

    setInitialResponse((preState)=>{
      return{
        ...preState,
        bidPlanDays:bidPlanDays
      }
    })
   }
  },[events,openAddTask])
  const AddTaskInPlan=()=>{

    if(AddTaskValue==0||AddTaskValue>999.99){
      setAddTaskError(true);
       return 
     }

     checkUserHoliday();

  }

  const taskAfterHoliday=()=>{
    let bidPlanDetailJSON={
      ...selectedStage,
      date:moment(selectedDate).format('YYYY-MM-DD'),
      dates:[moment(selectedDate).format('YYYY-MM-DD')],
      label:AddTaskValue  == 8?"full Day":(AddTaskValue)   + " hours",
      taskDuration:AddTaskValue / hoursPerDay,
      totalTaskDuration:AddTaskValue / hoursPerDay,
      bidQuestionId:selectedQuestion?.id,
      userId:selectedStage?.bidMember?.userId,
      userSkill:selectedStage?.bidMember?.skill,
      compositeKey:`${selectedQuestion?.id}-${selectedStage?.sortOrder}`
     // bidMemberRole:selectedStage?.bidMemberRole
    }

let updatedRes = intialResponse && intialResponse.bidPlanDays.map((a) => {
  if (a.date === moment(selectedDate).format('YYYY-MM-DD')) {
    return {
      ...a, // Spread the original day object to retain its existing properties
      bidPlanDetailsJSON: [...a.bidPlanDetailsJSON, bidPlanDetailJSON], // Add the new task object to the existing array
    };
  }
  return a;
});

if(updatedRes&&updatedRes.some(a=>a.date==moment(selectedDate).format('YYYY-MM-DD'))==false){
  let newData={
  // id: '50d7e8b0-c13e-4912-ac12-3927387e67a4',
    bidId:bidPlanDetailJSON?.bidId,
    isHoliday: false, 
    day: parseInt(updatedRes[updatedRes.length-1]?.day + 1), 
    date: moment(selectedDate).format('YYYY-MM-DD'),
    bidPlanDetailsJSON:[bidPlanDetailJSON]
  }
  updatedRes.push(newData)
}
    setInitialResponse((preState)=>{
      return{
        ...preState,
        bidPlanDays:updatedRes
      }
    })
    let data={
      ...intialResponse,
      bidPlanDays:updatedRes
    }
   setEventsAndDays(data)
    
  //  api.success({
  //   message: `Task Added`,
  //   description: "The Task has been added successfully.",
  //   placement: "topRight",
  // });
    setPlanChange(true);
    isUserHoliday(false);
    setCanShowDialogLeavingPage(true);
    clearAddTask();
  }

  const clearAddTask=()=>{
    setSelectedDate(null);
    setSelectedQuestion(null)
    setSelectedStage(null);
    setAddTaskError(false);
    setAddTaskValue('');
    setOpenAddTask(false)
  }
  return (
    <>
      {contextHolder}
      <DialogLeavingPage
        showDialog={showDialogLeavingPage}
        setShowDialog={setCanShowDialogLeavingPage}
        confirmNavigation={confirmNavigation}
        cancelNavigation={cancelNavigation}
      />
       {     isSaveLoader&&    <div className="lds-ripple loader">
        <div></div>
      </div>}
      {!loading &&
        myResources &&
        myResources.length > 0 &&
        ((events && events.length > 0) ||
          (hideEvents && hideEvents.length > 0)) && (
          <div>
            <div className="bid-info-msg text-danger">
              {isShowMsg && (
                <>
                  <i className="fa fa-info-circle ms-2 "></i> This plan exceeds
                  the actual end date of Bid.
                </>
              )}
            </div>
            {uniqueStages &&
              uniqueStages.filter((stage) => stage.isChecked)?.length > 10 && (
                <div className="color-name">
                  <Slider {...settings}>
                    {uniqueStages &&
                      uniqueStages
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .filter((stage) => stage.isChecked)
                        .map((stage, i) => {
                          return (
                            <div key={i} className="status-info">
                              <i
                                style={{
                                  backgroundColor:
                                    stage.stageColor?.name ?? "red",
                                }}
                              ></i>
                              <span>{stage.name}</span>
                            </div>
                          );
                        })}
                  </Slider>
                </div>
              )}
            {uniqueStages &&
              uniqueStages.filter((stage) => stage.isChecked)?.length <= 10 && (
                <div className="color-name">
                  {uniqueStages &&
                    uniqueStages
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .filter((stage) => stage.isChecked)
                      .map((stage, i) => {
                        return (
                          <div key={i} className="status-info">
                            <i
                              style={{
                                backgroundColor:
                                  stage.stageColor?.name ?? "red",
                              }}
                            ></i>
                            <span>{stage.name}</span>
                          </div>
                        );
                      })}
                </div>
              )}

            {bidDetail &&
              bidDetail.bidStatusId != 3 &&
              user.id == bidDetail?.bidManagerId && (
                <div className="bid-plan-btn-wrapper">
                  {isEdit && (
                    <>
                      <button
                        className="no-style"
                        onClick={() =>
                          canShowDialogLeavingPage
                            ? setIsCancel(true)
                            : editHandler()
                        }
                      >
                        <img src="/images/cancel-round.png" alt="Cancel" />
                        <br />
                        <span className="text-para">Cancel</span>
                      </button>

                      <button onClick={regenratePlan} className="no-style">
                        <img src="/images/save-round.png" alt="Save" />
                        <br />
                        <span className="text-primary">Save</span>
                      </button>

                      <button className="no-style" onClick={()=>{setOpenAddTask(true);
                       setSelectedQuestion([])
                       setSelectedStages([])
                      }}>
                      <img src="/images/add-round.png" />
                      <br />
                      <span className="text-para text-success">Add Task</span>
                      </button>
                    </>
                  )}
                  {!isEdit && (
                    <button className="no-style" onClick={editHandler}>
                      <img src="/images/edit-round.png" alt="Edit" />
                      <br />
                      <span className="text-primary">Edit Bid Plan</span>
                    </button>
                  )}
                </div>
              )}
            <DayPilotScheduler
              startDate={bidDetail && bidDetail.startDate}
              days={days}
              cellWidth={150}
              cellDuration={30}
              eventHeight={45}
              eventMarginBottom={12}
              onBeforeTimeHeaderRender={onBeforeTimeHeaderRender}
              timeHeaders={[{ groupBy: "Day", format: "d" }]}
              onBeforeCellRender={(args) => {
                if (args.cell.start == DayPilot.Date.today()) {
                  args.cell.backColor = "#f9f1f1";
                }
              }}
              rowHeaderColumnDefaultWidth={50}
              headerHeight={40}
              rowHeaderColumnResizedHandling={(args) => {
                console.log(args);
              }}
              onIncludeTimeCell={(args) => {
                const cellDate = new Date(args.cell.start);
                for (let i = 0; i < isHolidays.length; i++) {
                  const holidayDate = new Date(isHolidays[i].date);
                  if (
                    cellDate.getDate() === holidayDate.getDate() &&
                    cellDate.getMonth() === holidayDate.getMonth() &&
                    cellDate.getFullYear() === holidayDate.getFullYear()
                  ) {
                    args.cell.visible = false;
                    break; // exit the loop if a holiday is found
                  }
                }
                const dayOfWeek = cellDate.getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                  args.cell.visible = false;
                }
              }}
              taskResizeHandling="Disabled"
              heightSpec="Fixed"
              rowEmptyHeight={40}
              rowMinHeight={120}
              rowMarginBottom={0}
              showNonBusiness={false}
              scale={"Day"}
              rowHeaderWidthAutoFit={true}
              resources={myResources}
              events={events}
              rowHeaderColumns={[
                { text: "Priority", display: "priority" },
                { text: "Qn No.", display: "Qn No." },
                {
                  text: "Question Name",
                  display: "Question",
                  maxAutoWidth: 2000,
                },
                { text: "", display: "icon", width: 70 },
              ]}
              showToolTip={true}
              onBeforeRowHeaderRender={(args) => {
                args.row.columns[3].areas = [
                  {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 10,
                    html: args.row.data.isShow
                      ? "<img src='/images/show-icon.png' alt='show' class='show-img'>"
                      : "<img src='/images/hide-icon.png'  class='hide-img' alt='hide'>",
                    style:
                      "cursor:pointer; pointer-events:none;  display: flex; margin-top:10px; justify-content: center; color: #666;",
                    onClick: (clickArgs) => {
                      let row = clickArgs.source;
                      console.log(row);
                      let updatedResources = myResources.map((r, i) => {
                        if (r.id == row.id) {
                          if (r.isShow) {
                            let myhideEvents = events.filter(
                              (a) => a.resource == row.id
                            );
                            let filterEvents = events.filter(
                              (a) => a.resource != row.id
                            );
                            setHidEvents((preEvents) => {
                              return [...preEvents, ...myhideEvents];
                            });
                            setEvents(filterEvents);
                          } else {
                            let filterEvents = hideEvents.filter(
                              (a) => a.resource != row.id
                            );
                            let removeHideEvents = hideEvents.filter(
                              (a) => a.resource == row.id
                            );
                            setHidEvents(filterEvents);
                            setEvents((preEvents) => {
                              return [...preEvents, ...removeHideEvents];
                            });
                          }
                          r.isShow = !r.isShow;
                          return r;
                        }
                        return r;
                      });
                      setResources(updatedResources);
                    },
                  },
                ];
                args.row.columns[0].html = `<span class="${
                  args.row.data.isShow
                    ? "priority-number visible"
                    : "priority-number invisible"
                }""> ${args.row.data?.questionPriority?.name || "N/A"} </span>`;
                args.row.columns[1].html = `<span class="${
                  args.row.data.isShow
                    ? "rounded-number visible"
                    : "rounded-number invisible"
                }"" style="color:white;background-color:${
                  args.row.data?.color
                };"  > ${args.row.data?.questionNumber || "N/A"}</span>`;
                args.row.columns[2].html = `<div  style="height: 400px; width: 290px;"   class="${
                  args.row.data.isShow
                    ? "row h-100 event-info-wrapper visible"
                    : "row h-100 invisible"
                }"" >  
                 <div class="col-md-12">
                 <span class="question-title-calendar" title='${
                   args.row.data?.questionName
                 }'>${args.row.data?.questionName || "N/A"}</span> <br/>    
                  <span class="calendar-info"> Owner: <span class="calendar-info-value">${
                    bidDetail &&
                    bidDetail?.bidMembers.find(
                      (member) =>
                        member.userId ==  args.row.data?.questionOwner?.id
                    )?.user?.fullName || "N/A"
                  }</span> </span>
                  <span class="calendar-info"> SME: <span class="calendar-info-value">${
                    (args.row.data?.smes?.length &&
                      args.row.data?.smes.map((a) => a?.user?.fullName)?.join(",")) ||
                    "N/A"
                  }</span> </span>
                  <span  class="calendar-info"> </span>
                  <span class="calendar-info">${
                    bidType == "Word count" ? "Word Count" : "Page Count"
                  }: <span class="calendar-info-value">${
                  args.row.data?.wordCount
                }</span> </span>
                  <span  class="calendar-info">Weighting: <span class="calendar-info-value">${
                    args.row.data?.weighting || "N/A"
                  }</span> </span>
                  <span  class="calendar-info">Complexity: <span class="calendar-info-value">${
                    args.row.data?.questionComplexity?.name
                  }</span> </span>
                 </div>
              </div>`;
              }}
              floatingEvents={false}
              eventMoveHandling={!isEdit ? "Disabled" : "Update"}
              eventResizeHandling="Disabled"
              timeRangeSelectedHandling="Disabled"
              onBeforeEventRender={(args) => {
                const { e, newResource } = args;
                args.data.bubbleHtml = `<div class='event-details' ">
              <span class="event-name">${args.data.text}</span>   
              <br/>
              <span class="event-member-name">${getUserName( args.data.userId)}</span> 
              <br/>
             </div>`;
                args.data.html = `<div class='event-details' ">
              <span class="event-name" >${args.data.text}</span>   
              <span class="event-member-name text-ellipse">${
                getUserName( args.data.userId)
              },</span> 
              <span class="event-member-tag">${
                args.data.userId === user?.id ? "You" : ""
              }</span>
              <span class="event-member-tag bid-plan-tag-blue">${
                getRole( args.data.userId)==='External'?"External" : ""
              }</span>
              <br />
              <span class="event-duration">${
                args.data.label
                  ? args.data.label
                  : args.data.taskDuration + "" + " day"
              } </span>
             </div>`;
                args.data.areas = [
                  {
                    style: "cursor:pointer; pointer-events:auto;",
                    html: `<div class="edit-task-icons"><i class="fa fa-pencil me-1" aria-hidden="true" title="Edit"></i>

                    </div>`,
                    top: 3,
                    onClick: (e) => {
                      setIsEditModal(true);
                      setSelectedTask(e.source.data);
                      setEditTaskValue(e.source.data?.taskDuration*8)
                    },
                    right: 0,
                    v: "Hover",
                    css: !isEdit ? "invisible" : "visible",
                  },
                  {
                    style: "cursor:pointer; pointer-events:auto;",
                    html: `<div class="edit-task-icons"></i>
                    <i class="fa fa-trash-o" aria-hidden="true" title="Delete"></i>
                    </div>`,
                    top: 3,
                    onClick: (e) => {
                      setIsDeleteModal(true);
                      setSelectedTaskId(e.source.data?.id);
                      // setSelectedTask(e.source.data);
                      // setEditTaskValue(e.source.data?.taskDuration*8)
                    },
                    right: 20,
                    v: "Hover",
                    css: isEdit&&args.data.isDeleted? "visible" : "invisible",
                  },
                ];
              }}
              eventClickHandling={!isEdit ? "Disabled" : "Enabled"}
              // onEventClick={(args)=>{
              //   alert("clicked: " + args.e.id());
              //   console.log(args.e.data)
              // }}
              onEventMoving={(args) => {
                if (args.e.data.resource != args.resource) {
                  args.allowed = false;
                  args.right.enabled = true;
                  args.right.html =
                    "You can't drag tasks from one question to another.";
                }
                args.html = `<div class="event-details">
                             <span class="event-name">   ${args.e.data.text} </span>
                              <span class="event-duration">  ${args.e.data.label}</span>
             </div>`;
                args.cssClass = "draggable-wrapper";
                setCanShowDialogLeavingPage(true);
                setPlanChange(true);
              }}
            />
          </div>
        )}

      {/* {loading && <div className="container-loader">
        <div className="moon">
          <img src="/images/logo.png" alt="Logo" className="logo-orbit"/>

        </div>
        <div className="orbit">
          <div className="rocket">
            <div className="window"></div>
          </div>
        </div>
        <div className="bid-wait-text">Bid plan is generating, please wait...</div>
      </div>
      } */}
      {loading && <Skeleton active avatar />}
      {(!events || events.length == 0) &&
        (!hideEvents || hideEvents.length == 0) &&
        !loading && (
          <div className="no-data bg-gray border-rounded">
            <img src="/images/bidplan.png" alt="Bid Plan" width="60px" />
            <h3>The Plan is yet to be generated for this Bid.</h3>
          </div>
        )}

      <Modal
        okText={"Yes"}
        cancelText={"No"}
        title="Confirmation Message"
        open={isCancel}
        maskClosable={false}
        onOk={getBidPlan}
        onCancel={cancelChangeHandler}
      >
        <p className="confirmation-text">
          Are you sure you want to cancel? All unsaved data will be lost.
        </p>
      </Modal>

      <Modal
        okText={"Save"}
        cancelText={"Cancel"}
        title="Edit Task"
        open={isEditModal}
        maskClosable={false}
        onOk={afterEditSave}
        onCancel={cancelChangeHandlerEditModal}
        className="edit-task-modal"
      >
        <div className="form-wrapper">

          <div className="row mt-3 form-group">
            <p className="col-3 confirmation-text mb-0">Stage Name: </p>
            <p className="col-9 text-para mb-0">{selectedTask && selectedTask?.name} </p>
          </div>

          <div className="row mt-3 form-group">
            <p className="col-3 confirmation-text mb-0">Assign to: </p>
            <p className="col-9 text-para mb-0">{getUserName(selectedTask&&selectedTask?.userId)} 
            {getRole(selectedTask&&selectedTask?.userId)&&<span class="event-member-tag bid-plan-tag-blue mx-1">{
                getRole(selectedTask&&selectedTask?.userId) =='External'  ||selectedTask&&selectedTask?.bidMemberRole ==3?"External" : ""
              }</span>}
            </p>
          </div>

          <div className="row mt-3">
            <div className="col-3 form-group">
              <label className="confirmation-text mt-2 pt-1">Duration (Hrs): </label>
            </div>
           
          
            <div className="col-5 form-group">
              <NumberFormat
              allowNegative={false}
              value={editTaskValue}
              decimalScale={2}
              max={999}
              onPaste={handlePaste}
              onCopy={handleCopy}
              className="form-control"
              onValueChange={(value) => {
                setEditTaskError(false);
                setEditTaskValue(value?.value);
              }}
              maxLength={6}
              placeholder="Enter Task Duration"
              thousandSeparator={false}
              inputmode="numeric"
            />
             {
  editTaskError && editTaskValue == '' && (
    <span className="text-error mt-1">Task Duration is required.</span>
  )
}

{
  editTaskError && editTaskValue == '0' && (
    <span className="text-error mt-1">Task Duration must be greater than 0.</span>
  )
}
{
  editTaskError&&editTaskValue > 999.99 && (
    <span className="text-error mt-1">Task Duration must be less than 1000.</span>
  )
}
            </div>
          </div>

        </div>
      </Modal>

      <Modal
        okText={"Save"}
        cancelText={"Cancel"}
        title="Add Task"
        open={openAddTask}
        maskClosable={false}
        className="add-task-modal"
        onOk={()=>AddTaskInPlan()}
        onCancel={()=>clearAddTask()}
        okButtonProps={{
          disabled:(
            !selectedStage ||
            !selectedDate ||
            !selectedQuestion ||
            !AddTaskValue )
        }}
      >
        <div className="form-wrapper">
               
          <div className="row align-items-center form-group">
            <div className="col-3 confirmation-text">Question: </div>
            <div className="col-8 text-para">
            <Space wrap>
              <Select
                placeholder="Select Question"
                // style={{ width: 200 }}
                className="form-select"
                onChange={(e)=>handleChangeQuestion(e)}
                allowClear={true}
                value={selectedQuestion?.id||null}
                notFoundContent={
                  <p
                    className="font-weight-bold text--center mb-0 "
                    style={{ color: "#7a7a7a" }}
                  >
                     No Question Found
                  </p>
                }
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                 
              >
                 {allQuestions&&allQuestions.map((item) => (
                <Option
                  key={item.id}
                  value={item.id}
                  label={item.questionName
                  }
                >
                  <div>
                     {item.questionName}
                  </div>
                </Option>
              ))}
                </Select>
                </Space>
          </div>
          </div>

            <div className="row align-items-center form-group">

                <div className="col-3 confirmation-text">Stage: </div>
                  <div className="col-8">
                    <Space wrap>
                    <Select
                        placeholder="Select Stage"
                        // style={{ width: 200 }}
                        className="form-select"
                        onChange={(e)=>handleStageChange(e)}
                        value={selectedStage?selectedStage?.bidStageId:null}
                        disabled={selectedStages&&selectedStages.length==0}
                        notFoundContent={
                          <p
                            className="font-weight-bold text--center mb-0 "
                            style={{ color: "#7a7a7a" }}
                          >
                             No Stage Found
                          </p>
                        }
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }

                      >
                         {selectedStages&&selectedStages.map((item) => (
                        <Option
                          key={item.bidStageId}
                          value={item.bidStageId}
                          label={item.name
                          }
                        >
                          <div className="text-ellipse">
                             {item.name}
                          </div>
                        </Option>
                      ))}
                        </Select>
                    </Space>
                  </div>

            </div>
            <div className="row align-items-center form-group my-3">
                <div className="col-3 confirmation-text">Assign To: </div>
                <div className="col-8 confirmation-text mb-0 me-2">{getUserName(selectedStage&&selectedStage?.bidMember?.userId) ||'N/A'}
                {getRole(selectedStage&&selectedStage?.bidMember?.userId)&&<span class="event-member-tag bid-plan-tag-blue mx-1">{
                getRole(selectedStage&&selectedStage?.bidMember?.userId) =='External'?"External" : ""
              }</span>}
                </div>
          </div>

            <div className="row align-items-center form-group">
                <div className="col-3 confirmation-text">Date: </div>
                <div className="col-8">
                <Space direction="vertical">
                <Select
                    placeholder="Select Date"
                    className="form-select"
                    // style={{ width: 200 }}
                    onChange={(e) => {
                      setSelectedDate(e);
                    }}
                    value={selectedDate}
                    allowClear={true}
                    showSearch
                    notFoundContent={<span>No result found </span>}
                  >
                    {filteredDates &&
                      filteredDates.map((d) => {
                        return (
                          <Option
                            key={d}
                            value={d}
                            label={moment(d).format("MMM D, YYYY")}
                          >
                           {moment(d).format("MMM D, YYYY")}
                          </Option>
                        );
                      })}
                  </Select>
                </Space>
                </div>
          </div>
        {/* </div> */}

            <div className="row align-items-center form-group">
                <div className="col-3 confirmation-text">Duration (Hrs): </div>
                <div className="col-8 text-para">
                  <NumberFormat
                    allowNegative={false}
                    value={AddTaskValue}
                    onPaste={handlePaste}
                    onCopy={handleCopy}
                    className="form-control number-control"
                    onValueChange={(value) => {
                      setAddTaskError(false)
                      setAddTaskValue(value?.value);
                    }}
                    placeholder="Enter Task Duration"
                    thousandSeparator={false}
                    inputmode="numeric"
                    maxLength={6}
                    decimalScale={2}
                    style={{ height: '32px' }}
                  />
                  {
  addTaskError && AddTaskValue == '0' && (
    <span className="text-error mt-1">Task Duration must be greater than 0.</span>
  )
}
{
  addTaskError&&AddTaskValue > 999.99 && (
    <span className="text-error mt-1">Task Duration must be less than 1000.</span>
  )
}
                </div>
          </div>
          
        </div>
      </Modal>
      <Modal
        okText={"Yes"}
        cancelText={"No"}
        title="Confirmation Message"
        open={isDeleteModal}
        maskClosable={false}
        onOk={()=>{filterTask();setIsDeleteModal(false)}}
        onCancel={()=>{setSelectedTaskId(null);setIsDeleteModal(false)}}
      >
        <p className="confirmation-text">
          Are you sure you want to delete this task?
        </p>
      </Modal>

      <Modal
        okText={"Yes"}
        cancelText={"No"}
        title="Confirmation Message"
        open={userHoliday}
        maskClosable={false}
        onOk={()=>{taskAfterHoliday()}}
        onCancel={()=>{isUserHoliday(false);setOpenAddTask(true)}}
      >
        <p className="confirmation-text">
          {
          isUserDeleted(selectedStage&&selectedStage?.bidMember?.user?.id)? "This User is already deleted. Are you sure you want to add this task?":`This Team Member is on leave for ${moment(selectedDate).format("MMM D, YYYY")}. Are you sure you still want to add the task?`}
          
        </p>
      </Modal>
    </>
  );
};

export default Plan;
