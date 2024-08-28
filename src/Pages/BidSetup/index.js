import { DatePicker, Tabs, notification, Card, Skeleton, Modal, Button, Tooltip } from "antd";
import React, { useEffect, useState,useRef } from "react";
import moment from "moment";
import dayjs from 'dayjs';
import bidShushi from "../../Services/Api/Api";
import NumberFormat from 'react-currency-format';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useNavigate, useParams } from "react-router-dom";
//components
import Stages from "./Stages";
import Team from "./Team";
import AddQuestion from "./AddQuestion";
import Questions from "./Questions";


//hooks
import DialogLeavingPage from "../../hooks/leave";
import { useNavigatingAway } from "../../hooks/navigateaway";
import { useBidContext } from '../../hooks/useBidContext';
import { useAuthContext } from "../../hooks/useAuthContext";
import { QUESTIONS_ADD_ACTION_API,BID_ERROR, TEAMS_ADD_ACTION_API, STAGES_ADD_ACTION, BID_CONTEXT_RESET_ACTION,BID_ALL_QUESTIONS } from '../../Context/Actions'
import { BID_WORD_COUNT_TYPE, BID_PAGE_COUNT_TYPE, BACKEND_DATE_FORMAT, FRONTEND_DATE_FORMAT, EXTERNAL_ROLE,avatarURL, BID_DRAFT_NAME } from "../../Common";
import RoutesConstant from "../../Routes/Constant";
import BIDSUSHI_TEXT from "../../Common/Constant";


dayjs.extend(customParseFormat);
const { TabPane } = Tabs;

function BidSetup() {
    const navigate = useNavigate();
    const [bidName, setBidName] = useState('');
    const [startDate, setStartDate] = useState(moment().format(FRONTEND_DATE_FORMAT));
    const [endDate, setEndDate] = useState(moment().add(1, 'days').format(FRONTEND_DATE_FORMAT));
    const [bidValue, setBidValue] = useState('');
    const [authority, setAuthority] = useState('');
    const [client, setClientName] = useState('');
    const [bidManager, setBidManager] = useState('');
    const [bidManagerName, setBidManagerName] = useState(null);
    const [weighting, setWeighting] = useState('');
    const [questionType, setQuestionType] = useState(BID_WORD_COUNT_TYPE);
    const [disableTabs, setDisableTabs] = useState(true); // set to true when deploying...
    const [isTeamMembersChange, setTeamMembersChange] = useState(false);
    const [isStageChange, setStageChange] = useState(false);
    const [isQuestionChange, setQuestionChange] = useState(false);
    const [isViewQuestions, setIsViewQuestions] = useState(true); // Set to false
    const [questionIdForEdit, setQuestionIdForEdit] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpen1, setIsModalOpen1] = useState(false);
    const [isModalOpen11, setIsModalOpen11] = useState(false);
    const [isModalOpen12, setIsModalOpen12] = useState(false);
    const [getBidTeamMembers, setBidTeamMembers] = useState('');
    const [getBidStages, setBidstages] = useState('');
    const [bidIdAfterCreate, setBidIdAfterCreate] = useState('');
    const [complexities, setComplexities] = useState([]);
    const [priorites, setPriorities] = useState([]);
    const [showMessage, setShowMessage] = useState('');
    const [bidResponse, setBidResponse] = useState(null);
    const [appSettings, setAppSettings] = useState([]);
    const [bidGenerationError, setBidGenerationError] = useState(false);
    const [allStages, setAllStages] = useState([]);
    const [bidStatus, setBidStatus] = useState(null);
    const [selectedTab,setSelectedTab] = useState('1');
    const [questionCount, setQuestionCount] = useState(0);
    const [isGeneratePlane,setIsGeneratePlan] = useState(false);
    const [isLiveToEdit,setIsLiveToEdit] = useState(false);
    const [rocketloading,setRocketLoading] = useState(false);
    const [hoursPerDay,setHoursPerDay] = useState(null);
    //Notifications
    const [api, contextHolder] = notification.useNotification();

    //error handling
    const [error, setError] = useState({
        bidName: false,
        startDate: false,
        endDate: false,
        bidValue: false,
        authority: false,
        client: false,
        bidManager: false,
        questionType: false
    });
    //GenerateErrors
    const [generateError, setGenerateError] = useState({
        bidName: false,
        startDate: false,
        endDate: false,
        teamMembers: false,
        stages: false,
        questions: false,
    });

    const childRef = useRef();
    //move away code
    const [canShowDialogLeavingPage, setCanShowDialogLeavingPage] = useState(
        false
    );

    const [
        showDialogLeavingPage,
        confirmNavigation,
        cancelNavigation
    ] = useNavigatingAway(canShowDialogLeavingPage);

    function handlePaste(event) {
        event.preventDefault();
      }
      
      function handleCopy(event) {
        event.preventDefault();
      }

    //Bid context
    const { teams, stages, questions, dispatch,allQuestions,isBidError } = useBidContext();
    const { user } = useAuthContext();
    const { bidId } = useParams()

    const disabledDate = (current) => {
        return current && current < moment(startDate, "DD-MM-YYYY")
    };

    const disabledDateStart = (current) => {
        return current && current > moment(endDate, "DD-MM-YYYY")
    };

    const onChangeStartDate = (date, dateString) => {
        setCanShowDialogLeavingPage(true);
        if (dateString) {
            setCanShowDialogLeavingPage(true);
            setStartDate(dateString)
            setError((preState) => {
                return {
                    ...preState,
                    startDate: false,
                };
            });
        } else {
            setStartDate('')
            // setError((preState) => {
            //     return {
            //         ...preState,
            //         startDate: true,
            //     };
            // });
        }
    };

    const onChangeEndDate = (date, dateString) => {
        setCanShowDialogLeavingPage(true);
        if (dateString) {
            setCanShowDialogLeavingPage(true);
            setEndDate(dateString)
            setError((preState) => {
                return {
                    ...preState,
                    endDate: false,
                };
            });
        } else {
            setEndDate('')
            // setError((preState) => {
            //     return {
            //         ...preState,
            //         endDate: true,
            //     };
            // });
        }

    };

    const bidValueChange = (value) => {
        setBidValue(value && value.value)
        const num = Number(value.value);
        if (isNaN(num) || !Number.isSafeInteger(num)) {
            setError((preState) => {
                return {
                    ...preState,
                    bidValue: true,
                };
            });
          } else {
            setError((preState) => {
                return {
                    ...preState,
                    bidValue: false,
                };
            });
          }
       
        if (value && value.value) {
            setCanShowDialogLeavingPage(true);
        }
    };


    const onChangeHandler = (e) => {
        let name = e.target.name;
        let value = e.target.value.trimStart();
        if (value.length > 0) {
            setCanShowDialogLeavingPage(true);
        }

        if (name === "bidName") {
            setBidName(value);
            if (value.length <= 2 || value.length > 255) {
                setError((preState) => {
                    return {
                        ...preState,
                        bidName: true,
                    };
                });
            } else {
                setError((preState) => {
                    return {
                        ...preState,
                        bidName: false,
                    };
                });
            }
        } else if (name == 'authority') {
            setAuthority(value);
            if (value.length >= 255) {
                setError((preState) => {
                    return {
                        ...preState,
                        authority: true,
                    };
                });
            } else {
                setError((preState) => {
                    return {
                        ...preState,
                        authority: false
                    };
                });
            }
        } else if (name == 'client') {
            setClientName(value);
            if (value.length >= 255) {
                setError((preState) => {
                    return {
                        ...preState,
                        client: true,
                    };
                });
            } else {
                setError((preState) => {
                    return {
                        ...preState,
                        client: false,
                    };
                });
            }
        }
        else if (name == 'weighting') {
            setWeighting(value);
            if (value.length >= 255) {
                setError((preState) => {
                    return {
                        ...preState,
                        weighting: true,
                    };
                });
            } else {
                setError((preState) => {
                    return {
                        ...preState,
                        weighting: false,
                    };
                });
            }
        }
        else if (name == 'questionType') {
            setQuestionType(value)
        }
    };


    const checkForError = (isGenerateBid) => {
        setShowMessage(0);

        if (!bidName) {
            setError((preState) => {
                return {
                    ...preState,
                    bidName: true,
                };
            });
        }

        if (isGenerateBid) {
            if (!authority) {
                setError((preState) => {
                    return {
                        ...preState,
                        authority: true,
                    };
                });
            };

            if (!client) {
                setError((preState) => {
                    return {
                        ...preState,
                        client: true,
                    };
                });
            };

            if (!startDate) {
                setError((preState) => {
                    return {
                        ...preState,
                        startDate: true,
                    };
                });
            };

            if (!endDate) {
                setError((preState) => {
                    return {
                        ...preState,
                        endDate: true,
                    };
                });
            };

            if (!bidValue) {
                setError((preState) => {
                    return {
                        ...preState,
                        bidValue: true,
                    };
                });
            }
        }


        if (!questionType) {
            setError((preState) => {
                return {
                    ...preState,
                    questionType: true,
                };
            });
        }
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        saveBid(true);
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const showModal1 = () => {
        setIsModalOpen1(true);
    };

    const showModal11 = () => {
        setIsModalOpen11(true);
    };

    const showModal12 = () => {
        setIsModalOpen12(true);
    };

    const handleOk1 = () => {
        saveBid(true);
        setIsModalOpen1(false);
    };

    const handleOk11 = () => {
        generateBid(true);
        setCanShowDialogLeavingPage(false);
        setIsModalOpen11(false);
    };

    const handleOk12 = () => {
        generateBid(true);
        setCanShowDialogLeavingPage(false);
        setIsModalOpen12(false);
        setTeamMembersChange(false)
    };

    const handleCancel1 = () => {
        setIsModalOpen1(false);
    };

    const handleCancel11 = () => {
        setIsModalOpen11(false);
    };

    const handleCancel12 = () => {
        setIsModalOpen12(false);
    };

    const saveBid = (handle = false) => {
        setShowMessage(0);
        if (
            bidName
            && Object.values(error).every(value => value === false)
        ) {
            if (bidIdAfterCreate == '' && !handle) {
                showModal();
                return;
            }

            if (isQuestionChange && !handle) {
                showModal1();
                return;
            }
            let detail = {
                'name': bidName,
                'startDate': startDate ? moment(startDate, FRONTEND_DATE_FORMAT).format(BACKEND_DATE_FORMAT) :  endDate ?moment(endDate, FRONTEND_DATE_FORMAT).add(-1,'days').format(BACKEND_DATE_FORMAT):moment().format(BACKEND_DATE_FORMAT),
                'endDate': endDate ? moment(endDate, FRONTEND_DATE_FORMAT).format(BACKEND_DATE_FORMAT) :  startDate ?moment(startDate, FRONTEND_DATE_FORMAT).add(1,'days').format(BACKEND_DATE_FORMAT):moment().add(1,'days').format(BACKEND_DATE_FORMAT),
                'authority': authority,
                'clientName': client,
                'bidManagerId': user?.id,
                'value': bidValue,
                'weighting': weighting,
                'questionLimitType': questionType,
                'bidStatusId': bidStatus?bidStatus.toString():null
            };
              

            if (bidIdAfterCreate != '') {
                detail.id = bidIdAfterCreate
            }
            let finalTeams = [];
            if (getBidTeamMembers.length) {
                let team1 = getBidTeamMembers.filter(a => !teams.some(b => b.userId == a.userId && !b.isDeleted))
                let team2 = teams.filter(a => !getBidTeamMembers.some(b => b.userId == a.userId && !a.isDeleted))
                let finalteam1 = team1.map((t) => {
                    return {
                        'sendId': true,
                        ...t
                    }
                })
                finalTeams = [...finalteam1, ...team2];
            } else {
                finalTeams = [...teams];
            }


            const bidDetails = {
                detail,
                bidMembers: finalTeams.map((team) => {
                    let teamMemberObj = {
                        "userId": team.userId,
                        "roleId": team.userRoleId,
                        "firstName": team.firstName,
                        "lastName": team.lastName,
                        "fullName": team.fullName,
                        "contact": team.contact,
                        "avatar": team.avatar,
                        "wordCount": team.wordCount,
                        "createdBy": "SYSTEM",
                        "updatedBy": "SYSTEM",
                        "email": team.email,
                        "skillId": team.userSkillId,
                    }
                    if (bidIdAfterCreate != '') {
                        teamMemberObj.bidId = bidIdAfterCreate
                    }
                    if (team.sendId) {
                        teamMemberObj.id = team.id
                    }
                    return teamMemberObj
                }),
                bidStages: stages.map((stage, index) => {
                    if (stage.newStage) {
                        return {
                            "name": stage.name,
                            "colorId": stage.colorId,
                            "isChecked": stage.isChecked,
                            "sortOrder": index+1,
                            "overhead": stage.overhead,
                            "stageId": stage.stageId,
                            "createdBy": "SYSTEM",
                            "updatedBy": "SYSTEM",
                            "bidId": bidIdAfterCreate,
                            //"id": stage.id
                        }
                    }
                    else {
                        return {
                            "name": stage.name,
                            "colorId": stage.colorId,
                            "isChecked": stage.isChecked,
                            "sortOrder": index+1,
                            "overhead": stage.overhead,
                            "stageId": stage.stageId,
                            "createdBy": "SYSTEM",
                            "updatedBy": "SYSTEM",
                            "bidId": bidIdAfterCreate,
                            "id": stage.id
                        }
                    }
                })

            }
            setLoading(true);
           // dispatch({ type: BID_ERROR, payload: false });
            if (bidIdAfterCreate) {
                bidShushi
                    .updateBid(bidIdAfterCreate, bidDetails)
                    .then((res) => {
                        setLoading(false);
                        setBidResponse(res);
                        setDisableTabs(false)
                        if (res && res.startDate && res.startDate != null) {
                            setStartDate(res && res.startDate && moment(res.startDate, BACKEND_DATE_FORMAT).format(FRONTEND_DATE_FORMAT));
                        }
                        if (res && res.startDate && res.endDate != null) {
                            setEndDate(res && res.endDate && moment(res.endDate, BACKEND_DATE_FORMAT).format(FRONTEND_DATE_FORMAT));
                        }
                        // Able to create team members and stages etc
                        setBidIdAfterCreate(res && res.id)
                        setQuestionChange(false)
                        setIsViewQuestions(true)
                        setShowMessage(0)
                        setBidManager(user?.id);
                        if (res.bidMembers && res.bidMembers.length > 0) {
                            dispatch({ type: TEAMS_ADD_ACTION_API, payload: res.bidMembers })
                        }
                       // dispatch({ type: STAGES_ADD_ACTION, payload: res.bidStages && res.bidStages.sort((a, b) => a.sortOrder - b.sortOrder) });
                        dispatch({ type: STAGES_ADD_ACTION, payload: res.bidStages && res.bidStages.sort((a, b) => a.sortOrder - b.sortOrder) });
                        setTeamMembersChange(false)
                        setStageChange(false)
                        setCanShowDialogLeavingPage(false)
                        setBidTeamMembers(res.bidMembers);
                        setBidstages(res.bidStages);
                        //will remove once go for QA
                        // if (res.bidQuestions && res.bidQuestions.length > 0) {
                        //     let updatedQuestion = res.bidQuestions.map((a, i) => {
                        //         return {
                        //             teamMembers: a.bidQuestionStagesJSON && a.bidQuestionStagesJSON.length && a.bidQuestionStagesJSON.map(m => m.bidMember),
                        //             ...a
                        //         }
                        //     })
                        //     dispatch({ type: BID_ALL_QUESTIONS, payload: updatedQuestion });
                        // }
                        // else {
                        //     dispatch({ type: BID_ALL_QUESTIONS, payload: [] });
                        // }
                        api.success({
                            message: `Success`,
                            description: BIDSUSHI_TEXT.bidCreated,
                            placement: 'topRight'
                        })
                
                
                        if (res && (!res.bidStages ||res&&res.bidStages.length==0||res.bidStages.every(a=>a.isChecked==false)))  {
                            setGenerateError((preState)=>{
                                return{
                                    ...preState,
                                     stages:true
                                }
                            })
                        }else{
                            setGenerateError((preState)=>{
                                return{
                                    ...preState,
                                    stages:false
                                }
                            })
                        }
                
                        if (res && (!res.bidMembers ||res.bidMembers.length == 0 || res.bidMembers.every(a => a.role?.name === EXTERNAL_ROLE))) {
                            setGenerateError((preState)=>{
                                return{
                                    ...preState,
                                    teamMembers:true
                                }
                            })
                        }else{
                            setGenerateError((preState)=>{
                                return{
                                    ...preState,
                                    teamMembers:false
                                }
                            })
                        }
                
                        // TODO: Show success msg here and navigate to /bidSetup/Edit...
                    })
                    .catch((err) => {
                        setLoading(false)
                        setDisableTabs(false)
                        // Show some error msg here
                        api.error({
                            message: `Failed`,
                            description: 'Bid Failed.',
                            placement: 'topRight'
                        })
                    });
            } else {
                setCanShowDialogLeavingPage(false)
                bidShushi
                    .createBid(bidDetails)
                    .then((res) => {
                        // Able to create team members and stages etc
                       
                        setDisableTabs(false);
                        setBidResponse(res);
                        setBidIdAfterCreate(res && res.id)
                        setQuestionChange(false)
                        setTeamMembersChange(false)
                        setStageChange(false)   
                        setBidManager(user?.id)
                        setCanShowDialogLeavingPage(false)
                     //   console.log(res.bidMembers)
                        setBidTeamMembers(res.bidMembers ? res.bidMembers : []);
                        dispatch({ type: STAGES_ADD_ACTION, payload: res.bidStages && res.bidStages.sort((a, b) => a.sortOrder - b.sortOrder) });
                        setBidstages(res.bidStages ? res.bidStages : []);
                        if (res.bidMembers && res.bidMembers.length > 0) {
                            dispatch({ type: TEAMS_ADD_ACTION_API, payload: res.bidMembers })
                        }
                        if (res && res.startDate && res.startDate != null) {
                            setStartDate(res && res.startDate && moment(res.startDate, BACKEND_DATE_FORMAT).format(FRONTEND_DATE_FORMAT));
                        }else{
                            setStartDate(startDate ? moment(startDate, FRONTEND_DATE_FORMAT) :  endDate ?moment(endDate, FRONTEND_DATE_FORMAT).add(-1,'days'):moment().format(FRONTEND_DATE_FORMAT))
                        }
                        if (res && res.startDate && res.endDate != null) {
                            setEndDate(res && res.endDate && moment(res.endDate, BACKEND_DATE_FORMAT).format(FRONTEND_DATE_FORMAT));
                        }else{
                            setEndDate(endDate ? moment(endDate, FRONTEND_DATE_FORMAT):  startDate ?moment(startDate, FRONTEND_DATE_FORMAT).add(1,'days'):moment().add(1,'days').format(FRONTEND_DATE_FORMAT))
                        }
                        navigate(`/bidsetup/${res?.id}`, { replace: true });
                        setLoading(false);
                        api.success({
                            message: `Success`,
                            description: BIDSUSHI_TEXT.bidCreated,
                            placement: 'topRight'
                        })
                        // TODO: Show success msg here and navigate to /bidSetup/Edit...
                    })
                    .catch((err) => {
                        setLoading(false);
                        setDisableTabs(true)
                        // Show some error msg here
                        api.error({
                            message: `Failed`,
                            description: 'Bid Failed.',
                            placement: 'topRight'
                        })
                    });
            }
        }
        else {
            checkForError(false);
        }
    };

    const generateBid = (handle = false) => {
        if (isQuestionChange && !handle) {
            showModal11();
            return;
        }

        if ((isStageChange && !handle)||(isTeamMembersChange&&!handle)) {
            showModal12();
            return;
        }

        // if(!startDate && !endDate){
        //     return
        // }
      setShowMessage(0);
      setLoading(true);
      setIsViewQuestions(true);
      checkErrorForBidGeneration();
      setIsGeneratePlan(true);
      setQuestionChange(false);
      bidShushi
        .getBidInvalidQuestion(bidId)
        .then((res) => {
         setIsGeneratePlan(false);
        // setLoading(false); 
          if (res && res.data.isError) {
            setBidGenerationError(true);
            dispatch({ type: BID_ERROR, payload: true });
            setLoading(false); 
            setGenerateError((preState) => {
              return {
                ...preState,
                questions: true,
              };
            });
          } else {
            setRocketLoading(true)
            bidShushi.generateBid(bidId)
            .then(res=>{
               
               if(res&&!res.isError){
                dispatch({ type: BID_ERROR, payload: false });
                if (bidName) {
                  navigate(`/bidmanagement/${bidId}?tab=plan`);
                }
                setLoading(false); 
                setRocketLoading(false)
               }else{
               dispatch({ type: BID_ERROR, payload: true });
                setGenerateError((preState) => {
                    return {
                      ...preState,
                      questions: true,
                    };
                  });
                setLoading(false); 
                setRocketLoading(false)
               }
            }).catch(err=>{
                checkErrorForBidGeneration();
                setLoading(false);
                setRocketLoading(false)
                console.log(err)
            })
          };
        })
        .catch((err) => {
         setLoading(false);
         setIsGeneratePlan(false);
          console.log(err);
          notification.error({
            message:"Failed",
            description:"Unable to Generate Plan."
          })
        })
        setIsGeneratePlan(false);      
    };

   
    useEffect(() => {
        if (bidName && !bidGenerationError && Object.values(generateError).every((value) => value === false)) {
          setDisableTabs(false);
        //    bidShushi.generateBid(bidId)
        //    .then(()=>{
        //     navigate(`/bidmanagement/${bidId}?tab=plan`, { replace: true });
        //    }).catch(err=>{
        //     console.log(err);
        //    })
        } else {
          console.log("fail")
        } 
      }, [ bidGenerationError, generateError]);

    const handleTeamMembersChange = (newValue) => {
        setTeamMembersChange(newValue);
        setCanShowDialogLeavingPage(true)
    };

    const handleStageChange = (newValue) => {
        setStageChange(newValue);
        setCanShowDialogLeavingPage(true)
    };

    const handleQuestionChange = (newValue) => {
        setQuestionChange(newValue);
        setCanShowDialogLeavingPage(true)
    };

    const handleQuestionCount = () => {
        setQuestionCount(questionCount + 1);
    }

    const handleShowMessage = (value) => {
        setShowMessage(value); // 1 for question create, 2 for question edit
    }

    const getQuestionId = (newValue) => {
        setQuestionIdForEdit(newValue);
        setIsViewQuestions(false);
    }

    const handleViewQuestions = (newValue) => {
        setIsViewQuestions(newValue);
    }

    const handleQuestionIdForEdit = (newValue) => {
        setQuestionIdForEdit(newValue);
    }

    const checkErrorForBidGeneration = () => {
        if (bidResponse && !bidResponse.startDate) {
            setBidGenerationError(true);
            setGenerateError((preState)=>{
                return{
                    ...preState,
                     startDate:true
                }
            })
        }else{
            setBidGenerationError(false);
            setGenerateError((preState)=>{
                return{
                    ...preState,
                    startDate:false
                }
            })
        }

        if (bidResponse && !bidResponse.endDate) {
            setBidGenerationError(true); 
            setGenerateError((preState)=>{
                return{
                    ...preState,
                     endDate:true
                }
            })
        }else{
            setBidGenerationError(false);
            setGenerateError((preState)=>{
                return{
                    ...preState,
                    endDate:false
                }
            })
        }

        if (bidResponse && (!bidResponse.bidStages ||bidResponse&&bidResponse.bidStages.length==0||bidResponse.bidStages.every(a=>a.isChecked==false||a.isChecked==null)))  {
           setBidGenerationError(true);
            setGenerateError((preState)=>{
                return{
                    ...preState,
                     stages:true
                }
            })
        }else{
            setBidGenerationError(false);
            setGenerateError((preState)=>{
                return{
                    ...preState,
                    stages:false
                }
            })
        }

        if (bidResponse && (!bidResponse.bidMembers ||bidResponse.bidMembers.length == 0 || bidResponse.bidMembers.every(a => a.role?.name === EXTERNAL_ROLE))) {
        //    setTeamMembersChange(true);
           setBidGenerationError(true);
            setGenerateError((preState)=>{
                return{
                    ...preState,
                    teamMembers:true
                }
            })
        }else{
            setBidGenerationError(false);
            setGenerateError((preState)=>{
                return{
                    ...preState,
                    teamMembers:false
                }
            })
        }
    }

    useEffect(() => {
        dispatch({ type: BID_ERROR,payload:false });
        if (bidId) {
            setLoading(true);
            getBidQuestions();
            bidShushi.getBid(bidId)
                .then((res) => {
                   //   console.log(res);
                    setBidResponse(res);
                    setBidName(res && res.name);
                    if (res && res.startDate && res.startDate != null) {
                        setStartDate(res && res.startDate && moment(res.startDate, BACKEND_DATE_FORMAT).format(FRONTEND_DATE_FORMAT));
                    }
                    if (res && res.startDate && res.endDate != null) {
                        setEndDate(res && res.endDate && moment(res.endDate, BACKEND_DATE_FORMAT).format(FRONTEND_DATE_FORMAT));
                    }
                    setAuthority(res && res.authority);
                    setBidManager(res && res.bidManagerId);
                    setBidManagerName(res && res.bidManager?.fullName);
                    setClientName(res && res.clientName);
                    setBidValue(res && res.value ? res.value : '');
                    setQuestionType(res && res.questionLimitType);
                    setWeighting(res && res.weighting);
                    setBidIdAfterCreate(res && res.id);
                    setBidTeamMembers(res && res.bidMembers);
                    setBidStatus(res && res.bidStatusId);
                    setHoursPerDay(res&&res?.hoursPerDay)
                    if(res.bidStatusId==2){
                       setIsLiveToEdit(true);
                    }
                    if(res.bidStatusId==3){
                     navigate(RoutesConstant.main)
                    }
                    setBidstages(res.bidStages);
                //    setQuestionCount(res.bidQuestions.length);
                    if (res.bidManagerId != user.id) {
                        navigate(RoutesConstant.main)
                        setDisableTabs(true)
                    }
                    else {
                        setDisableTabs(false);
                    }
                    if (res.bidMembers && res.bidMembers.length > 0) {
                        dispatch({ type: TEAMS_ADD_ACTION_API, payload: res.bidMembers })
                    }
                    if (res.bidStages && res.bidStages.length > 0) {
                        dispatch({ type: STAGES_ADD_ACTION, payload: res.bidStages && res.bidStages.sort((a, b) => a.sortOrder - b.sortOrder) });
                    }
                    //add call for that.
                    // if (res.bidQuestions && res.bidQuestions.length > 0) {
                    //     let updatedQuestion = res.bidQuestions.map((a, i) => {
                    //         return {
                    //             teamMembers: a.bidQuestionStagesJSON && a.bidQuestionStagesJSON.length && a.bidQuestionStagesJSON.map(m => m.bidMember),
                    //             ...a
                    //         }
                    //     })
                    //     dispatch({ type: BID_ALL_QUESTIONS, payload: updatedQuestion });
                    // }
                    // else {
                    //     dispatch({ type: BID_ALL_QUESTIONS, payload: [] });
                    // }
                    setLoading(false);
                }).catch(err => {
                    if (err?.code == 400 || err?.code == 404) {
                        navigate('404')
                    }
                    if (err?.code == 403) {
                        navigate('/')
                    }
                })

               
        }
        else {
            dispatch({ type: BID_CONTEXT_RESET_ACTION });
        }
        getData();
        // testing()
    }, []);

    useEffect(() => {
        if (!isQuestionChange && !isTeamMembersChange && !isStageChange) {
            setCanShowDialogLeavingPage(false);
        }
    }, [isQuestionChange, isViewQuestions])

    const getData = () => {

        bidShushi.getStages().then((res) => {
            let finalRes = res && res.data.map((r) => {
                return {
                    isChecked: r.isActive,
                    stageId: r.id,
                    ...r
                }
            })
            setAllStages(finalRes)
        })

        bidShushi
            .getQuestionComplexities()
            .then((res) => {
                setComplexities(res)
            })
            .catch((err) => {
                console.log(err);
            });

        bidShushi
            .getQuestionPriorities()
            .then((res) => {
                setPriorities(res)
            })
            .catch((err) => {
                console.log(err);
            });

        bidShushi
            .getBidStatuses()
            .then((res) => {
                setBidStatus(res.find(r => r.name == BID_DRAFT_NAME)?.id);
            })
            .catch((err) => {
                console.log(err);
            });

        bidShushi
            .getAppSettings().then((res)=> {
                setAppSettings(res);
              })
             .catch(err => console.log(err))
    }
  
    const getBidQuestions = () => {

        bidShushi
          .getBidQuestion(bidId, 0, -1)
          .then((res) => {
           //for team Members and stages check
           if (res.data && res.data.length > 0) {
            // let updatedQuestion = res.bidQuestions.map((a, i) => {
            //     return {
            //         teamMembers: a.bidQuestionStagesJSON && a.bidQuestionStagesJSON.length && a.bidQuestionStagesJSON.map(m => m.bidMember),
            //         ...a
            //     }
            // })
            dispatch({ type: BID_ALL_QUESTIONS, payload: res.data });
            setQuestionCount(res.data.length)
        }
        else {
            dispatch({ type: BID_ALL_QUESTIONS, payload: [] });
            setQuestionCount(0)
        }
          })
          .catch((err) => {
            console.log(err);
          });
    };
   
    const liveToDraft = () => {
        bidShushi
          .draftBid(bidIdAfterCreate)
          .then((res) => {
              setIsLiveToEdit(false);
             //navigate(`${RoutesConstant.bidSetup}/${selectedBid&&selectedBid.id}`)
          })
          .catch((err) => {
            //setIsLiveToEdit(false);
            console.log(err);
          });
      };

    return (
        <>
            {contextHolder}
            <DialogLeavingPage
                showDialog={showDialogLeavingPage}
                setShowDialog={setCanShowDialogLeavingPage}
                confirmNavigation={confirmNavigation}
                cancelNavigation={cancelNavigation}
            />
            
      {rocketloading && <div className="container-loader">
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
      }
            <div className="row title-bar">
                <div className="col-6">
                    {

                    
                    !loading? <h2 className="secondary-heading mt-2">Bid Setup</h2>:null}
                </div>

                {
                    loading ? <Skeleton loading={loading} avatar={true} /> : <div className="col-6 text-end">
                        {
                            ((bidManager && bidId && bidManager == user?.id) || !bidId) ? <a onClick={() => { saveBid() }} className="btn btn-primary me-3"><img src="/images/save-icon.png" /> Save Bid</a> : ''
                        }
                        <a  style={{pointerEvents:isGeneratePlane?"none":'cursor'}}  onClick={() => {generateBid()}} className={(!bidId || disableTabs) ? "btn btn-blue disabled": "btn btn-blue"}><img src="/images/bid-icon.png" />  Generate Bid Plan</a>
                    </div>
                }
                <div className="col-12">
                    <hr />
                </div>
            </div>
            {
                loading ? <Skeleton loading={loading} avatar={true} /> : <div className="form-wrapper bg-gray border-rounded p-3">
                    <div className="row">
                        <div className="col-3 form-group">
                            <label>Name of the Bid</label>
                            <input name="bidName" value={bidName}
                                onChange={
                                    (e) => {
                                        setBidName(e.target.value)
                                        setError((preState) => {
                                            return {
                                                ...preState,
                                                bidName: false
                                            }
                                        })
                                    }
                                }
                                onBlur={(e) => onChangeHandler(e)}
                                type="text" className="form-control" placeholder="Enter Name of the Bid" />

                            {!bidName && error.bidName ? (
                                <span className="text-danger text-error">Bid name is required.</span>
                            ) : null}
                            {bidName && error.bidName ? (
                                <span className="text-danger text-error">Bid name must be greater then 2 and less than 255 characters.</span>
                            ) : null}
                        </div>
                        <div className="col-3 form-group">
                            <div className="row">
                                <div className="col-6">
                                    <label>Start Date</label>
                                    <DatePicker className="form-control"
                                        value={startDate ? dayjs(startDate, FRONTEND_DATE_FORMAT) : ''}
                                        format={FRONTEND_DATE_FORMAT}
                                        onChange={onChangeStartDate}
                                        allowClear={true}
                                        disabledDate={disabledDateStart}
                                    // onBlur={(e) => onChangeHandler(e)}
                                    />
                                    {!startDate && generateError.startDate ? (
                                        <span className="text-danger text-error">Start Date is required.</span>
                                    ) : null}
                                </div>
                                <div className="col-6">
                                    <label>End Date</label>
                                    <DatePicker className="form-control"
                                        value={endDate ? dayjs(endDate, FRONTEND_DATE_FORMAT) : ''}
                                        format={FRONTEND_DATE_FORMAT}
                                        onChange={onChangeEndDate}
                                        allowClear={true}
                                        // onBlur={(e) => onChangeHandler(e)}
                                        disabledDate={disabledDate}
                                    />
                                    {!endDate && generateError.endDate ? (
                                        <span className="text-danger text-error">End Date is required.</span>
                                    ) : null}
                                </div>
                            </div>

                        </div>
                        <div className="col-3 form-group">
                            <label>Authority</label>
                            <input type="text" name="authority" value={authority} onChange={(e) => {
                                setAuthority(e.target.value)
                                setCanShowDialogLeavingPage(true);
                                setError((preState) => {
                                    return {
                                        ...preState,
                                        authority: false
                                    }

                                }
                                
                                )
                            }} onBlur={(e) => onChangeHandler(e)} 
                                className="form-control" placeholder="Enter Authority" />
                            {/* {!authority && error.authority ? (
                                <span className="text-danger text-error">Authority name is required.</span>
                            ) : null} */}
                            {authority && error.authority ? (
                                <span className="text-danger text-error">Authority name must be less than 255 characters.</span>
                            ) : null}
                        </div>

                        <div className="col-3 form-group">
                            <label>Client Name</label>
                            <input type="text" name="client" value={client} onChange={(e) => {
                                setClientName(e.target.value);
                                setCanShowDialogLeavingPage(true);
                                setError((preState) => {
                                    return {
                                        ...preState,
                                        client: false
                                    }
                                })
                            }} onBlur={(e) => onChangeHandler(e)} 
                                className="form-control" placeholder="Enter Client Name" />
                            {/* {!client && error.client ? (
                                <span className="text-danger text-error">Client name is required.</span>
                            ) : null} */}
                            {client && error.client ? (
                                <span className="text-danger text-error">Client name must be less then 255 characters.</span>
                            ) : null}
                        </div>

                        <div className="col-3 form-group">
                            <div className="search-group">
                                <label>Bid Manager</label>

                                {/*<div>{user?.email || ''}</div>*/}
                                <span className="bid-manager-info">
                                                
                                                {
                                                  (user?.avatar != null && user?.avatar != 'null')   ?<img src={avatarURL+user.avatar} alt="BidManager" /> :<img src="/images/user-circle.png" alt="BidManager" />
                                                }
                                      <Tooltip color="#fff" title={bidManagerName ? bidManagerName : user?.fullName}>
                                      <span className="name d-inline-block text-ellipse" style={{maxWidth: '280px', verticalAlign: 'middle'}}>{bidManagerName ? bidManagerName : user?.fullName}</span>
                                      </Tooltip>
                                   
                                </span>
                                {/* <input type="text" className="form-control" placeholder="Bid Manager" /> */}
                                {/* <i className="fa fa-search"></i> */}
                            </div>
                        </div>

                        <div className="col-3 form-group">
                            <label>Bid Evaluation Weighting</label>
                            <input type="text" value={weighting} name="weighting" onChange={(e) => {
                                setWeighting(e.target.value);
                                setCanShowDialogLeavingPage(true);
                                setError((preState) => {
                                    return {
                                        ...preState,
                                        weighting: false
                                    }
                                })
                                }} onBlur={(e) => onChangeHandler(e)}  className="form-control" placeholder="Enter Bid Evaluation Weighting" />
                                                            {weighting && error.weighting ? (
                                <span className="text-danger text-error">Bid Evaluation Weighting must be less then 255 characters.</span>
                            ) : null}
                        </div>

                        <div className="col-3 form-group">
                            <div className="currency-group">
                                <label>Bid Value</label>

                                <NumberFormat  allowNegative={false} value={bidValue} onPaste={handlePaste} onCopy={handleCopy} className="form-control" onValueChange={(value) => {
                                    bidValueChange(value)
                                }}
                                decimalScale={0}  suffix='.00' placeholder="Enter Bid Value" thousandSeparator={true} inputmode="numeric" />
                                <c className="symbol">£</c>
                            </div>
                            {bidValue && error.bidValue ? (
                                <span className="text-danger text-error">Bid Value limit exceeded.</span>
                            ) : null}
                        </div>

                        <div className="col-3 form-group">
                            <label >Question Limit Type</label>
                            <br />
                            <div className="form-check form-check-inline mt-2">
                                <input disabled={bidIdAfterCreate == '' ? false : true} checked={questionType === BID_WORD_COUNT_TYPE} onChange={(e) => onChangeHandler(e)} type="radio" id="wordCount" name="questionType" value={BID_WORD_COUNT_TYPE} className="form-check-input"  style={{"margin-top": '6px'}}/>
                                <label for="wordCount" className="form-check-label">Word Count</label>
                            </div>
                            <div className="form-check form-check-inline mt-2">
                                <input disabled={bidIdAfterCreate == '' ? false : true} checked={questionType === BID_PAGE_COUNT_TYPE} onChange={(e) => onChangeHandler(e)} type="radio" id="pageCount" name="questionType" value={BID_PAGE_COUNT_TYPE} className="form-check-input" style={{"margin-top": '6px'}} />
                                <label for="pageCount" className="form-check-label">Page Count</label>
                            </div>
                            <br />
                            {!questionType && error.questionType ? (
                                <span className="text-danger text-error">Please select a question type.</span>
                            ) : null}
                        </div>
                    </div>
                </div>
            }

            {
                !loading ? <div className="bg-light border-rounded tabs-main-wrapper">
                    <Tabs  onChange={(key)=>setSelectedTab(key)}  activeKey={selectedTab} className={!disableTabs ? "bidsetup-tab" : "bidsetup-tab disabled"}>
                        <TabPane tabKey={'1'} disabled={disableTabs} tab={<> <div className='tab-header error-msg'> {generateError.teamMembers &&bidGenerationError&&<i class="fa fa-asterisk"></i>}Team Members {isTeamMembersChange && <span className="text-danger">*</span>}</div> </>} key="1">
                            <div className="tab-content m-0">
                            { generateError.teamMembers&&bidGenerationError&&<p className="text-error ml-3 font-weight-bold">{BIDSUSHI_TEXT.errorInTeamMember} </p> }
                                <Team selectedTab={selectedTab} loading={loading} disabled={disableTabs} setTeamMembersChange={handleTeamMembersChange} />
                            </div>
                        </TabPane>

                        <TabPane  tabKey={'2'} disabled={disableTabs} tab={<> <div className='tab-header error-msg'>{bidGenerationError&&generateError.stages && <i class="fa fa-asterisk"></i>}Stages {isStageChange && <span className="text-danger">*</span>}</div></>} key="2">
                            <div className="tab-content m-0">
                                {bidGenerationError &&generateError.stages&&<p className="text-error ml-3 font-weight-bold">{BIDSUSHI_TEXT.errorInStage} </p> }
                                <Stages selectedTab={selectedTab} setStageChange={handleStageChange} resBidStages={getBidStages} />
                            </div>
                        </TabPane>
                        <TabPane
                        tabKey={'3'}
                            disabled={disableTabs}
                            tab={
                                <>
                                    <div className='tab-header error-msg'>
                                   {isBidError&& <i class="fa fa-asterisk"></i>}
                                        Questions{' '}
                                        {!disableTabs && isViewQuestions && (
                                            <span className="question-total">
                                                ({allQuestions&&allQuestions.length})
                                            </span>
                                        )}
                                        {isQuestionChange && (
                                            <span className="text-danger">*</span>
                                        )}
                                    </div>
                                </>
                            }
                            key="3"
                        >
                            {(getBidStages&&getBidStages.length > 0 && getBidTeamMembers&& getBidTeamMembers.length > 0 && isViewQuestions) ? <div className="float-end add-question-btn"><button className="btn btn-success" onClick={() => { setIsViewQuestions(false); setQuestionIdForEdit('') }}><i className="fa fa-plus-square-o me-1"></i> Add New Question</button></div> : ''}
                            {
                                <>
                              {
                                isViewQuestions ? <Questions selectedTab={selectedTab}  ref={childRef}  loading={loading} getQuestionId={getQuestionId} complexities={complexities} priorites={priorites} showMessage={showMessage} bidGenerationError={bidGenerationError} bidQuestionType={questionType} bidStages={getBidStages} bidTeamMembers={getBidTeamMembers}/> : <AddQuestion hoursPerDay={hoursPerDay} loading={loading} setQuestionChange={handleQuestionChange} setQuestionCount={handleQuestionCount} setViewQuestion={handleViewQuestions} questionIdForEdit={questionIdForEdit} setQuestionIdForEdit={handleQuestionIdForEdit} bidId={bidIdAfterCreate} bidTeamMembers={getBidTeamMembers} bidStages={getBidStages} bidQuestionType={questionType} complexities={complexities} priorites={priorites} appSettings={appSettings} handleShowMessage={handleShowMessage} />
                               
                               }
                               </>
                            }
                        </TabPane>
                    </Tabs>
                    <Modal  okText={BIDSUSHI_TEXT.Yes} cancelText={BIDSUSHI_TEXT.No} title={BIDSUSHI_TEXT.confirmation} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                        <p className="confirmation-text color-gray mb-3">{BIDSUSHI_TEXT.questionLimitType}</p>
                        <p className="confirmation-text">{BIDSUSHI_TEXT.saveBid}</p>
                    </Modal>

                    <Modal  okText={BIDSUSHI_TEXT.Yes} cancelText={BIDSUSHI_TEXT.No}title={BIDSUSHI_TEXT.confirmation} open={isModalOpen1} onOk={handleOk1} onCancel={handleCancel1}>
                        <p className="confirmation-text color-gray mb-3">{BIDSUSHI_TEXT.unsaveQuestionTab} </p>
                        <p className="confirmation-text">{BIDSUSHI_TEXT.saveBid}</p>
                    </Modal>

                    <Modal  okText={BIDSUSHI_TEXT.Yes} cancelText={BIDSUSHI_TEXT.No} title={BIDSUSHI_TEXT.confirmation} open={isModalOpen11} onOk={handleOk11} onCancel={handleCancel11}>
                        <p className="confirmation-text color-gray mb-3">{BIDSUSHI_TEXT.generatePlanWithoutSaved} </p>
                        <p className="confirmation-text">{BIDSUSHI_TEXT.generateBidPlan}</p>
                    </Modal>

                    <Modal  okText={BIDSUSHI_TEXT.Yes} cancelText={BIDSUSHI_TEXT.No} title={BIDSUSHI_TEXT.confirmation} open={isModalOpen12} onOk={handleOk12} onCancel={handleCancel12}>
                        <p className="confirmation-text color-gray mb-3">{BIDSUSHI_TEXT.unsavedChangesPopupMessage} </p>
                    </Modal>
                    <Modal
        okText={"Yes"}
        cancelText={"No"}
        title="Confirmation Message"
        open={isLiveToEdit}
        onOk={() => liveToDraft()}
        onCancel={() => navigate('/')}
        maskClosable={false}
      >
        <p class="text-para">This Bid is currently live. if you edit it will move the bid to a "Draft" status?</p>
        <p className="confirmation-text">{BIDSUSHI_TEXT.wantToProceed}</p>
      </Modal>
                    {/* <Modal title="Generate Bid Plan Errors" onOk={() => setBidGenerationError(false)} open={bidGenerationError} onCancel={() => setBidGenerationError(false)}>
                        {
                            <>
                                <p>Bid info </p>
                                {bidResponse && (!bidResponse.startDate && !bidResponse.endDate) && <ul>
                                    {bidResponse && !bidResponse.startDate && <li className="font-weight-bold">Start Date is required</li>}
                                    {bidResponse && !bidResponse.endDate && <li className="font-weight-bold">End Date is required</li>}
                                </ul>}

                                {
                                    bidResponse && bidResponse.bidMembers &&
                                    (bidResponse.bidMembers.length == 0 || bidResponse.bidMembers.every(a => a.role?.name === EXTERNAL_ROLE)) && <div>
                                        <p>Bid Members</p>
                                        <p>Please Select atleast one bid Member</p>
                                    </div>
                                }

                                {
                                    bidResponse && bidResponse.bidStages && bidResponse.bidStages.length == 0 && <div>
                                        <p>Bid Stages</p>
                                        <p>Please Select atleast one bid stage</p>
                                    </div>
                                }
                                {
                                    bidResponse && bidResponse.bidQuestions && bidResponse.bidQuestions.length == 0 && <div>
                                        <p>Questions</p>
                                        <p>Please create atleast one Question</p>
                                    </div>
                                }
                                {
                                    bidResponse && bidResponse.bidQuestions && bidResponse.bidQuestions.length > 0 && bidResponse.bidQuestions.filter(a => a.detail && a.detail.length > 0).map((q, i) => {
                                        return <div>
                                            <h3 className="font-weight-bold">{q?.questionName}</h3>
                                            <ul>{
                                                q?.detail.map((d) => <li>{d.value}</li>)
                                            }</ul>
                                        </div>
                                    })
                                }
                            </>
                        }
                    </Modal> */}
                </div>

                    : <Skeleton loading={loading} avatar>
                    </Skeleton>}

        </>
    );
}

export default BidSetup;
