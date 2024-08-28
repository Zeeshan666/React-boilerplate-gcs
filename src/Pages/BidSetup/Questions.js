import React, { useState, useEffect, forwardRef, useRef, useImperativeHandle} from "react";
import {
  Popover,
  Modal,
  Checkbox,
  notification,
  Tooltip,
  Skeleton,
} from "antd";
import { useBidContext } from "../../hooks/useBidContext";
import { CirclePicker } from "react-color";
import { BID_PAGE_COUNT_TYPE, colorsList as colors } from "../../Common";
import {
  QUESTIONS_COLOR_ACTION,
  QUESTIONS_DELETE_ACTION,
  QUESTIONS_EDIT_ACTION,
  BID_ALL_DELETE_QUESTIONS,
  BID_ERROR
} from "../../Context/Actions";
import bidShushi from "../../Services/Api/Api";
import InfiniteScroll from "react-infinite-scroll-component";
import { useParams } from "react-router-dom";
import { QUESTIONS_ADD_ACTION_API } from "../../Context/Actions";
import BIDSUSHI_TEXT from "../../Common/Constant";

const Questions = forwardRef(({ selectedTab,getQuestionId, complexities, priorites, showMessage,bidGenerationError, bidQuestionType, bidStages, bidTeamMembers },ref) => {
  const { dispatch, teams, questions, isBidError, allQuestions } = useBidContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionToRemove, setQuestionToRemove] = useState("");
  const [bidQuestions, setQuestions] = useState([]);
  const [api, contextHolder] = notification.useNotification();
  const [totalQuestions, setTotalQuestions] = useState("");
  const [pageNumber, setPageNumeber] = useState(0);
  const [loading, setIsloading] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [isCheckedloading,setIsCheckedLoading] = useState(false);
  const [questionLength,setQuestionLength] = useState(null);
  const [isErrorLoader,setIsErrorLoader] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [allUser,setAllUser] = useState(null);
  const { bidId } = useParams();
  const editQuestion = (questionId) => {
    getQuestionId(questionId);
  };

  const showModal = (q) => {
    setIsModalOpen(true);
    setQuestionToRemove(q);
  };

  const handleOk = (questionToRemove) => {
    bidShushi
      .deleteQuestion(questionToRemove.id)
      .then((res) => {
        setIsModalOpen(false);
        dispatch({ type: QUESTIONS_DELETE_ACTION, payload: questionToRemove });
        dispatch({type: BID_ALL_DELETE_QUESTIONS, payload: questionToRemove })
        setQuestions(
          bidQuestions.filter((question) => question !== questionToRemove)
        );
        //hide with QA
      //  dispatch({ type: BID_ERROR, payload: false });
      if (isBidError) {
        checkErrorFromApi() 
      }
        api.success({
          message: `Success`,
          description: BIDSUSHI_TEXT.questionDeleted,
          placement: "topRight",
        });
      })
      .catch((err) => {
        console.log(err);
        api.error({
          message: `Error`,
          description: "Error in deleting the question.",
          placement: "topRight",
        });
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

   // with whatever you return from the callback passed
  // as the second argument
  useImperativeHandle(ref, () => ({
    checkForError() {
        let updated = (bidQuestions || []).map((element, i) => {
       //   console.log(element)
        return {
            ...element,
            detail: [
                ...(element.detail || []),
                ...(!element.wordCount ? [{
                    Key: "Word Count ",
                    value: 'Word Count is required.',
                }] : []),
                ...(element.bidQuestionStagesJSON && element.bidQuestionStagesJSON.every(a => !a.isChecked) ? [{
                    Key: "Stages",
                    value: 'Question Stage is required.',
                }] : []),
                ...(element.bidQuestionStagesJSON && element.bidQuestionStagesJSON.some(a => a.wordEquiv==null ) ? [{
                    Key: "Word Eqvivalent",
                    value: 'Time Equivalent (Days) is required.',
                }] : []),
                ...(element.bidQuestionStagesJSON && element.bidQuestionStagesJSON.some(a => !a.bidMember) ? [{
                    Key: "Assign to",
                    value: BIDSUSHI_TEXT.atleastOne,
                }] : [])
            ]
        };
    });
        setQuestions(updated);
    }
  }))

  const fetchMoreData = (value) => {
    setIsloading(true);
    let size;
    if(!isChecked){
      bidShushi
      .getBidQuestion(bidId, pageNumber, (size = 25),inputValue)
      .then((res) => {
       setIsloading(false);
        setTotalQuestions(res.totalItems);
        setPageNumeber((preState) => preState + 1); // bcz page starts from 0
        setAllUser(res?.users);
        setIsErrorLoader(false)
        if (res.data) {
          if(res&&res.totalItems){
            setQuestionLength(res.totalItems);
          }
          if (res.data && res.data.length > 0&&res.totalItems!=0) {
            let updatedQuestion = res.data.map((a, i) => {
              return {
                teamMembers:
                  a.bidQuestionStagesJSON &&
                  a.bidQuestionStagesJSON.length &&
                  a.bidQuestionStagesJSON.map((m) => m.bidMember),
                ...a,
              };
            });
            if(isBidError){
                   let updated = (updatedQuestion|| []).map((element, i) => {
                 return {
                    ...element,
                    detail: [
                        ...(element.detail || []),
                        ...(!element.wordCount ? [{
                            Key: "Word Count ",
                            value: bidQuestionType === BID_PAGE_COUNT_TYPE ?BIDSUSHI_TEXT.wcEqvivalentRequired :BIDSUSHI_TEXT.wcEqvivalentRequired,
                        }] : []),
                        ...(element.bidQuestionStagesJSON && element.bidQuestionStagesJSON.every(a => !a.isChecked) ? [{
                            Key: "Stages",
                            value: 'Question Stage is required.',
                        }] : []),
                        ...(element.bidQuestionStagesJSON && element.bidQuestionStagesJSON.some(a =>( a.wordEquiv==null&& a.isChecked )) ? [{
                            Key: "Word Eqvivalent",
                            value: 'Time Equivalent (Days) is required.',
                        }] : []),
                        ...(element.bidQuestionStagesJSON && element.bidQuestionStagesJSON.some(a => !a.bidMember&& a.isChecked) ? [{
                            Key: "Assign to",
                            value:BIDSUSHI_TEXT.atleastOne,
                        }] : [])
                    ]
                  };
                });
                setQuestions((preBids) => {
                  return [...preBids, ...updated]
              })
            } 
            else{
              setQuestions((preBids) => {
                return [...preBids, ...updatedQuestion]
            })
            };
          } 
          
        }
        setIsloading(false);
      })
      .catch((err) => console.log());
    }else{
      bidShushi
      .getBidInvalidQuestion(bidId, pageNumber, (size = 25),inputValue)
      .then((res) => {
        setAllUser(res?.users);
        setTotalQuestions(res.totalItems);
        setPageNumeber((preState) => preState + 1); // bcz page starts from 0
        console.log(res);
        setIsErrorLoader(false)
        if (res) {
          // if(res&&res.totalItems){
          //   setQuestionLength(res.totalItems);
          // }
          if (res) {
            let updatedQuestion = res.data.bidQuestions.map((a, i) => {
              return {
                teamMembers:
                  a.bidQuestionStagesJSON &&
                  a.bidQuestionStagesJSON.length &&
                  a.bidQuestionStagesJSON.map((m) => m.bidMember),
                ...a,
              };
            });
            if(isBidError){
                   let updated = (updatedQuestion|| []).map((element, i) => {
                 return {
                    ...element,
                    detail: [
                        ...(element.detail || []),
                        ...(!element.wordCount ? [{
                            Key: "Word Count ",
                            value: bidQuestionType === BID_PAGE_COUNT_TYPE ? BIDSUSHI_TEXT.wcEqvivalentRequired :BIDSUSHI_TEXT.wcEqvivalentRequired,
                        }] : []),
                        ...(element.bidQuestionStagesJSON && element.bidQuestionStagesJSON.every(a => !a.isChecked) ? [{
                            Key: "Stages",
                            value: 'Question Stage is required.',
                        }] : []),
                        ...(element.bidQuestionStagesJSON && element.bidQuestionStagesJSON.some(a =>( a.wordEquiv==null&& a.isChecked )) ? [{
                            Key: "Word Eqvivalent",
                            value: 'Time Equivalent (Days) is required.',
                        }] : []),
                        ...(element.bidQuestionStagesJSON && element.bidQuestionStagesJSON.some(a => !a.bidMember&& a.isChecked) ? [{
                            Key: "Assign to",
                            value: BIDSUSHI_TEXT.atleastOne,
                        }] : [])
                    ]
                  };
                });
                setQuestions((preBids) => {
                  return [...preBids, ...updated]
              })
            } 
            else{
              setQuestions((preBids) => {
                return [...preBids, ...updatedQuestion]
            })
            };
          } 
        }
        setIsloading(false);
      })
      .catch((err) => console.log());
    }
   
  };

  const [colorsList, setColorsList] = useState([]);
  const [allColors,setAllColors] = useState([]) 

  const colorPickerButtonRefs = useRef(Array(questions.length).fill(null));

  const toggleColorPickerMenu = (index) => {
    setQuestions((prevQuestions) => {
      return prevQuestions.map((q, i) => {
        if (i === index) {
          return { ...q, showColorPicker: true };
        } else {
          return { ...q, showColorPicker: false };
        }
      });
    });
  };

  const hideColorPickerMenu = () => {
    // set the showColorPiker property of all rows to false
    setQuestions((prevQuestions) => {
      return prevQuestions.map((q, i) => {
        return { ...q, showColorPicker: false };
      });
    });
  };

  const handleColorChange = (color, index) => {
    // create a copy of the questions array
    const updatedQuestions = [...questions];

    const oldQuestion = updatedQuestions[index];
    // update the color property of the selected question
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      color: color?.hex,
    };

    const {
      id,
      bidQuestionStageJSON,
      createdAt,
      updatedAt,
      teamMembers,
      ...newObject
    } = updatedQuestions[index];
   // console.log(newObject,bidQuestionStageJSON);
    let bidQ = newObject.bidQuestionStages.map((questionStage) => {
      return {

        ...questionStage,
        bidId: questionStage.bidId,
        id: questionStage.id,
        name: questionStage.name,
        isChecked: questionStage.isChecked,
        bidStageId: questionStage.bidStageId,
        bidMemberId: questionStage.bidMemberId,
        wordEquiv: questionStage.wordEquiv,
        overhead: questionStage.overhead,
        bidMember: questionStage.bidMember,
      };
    });
    let bidQJSON = newObject.bidQuestionStagesJSON.map((questionStage) => {
      return {
        ...questionStage,
        bidId: questionStage.bidId,
        name: questionStage.name,
        isChecked: questionStage.isChecked,
        bidStageId: questionStage.bidStageId,
        bidMemberId: questionStage.bidMemberId,
        wordEquiv: questionStage.wordEquiv,
        overhead: questionStage.overhead,
        bidMember: questionStage.bidMember,
      };
    });
    let newStages = bidStages.filter(bidStage => !bidQJSON.map(finalStage => finalStage.bidStageId)
    .includes(bidStage.id))
    .map((s) => {
      return {
        bidId: s.bidId,
        name: s.name,
        isChecked: false,
        bidStageId: s.id,
        bidMemberId: null,
        wordEquiv: null,
        overhead: s.overhead,
        bidMember: null,
      }
    });
    bidQ = [...bidQ, ...newStages];
    bidQJSON = [...bidQJSON, ...newStages];
    newObject.bidQuestionStages = bidQ;
    newObject.bidQuestionStagesJSON = bidQJSON;
    newObject.smeId = newObject.smes;
    bidShushi
      .editQuestion(updatedQuestions[index].id, newObject)
      .then((res) => {
        dispatch({ type: QUESTIONS_COLOR_ACTION, payload: updatedQuestions });
        api.success({
          message: `Success`,
          description: BIDSUSHI_TEXT.colorQuestion,
          placement: "topRight",
        });
      //  console.log(res);
      })
      .catch((err) => {
        dispatch({
          type: QUESTIONS_EDIT_ACTION,
          payload: { index: index, questionObject: oldQuestion },
        });
        api.error({
          message: `Error`,
          description: "Error in changing the color of the question.",
          placement: "topRight",
        });
        console.log(err);
      });
    // update the state with the updated questions array

    setQuestions(updatedQuestions);
    //  toggleColorPickerMenu(index);
  };

  // useEffect(()=>{
  //    if(isBidError){
  //     setIsCheckedLoading(true);
  //     //hide with QA
  //     checkErrorFromApi();
  //   };
  // },[]);

  useEffect(() => {
   // fetchMoreData();
    bidShushi.colorsList()
        .then((res)=>{
      //   console.log(res);
         setColorsList(res.filter(a=>a.name!=null));
         setAllColors(res.filter(a=>a.name!=null));
         //  showLessColor();
        }).catch(err=>{
          console.log(err)
        })
  }, []);

  useEffect(()=>{
   
    setIsloading(true);
    const timer = setTimeout(() => {
      if (inputValue) {
        setQuestions([])
     //   getBidQuestions(inputValue)
        fetchMoreData(inputValue)
      }
      else {
        setQuestions([])
       // getBidQuestions()
       fetchMoreData()
      }
    }, 1000); // Adjust the delay time as needed
    return () => clearTimeout(timer);
  },[inputValue,isChecked])



  const checkErrorFromApi=()=>{
    bidShushi
    .getBidInvalidQuestion(bidId)
    .then((res) => {
      if (res && res.data.isError) {
        dispatch({ type: BID_ERROR, payload: true });
      }  else {
       dispatch({ type: BID_ERROR, payload: false });
     }
      setIsCheckedLoading(false);
    })
    .catch((err) => {
      console.log(err);
    }) 
  };

  useEffect(() => {
    setIsErrorLoader(true)
    showLessColor();
    if (showMessage == 1) {
      api.success({
        message: `Success`,
        description: BIDSUSHI_TEXT.questionAdded,
        placement: "topRight",
      });
    }
    if (showMessage == 2) {
      api.success({
        message: `Success`,
        description: BIDSUSHI_TEXT.questionUpdated,
        placement: "topRight",
      });
    }

    // setTimeout(()=>{
    //   setIsErrorLoader(false)
    // },400)
  }, []);

  

 

  const removeDuplicate = (data = null) => {
    let members = data && data.length > 0 && [
      ...new Set(
        data.map((item) => (item != undefined ? item?.userId : null))
      ),
    ];
    
    members = members && members.filter((mem) => mem != null);
   
    const filteredArray = allUser && members && allUser.filter(item => members.includes(item?.userId)); // Use "bidMembers" instead of "data"
    
    members = filteredArray && filteredArray.map(a => a?.fullName); // Use "filteredArray" instead of "bidMembers"
    
    if (members && members.length) {
      return members.join(", ");
    } else {
      return "N/A";
    }
  };

  const showLessColor = () => {
    let updated = colorsList.filter((a, i) => i <= 4);
    setColorsList(updated);
  };

  const showMoreColor = () => {
    let updated = [...colors];
    setColorsList(allColors);
  };

  useEffect(() => {
    if(bidQuestions){
      dispatch({ type: QUESTIONS_ADD_ACTION_API, payload: bidQuestions });
    };
  }, [bidQuestions,isBidError]);



  const filterErrorQuestion =(e)=>{
    setIsChecked(e.target.checked);
    setQuestions([])
    setIsErrorLoader(true);
   // setQuestionLength(0)
    let ALLQuestions=questions;
  
    setPageNumeber(0);
  //  fetchMoreData()
    setTimeout(()=>{
      setIsErrorLoader(false);
     },400)
  }

  const handleBidsCall = (event) => {
    if(event.target.value.trimStart()!=''){
      setQuestions([]);
    }
   // setQuestions([])
    setInputValue(event.target.value.trimStart());
    setPageNumeber(0)

  };


  return (
    <div className="table-responsive user-list show-error-list question-tbl-list">
      {contextHolder}
        {  <div className=" form-wrapper">
              { allQuestions&&allQuestions.length>0&&  <div className="form-group col-4">
           <div className=" search-group custom-search-icon">
                    <input
                        type="text"
                        className="form-control mt-2"
                        placeholder="Search..."
                        value={inputValue}
                        onChange={handleBidsCall}
                    />
                    <i className="fa fa-search"></i>
                </div>
            </div>}
        </div>}
      {isBidError&& allQuestions&&allQuestions.length>0 &&(
          <Checkbox
            className="error-msg-checkbox" 
            onChange={(e) => filterErrorQuestion(e)}
          >
            Show Errors Only
          </Checkbox>
        )} 

     {
      isBidError&& !loading&& bidQuestions.length == 0&& !inputValue &&<p className="text-error">Please add at least one question.</p>
}
      

      {bidQuestions && bidQuestions.length > 0 && (
        <InfiniteScroll
          dataLength={questions.length}
          next={fetchMoreData}
          scrollThreshold={0.2}
          height={500}
          pullDownToRefresh={true}
          refreshFunction={fetchMoreData}
          hasMore={questions.length === totalQuestions ? false : true}
          loader={
            <p>
              <Skeleton loading={loading} />
            </p>
          }
        >
          <table className="table">
            <thead>
              <tr>
                <th scope="col" width="25">
                  Priority
                </th>
                <th scope="col" width="60">
                  Qn no.
                </th>
                <th scope="col" width="320">Question Name/Owner/SME</th>
                <th scope="col" width="150" className="text-center">
                  {bidQuestionType === BID_PAGE_COUNT_TYPE ? 'Page Count' : 'Word Count'}
                </th>
                <th scope="col" width="150">
                  Complexity
                </th>
                <th scope="col" width="150" className="text-center">
                  Weighting
                </th>
                <th scope="col" width="300">
                  Team Member
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
                // The filter here is used to filter out any question duplicates which are generating..
              bidQuestions &&
                bidQuestions.filter((item, index) => {
                  return index === bidQuestions.findIndex(obj => obj.id === item.id);
                }).map((q, i) => {
                  return (
                    <tr
                      key={i}
                      className={
                        q?.detail && q.detail.length
                          ? "border border-danger"
                          : ""
                      }
                    >
                      <td>
                        <span className="priority-number">
                          {q?.questionPriority?.name}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => toggleColorPickerMenu(i)}
                          ref={(el) => (colorPickerButtonRefs.current[i] = el)}
                          style={{ backgroundColor: q.color }}
                          className="rounded-number edit-icon"
                        >
                          {q?.questionNumber || "N/A"}
                        </button>

                        <Popover
                        placement="right"
                          content={() => (
                            <div className="color-wrapper rel">
                              <h3>
                                Choose Colours{" "}
                                <i
                                  onClick={hideColorPickerMenu}
                                  className="close-color"
                                >
                                  <img src="/images/close-icon.png" />
                                </i>
                              </h3>
                              <CirclePicker
                                color={q.color}
                                colors={colorsList.map(a=>a?.name)}
                                onChange={(color) =>
                                  handleColorChange(color, i)
                                }
                                className={colorsList.find(a=>a?.name===q.color)?`s-${q.color?.slice(1)}`:""}
                              />
                              {colorsList.length > 5 ? (
                                <p
                                  className="view-link"
                                  onClick={showLessColor}
                                >
                                  View Less
                                </p>
                              ) : (
                                <p
                                  className="view-link"
                                  onClick={showMoreColor}
                                >
                                  View more
                                </p>
                              )}
                            </div>
                          )}
                          trigger="click"
                          onVisibleChange={hideColorPickerMenu}
                          open={q.showColorPicker}
                        ></Popover>
                      </td>
                      <td scope="row">
                        <div className="question-title">
                          <span className="main-question" >
                            <Tooltip placement="topLeft" color="#fff" title={q?.questionName}>
                            {q?.questionName || "N/A"}
                              </Tooltip>
                           
                          </span>
                        
                        { bidTeamMembers.find(bidTeamMember => bidTeamMember.userId == q?.questionOwnerId)?.user?.fullName&& <span className="d-inline-block me-2 small owner-name">
                            {bidTeamMembers.find(bidTeamMember => bidTeamMember.userId == q?.questionOwnerId)?.user?.fullName}
                            {q?.smes.length>0 ? "," : ""}
                          </span>}
                          {q?.smes&&q.smes.length>0 && <span className="d-inline-block me-2 small owner-name">
                            {q?.smes.length>0?bidTeamMembers.filter((item) => q?.smes.some((obj) => obj.id === item.id)).map(a=>a?.user?.fullName).join(', '):null}
                          </span>}
                        </div>
                      </td>
                      <td className="text-center">{q?.wordCount || "N/A"}</td>
                      <td>{q?.questionComplexity?.name}</td>
                      <td className="text-center">{q?.weighting || "N/A"}</td>
                      <td>
                        {/* {q.teamMembers.map(a=>a.fullName).join(',')} */}
                        <span>{removeDuplicate(q.teamMembers)}</span>
                        {/* {teams.find(team => team.userId == q?.questionOwnerId)?.fullName} */}
                      </td>
                      <td>
                        <div className="action-btn">
                          <a
                            onClick={() => {
                              editQuestion(q);
                            }}
                          >
                            <Tooltip placement="top" color="#fff" title="Edit">
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
                            </Tooltip>
                          </a>
                          <a
                            onClick={() => {
                              showModal(q);
                            }}
                          >
                            <Tooltip
                              placement="top"
                              color="#fff"
                              title="Delete"
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
                            </Tooltip>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>{" "}
        </InfiniteScroll>
      )}
      {bidQuestions && bidQuestions.length == 0 && !loading &&!isErrorLoader && (
        <div className="row m-0">
          <div className="no-data bg-gray border-rounded">
            <img src="/images/Questions.png" alt="" height={70} />
            {
              !inputValue||inputValue==''?<h3>You have not added any Questions yet.</h3>:<h3>No result found for this search.</h3>
            }
          </div>
        </div>
      )}
      
       {
        (isErrorLoader||loading)&&<Skeleton active avatar/>
       }
      
      <Modal
       okText={BIDSUSHI_TEXT.Yes} cancelText={BIDSUSHI_TEXT.NO} 
        title={BIDSUSHI_TEXT.confirmation} 
        open={isModalOpen}
        onOk={() => {
          handleOk(questionToRemove);
        }}
        onCancel={handleCancel}
      >
        <p className="confirmation-text">{BIDSUSHI_TEXT.deleteQuestion}</p>
      </Modal>
    </div>
  );
});

export default Questions;
