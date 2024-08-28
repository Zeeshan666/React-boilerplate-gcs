import React, { useEffect, useState,useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip, Select } from "antd";
import { Collapse, Modal, notification } from "antd";
import bidShushi from "../../Services/Api/Api";
import { v4 as uuidv4 } from 'uuid';
import {
  avatarURL,
  BID_PAGE_COUNT_TYPE,
  BID_WORD_COUNT_TYPE,
  DEFAULT_COMPLEXITY_SELECT,
  DEFAULT_QUESTIONS_COLOR,
  EXTERNAL_ROLE,
  EXTERNAL_TAG_TYPE,
  URL_REGEX,
  WORD_COUNT_PER_PAGE,
  WORD_COUNT_PER_PAGE_KEY,
  USER_SKILL_TO_WORDCOUNT
} from "../../Common";
import DebounceSelect from "./DebounceSelect.js";
import NumberFormat from "react-currency-format";
import { useBidContext } from "../../hooks/useBidContext";
import BIDSUSHI_TEXT from "../../Common/Constant";
import {
  QUESTIONS_ADD_ACTION,
  QUESTIONS_EDIT_ACTION,
  BID_ALL_ADD_QUESTIONS,
  BID_ERROR,
  BID_ALL_EDIT_QUESTIONS,
} from "../../Context/Actions";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const formats = ["bold", "italic", "underline"];
const { Panel } = Collapse;
const { Option } = Select;

//This bidQuestionType can be used to show Wordcount or pageCount type...
const AddQuestion = ({
  setQuestionChange,
  setQuestionCount,
  setViewQuestion,
  questionIdForEdit,
  setQuestionIdForEdit,
  bidId,
  bidTeamMembers,
  bidStages,
  bidQuestionType,
  complexities,
  priorites,
  appSettings,
  handleShowMessage,
  hoursPerDay
}) => {
  const navigate = useNavigate();
  const { questions, dispatch, allQuestions,isBidError, teams, stages } = useBidContext();
  const tableRef = useRef(null);
  const [questionNumber, setQuestionNumber] = useState("");
  const [questionName, setQuestionName] = useState("");
  const [weighting, setWeighting] = useState("");
  const [priority, setPriority] = useState(null);
  const [wordCount, setWordCount] = useState("");
  const [complexity, setComplexity] = useState(
    complexities.find((option) => option.name == DEFAULT_COMPLEXITY_SELECT)?.id
  );
  const [questionText, setQuestionText] = useState("");
  const [questionOwner, setQuestionOwner] = useState(null);
  const [questionColor, setQuestionColor] = useState(DEFAULT_QUESTIONS_COLOR);
  const [questionOwners, setQuestionOwners] = useState([]);
  const [sme, setSme] = useState([]);
  const [documentLink, setDocumentLink] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showQuestionStagesErrors, setShowQuestionStagesErrors] =
    useState(false);
  const [canShowDialogLeavingPage, setCanShowDialogLeavingPage] =
    useState(false);
  const [questionsStages, setQuestionStages] = useState([]);
  const [loading, setLoading] = useState(null);
  const [api, contextHolder] = notification.useNotification();
  const [isLinkEdit, setIsLinkEdit] = useState(false);
  useEffect(() => {
    ///todo add isInclude keyd
    if (questionIdForEdit !== "" && questionIdForEdit != null) {
      bidId = questionIdForEdit.bidId;
      let questionStage = questionIdForEdit.bidQuestionStages && questionIdForEdit.bidQuestionStages
        .sort((a, b) => a.sortOrder - b.sortOrder).map((questionS, i) => {
          return {
            "bidId": questionIdForEdit.bidId,
            "id": questionS.id,
            "bidStageId": questionS.bidStageId,
            "assign_to": (bidTeamMembers.find(bidTeamMember => bidTeamMember.id == questionS.bidMemberId)),
            "wc_equiv": questionS.wordEquiv?Number(questionS.wordEquiv).toFixed(2):null,
            "overhead": questionS.overhead,
            "isChecked": questionS.isChecked,
            "name": questionS.name,
            "bidStageChecked": bidStages.find(a => a.id == questionS.bidStageId)?.isChecked || false,
            "stageColor": questionIdForEdit.bidQuestionStagesJSON.find(a=>a.bidStageId==questionS.bidStageId)?.bidStageColor,
             ...questionS,
             "responseTrackerStatusId":questionIdForEdit.bidQuestionStagesJSON.find(a=>a.bidStageId==questionS.bidStageId)?.responseTrackerStatus?.id,
             "responseTrackerStatus":questionIdForEdit.bidQuestionStagesJSON.find(a=>a.bidStageId==questionS.bidStageId)?.responseTrackerStatus,
             "date":questionIdForEdit.bidQuestionStagesJSON.find(a=>a.bidStageId==questionS.bidStageId)?.date,
           // ...questionS,
          }
        })
      let newStages = bidStages.filter(bidStage => !questionStage.map(finalStage => finalStage.bidStageId)
        .includes(bidStage.id))
        .map((s) => {
          return {
            ...s,
            bidStageId: s.id,
            wc_equiv: null,
            assign_to: null,
            isChecked: false,
            bidStageChecked: s.isChecked,
            newStageAdded: true,
          };
        });
      questionStage = [...questionStage, ...newStages];
   //   console.log(questionStage,"qsssssss",bidStages)
      setQuestionName(questionIdForEdit.questionName);
      setQuestionNumber(questionIdForEdit.questionNumber);
      setWeighting(questionIdForEdit.weighting);
      setPriority(
        priorites.find(
          (priority) => priority.id == questionIdForEdit.questionPriorityId
        ).id
      );
      setWordCount(questionIdForEdit.wordCount || "");
      setComplexity(
        complexities.find(
          (complexity) =>
            complexity.id == questionIdForEdit.questionComplexityId
        ).id
      );
      setQuestionOwner(
        bidTeamMembers.find(
          (bidTeamMember) =>
            bidTeamMember.userId == questionIdForEdit.questionOwnerId
        )
      );
      console.log(bidTeamMembers.find(
        (bidTeamMember) =>
          bidTeamMember.userId == questionIdForEdit.questionOwnerId
      ),"ssswss")
      const filteredArray = bidTeamMembers.filter((item) =>
        questionIdForEdit.smes.some((obj) => obj.id === item.id)
      );
      setSme(filteredArray);
      setQuestionText(questionIdForEdit.text);
      setQuestionStages(questionStage);
      setDocumentLink(
        questionIdForEdit.link ? toUrl(questionIdForEdit.link) : null
      );
      setQuestionColor(questionIdForEdit.color);
      if (questionIdForEdit.link) {
        setIsLinkEdit(false);
      } else {
        setIsLinkEdit(true);
      }
    }
  }, [questionIdForEdit]);

  useEffect(() => {
    setQuestionOwners(bidTeamMembers);
    if (questionIdForEdit == "" || questionIdForEdit == null) {
      let finalBidStages = bidStages.sort((a, b) => a.sortOrder - b.sortOrder);
      setIsLinkEdit(true);
      setQuestionStages(
        finalBidStages &&
          finalBidStages.map((s) => {
            return {
              ...s,
              bidStageId: s.id,
              wc_equiv: null,
              assign_to: null,
              isChecked: s.isChecked,
              bidStageChecked: s.isChecked,
            };
          })
      );
    }
  }, [bidTeamMembers]);

  const toUrl = (str) => {
    // Regular expression to match a valid URL
    var urlRegex =
      /^(?:(?:https?:\/\/)|(?:http:\/\/))[\w/\-?=%.]+\.[\w/\-?=%.]+$/;

    // Check if the string is already a valid URL
    if (urlRegex.test(str)) {
      return str;
    }

    // Prepend the string with http:// and check if the resulting string is a valid URL
    if(str&&str.includes('http://')==-1){
      var url = "http://" + str;
      if (urlRegex.test(url)) {
        return url;
      }
    }
 
    // Prepend the string with https:// and check if the resulting string is a valid URL
    url = "https://" + str;
    if (urlRegex.test(url)) {
      return url;
    }

    // If the string cannot be converted to a valid URL, return null
    return str;
  };

  const showModal = () => {
    if (canShowDialogLeavingPage) {
      setIsModalOpen(true);
    } else {
      setQuestionChange(false);
      handleShowMessage(0);
      setViewQuestion(true);
      setCanShowDialogLeavingPage(false);
    }
  };

  const handleOk = () => {
    setIsModalOpen(false);
    setQuestionChange(false);
    handleShowMessage(0);
    setViewQuestion(true);
    if(isBidError){
      checkErrorFromApi()
    }

    setCanShowDialogLeavingPage(false);
   // checkErrorFromApi()
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleSelectChange = (selectedKeys) => {
    setCanShowDialogLeavingPage(true);
    setQuestionChange(true);
    const selectedOpts = questionOwners
      .filter((questionOwner) => questionOwner?.user?.userRole?.name == EXTERNAL_ROLE)
      .filter((a) => selectedKeys.includes(a.id));
    setSme(selectedOpts);
  };
  const showSearchBox = (question) => {
    let updatedStages = questionsStages.map((stage, index) => {
      if (stage.id == question.id) {
        stage.assign_to = null;
        stage.wc_equiv = null;
        stage.bidMemberId =null;
        stage.bidMember = null;
        return stage;
      }
      return stage;
    });
    setQuestionStages(updatedStages);

    setCanShowDialogLeavingPage(true);
    setQuestionChange(true);
  };

  const setCheckboxWithIndex = (question, newValue) => {
    let updatedStages = questionsStages.map((stage, index) => {
      if (stage.bidStageId == question.bidStageId) {
        stage.isChecked = !stage.isChecked;
        stage.bidMemberId = null;
        stage.bidMemberName = null
        stage.wc_equiv = null;
        stage.assign_to = null;
        if (stage.isChecked) {
          stage.wc_equiv = null;
          stage.assign_to = null;
          stage.bidMemberId = null;
          stage.bidMemberName = null
        }
        return stage;
      }
      return stage;
    });

    setQuestionStages(updatedStages);
    setCanShowDialogLeavingPage(true);
    setQuestionChange(true);
  };

  const setTeamAssigneeWithIndex = (question, newValue) => {
    let questionOwner = questionOwners.find((q) => q.id == newValue);
    let complexityValue = complexities.find((c) => c.id == complexity)?.value;
    let wordCountPerPage = parseInt(
      appSettings.find(
        (appSetting) => appSetting.key == WORD_COUNT_PER_PAGE_KEY
      )?.value
    );

    let updatedStages = questionsStages.map((stage, index) => {
      if (stage.bidStageId == question.bidStageId) {
        if (questionOwner?.skill?.wordCount) {
          if (bidQuestionType == BID_PAGE_COUNT_TYPE) {
            let wc = wordCount * wordCountPerPage;
            stage.wc_equiv = (
              (wc * (question.overhead / 100) * complexityValue) /
              (questionOwner?.skill?.wordCount * USER_SKILL_TO_WORDCOUNT)
            ).toFixed(2);
          } else {
            stage.wc_equiv = (
              (wordCount * (question.overhead / 100) * complexityValue) /
              (questionOwner?.skill?.wordCount * USER_SKILL_TO_WORDCOUNT)
            ).toFixed(2);
          }
        }
        stage.assign_to = questionOwner;
        return stage;
      }
      return stage;
    });
    setQuestionStages(updatedStages);
    setCanShowDialogLeavingPage(true);
    setQuestionChange(true);
  };

  const copyDownTeamMember = (stage) => {
    const newAssignee = [...questionsStages.sort((a, b) => a.sortOrder - b.sortOrder)];
    const index = newAssignee.findIndex(s => s?.id == stage?.id);
    
    let complexityValue = complexities.find((c) => c.id == complexity)?.value;
    let wordCountPerPage = parseInt(
      appSettings.find(
        (appSetting) => appSetting.key == WORD_COUNT_PER_PAGE_KEY
      )?.value
    );
    for (let i = index + 1; i < questionsStages.length; i++) {
      if (newAssignee[i].isChecked && newAssignee[i].bidStageChecked) {
        if (newAssignee[index].assign_to?.skill?.wordCount) {
          if (bidQuestionType == BID_PAGE_COUNT_TYPE) {
            let wc = wordCount * wordCountPerPage;
            newAssignee[i].wc_equiv = (
              (wc * (newAssignee[i].overhead / 100) * complexityValue) /
              (newAssignee[index].assign_to?.skill?.wordCount * USER_SKILL_TO_WORDCOUNT)
            ).toFixed(2);
          } else {
            newAssignee[i].wc_equiv = (
              (wordCount * (newAssignee[i].overhead / 100) * complexityValue) /
              (newAssignee[index].assign_to?.skill?.wordCount * USER_SKILL_TO_WORDCOUNT)
            ).toFixed(2);
          }
        }
        newAssignee[i].assign_to = newAssignee[index].assign_to;
      }
    }
    setQuestionStages(newAssignee);
    setCanShowDialogLeavingPage(true);
    setQuestionChange(true);
  };

  const updateQuestionWcEquiv = (wordc, comp) => {
    const newAssignee = [...questionsStages.sort((a, b) => a.sortOrder - b.sortOrder)];
    let complexityValue = complexities.find((c) => c.id == comp)?.value;
    let wordCountPerPage = parseInt(
      appSettings.find(
        (appSetting) => appSetting.key == WORD_COUNT_PER_PAGE_KEY
      )?.value
    );
    for (let i = 0; i < questionsStages.length; i++) {
      if (newAssignee[i].assign_to) {
        if (newAssignee[i].isChecked) {
          if (newAssignee[i].assign_to?.skill?.wordCount) {
            if (bidQuestionType == BID_PAGE_COUNT_TYPE) {
              let wc = wordc * wordCountPerPage;
              newAssignee[i].wc_equiv = (
                (wc * (newAssignee[i].overhead / 100) * complexityValue) /
                (newAssignee[i].assign_to?.skill?.wordCount * USER_SKILL_TO_WORDCOUNT)
              ).toFixed(2);
            } else {
              newAssignee[i].wc_equiv = (
                (wordc * (newAssignee[i].overhead / 100) * complexityValue) /
                (newAssignee[i].assign_to?.skill?.wordCount * USER_SKILL_TO_WORDCOUNT)
              ).toFixed(2);
            }
          }
          newAssignee[i].assign_to = newAssignee[i].assign_to;
        }
      }
    }
    setQuestionStages(newAssignee);
    setCanShowDialogLeavingPage(true);
    setQuestionChange(true);
  };

  const setWordCountForStage = (question, newValue) => {
    let updatedStages = questionsStages.map((stage, index) => {
      if (stage.id == question.id) {
        stage.wc_equiv = newValue ? Number(newValue).toFixed(2) : null;
        return stage;
      }
      return stage;
    });
    setQuestionStages(updatedStages);

    setCanShowDialogLeavingPage(true);
    setQuestionChange(true);
  };

  const setClearStates = () => {
    setQuestionNumber("");
    setQuestionName("");
    setWeighting("");
    setPriority(null);
    setWordCount("");
    setQuestionColor(DEFAULT_QUESTIONS_COLOR);
    setComplexity(
      complexities.find((option) => option.name == DEFAULT_COMPLEXITY_SELECT)
        ?.id
    ); // By default it should be Standard
    setQuestionText("");
    setQuestionOwner(null);
    setSme([]);
    setDocumentLink("");
    setIsLinkEdit(true);
    setCanShowDialogLeavingPage(false);
    //we need to question stages while clearing
    setQuestionStages(bidStages && bidStages.map((s) => {
      return {
        ...s,
        'bidStageId': s.id,
        'wc_equiv': null,
        'assign_to': null,
        "isChecked": s.isChecked,
        "bidStageChecked": s.isChecked
      }
    }));
  }

  const conversionToHours = (wordEquivRt) => {
    if (wordEquivRt == 1) {
      return "Full day";
    }
    // else if (wordEquivRt > 1){
    //   return  wordEquivRt + " day"
    // }
    else {
      return wordEquivRt * hoursPerDay + " hours";
    }
  };

  const saveQuestions = (isRedirectTo) => {
    setLoading(true);
    if (
      questionName &&
      priority &&
      complexity &&
      // && (!(questionsStages.some((element) => element.isChecked ? (element.assign_to === null || element.wc_equiv == null || element.wc_equiv === '') : '')))
      Object.values(error).every((value) => value === false)
    ) {
      let finalQuestionStages = [...questionsStages];

      const questionObject = {
        bidId,
        questionNumber,
        questionName,
        weighting,
        questionPriorityId: priority,
        wordCount: wordCount || null,
        color: questionColor,
        questionComplexityId: complexity,
        text: questionText,
        questionOwnerId:
          questionOwner && questionOwner.userId ? questionOwner.userId : null,
        smeId:
          sme.length > 0
            ? sme &&
              sme.map((a) => {
                return {
                  id: a.id,
                };
              })
            : [], // Do the map here as this will be an array
        link: documentLink,
        createdBy: "SYSTEM",
        updatedBy: "SYSTEM",
        bidQuestionStages: finalQuestionStages.map((questionStage) => {
          if (questionIdForEdit !== "" && questionIdForEdit != null) {
            if (questionStage?.newStageAdded) {
              return {
                bidId,
                "name": questionStage.name,
                "isChecked": questionStage.isChecked,
                "bidStageId": questionStage.bidStageId,
                "bidMemberId": questionStage.assign_to && questionStage.assign_to.id,
                "wordEquiv": questionStage.wc_equiv,
                "overhead": questionStage.overhead,
                "bidMember": questionStage.assign_to && questionStage.assign_to,
               //"bidMemberName": questionStage?.assign_to && questionStage?.assign_to?.user?.fullName,
                "sortOrder": questionStage.sortOrder,
                "bidStageColor": questionStage?.stageColor?.name,
                "responseTrackerStatusId":questionStage?.responseTrackerStatus?.id,
                "responseTrackerStatus":questionStage?.responseTrackerStatus,
                "date":questionStage?.date
           //     ...questionStage,
              }
            }
            else {
              return {
                bidId,
                "name": questionStage.name,
                "isChecked": questionStage.isChecked,
                "id": questionStage.id,
                "bidStageId": questionStage.bidStageId,
                "bidMemberId": questionStage.assign_to && questionStage.assign_to.id,
                "wordEquiv": questionStage.wc_equiv,
                "overhead": questionStage.overhead,
                "bidMember": questionStage.assign_to && questionStage.assign_to,
                //"bidMemberName": questionStage?.assign_to && questionStage?.assign_to?.user?.fullName,
                "sortOrder": questionStage.sortOrder,
                "bidStageColor": questionStage?.stageColor?.name,
                "responseTrackerStatusId":questionStage?.responseTrackerStatus?.id,
                "responseTrackerStatus":questionStage?.responseTrackerStatus,
                "date":questionStage?.date
              //   ...questionStage 
              }
            }
          } else {
            return {
              bidId,
              name: questionStage.name,
              isChecked: questionStage.isChecked,
              bidStageId: questionStage.bidStageId,
              bidMemberId:
                questionStage.assign_to && questionStage.assign_to.id,
              wordEquiv: questionStage.wc_equiv,
              overhead: questionStage.overhead,
              bidMember: questionStage.assign_to && questionStage.assign_to,
             // bidMemberName:
               // questionStage?.assign_to && questionStage?.assign_to?.user?.fullName,
              sortOrder: questionStage.sortOrder,
              bidStageColor: questionStage?.stageColor?.name,
              responseTrackerStatusId:questionStage?.responseTrackerStatus?.id,
              responseTrackerStatus:questionStage?.responseTrackerStatus,
              date:questionStage?.date
             // ...questionStage
            };
          }
        }),
        bidQuestionStagesJSON: finalQuestionStages.map((questionStage) => {
          if(questionIdForEdit !== "" && questionIdForEdit != null){
          return {
            bidId,
            name: questionStage.name,
            isChecked: questionStage.isChecked,
            bidStageId: questionStage.bidStageId,
            bidMemberId: questionStage.assign_to && questionStage.assign_to.id,
            wordEquiv: questionStage.wc_equiv,
            wordEquivRt : questionStage.wc_equiv,
            label:conversionToHours(questionStage.wc_equiv),
            overhead: questionStage.overhead,
            bidMember: {bidId:questionStage.assign_to && questionStage.assign_to?.bidId,
              userId:questionStage.assign_to && questionStage.assign_to?.userId,
              skillId:questionStage.assign_to && questionStage.assign_to?.skillId,
              skill:questionStage.assign_to && questionStage.assign_to?.skill,
              id:questionStage.assign_to && questionStage.assign_to?.id,
              user:{
                id:questionStage.assign_to && questionStage.assign_to?.user?.id,
                userRoleId:questionStage.assign_to && questionStage.assign_to?.user?.userRoleId,
                userRole:questionStage.assign_to && questionStage.assign_to?.user?.userRole,
              }
              },
            //bidMemberName:
              //questionStage?.assign_to && questionStage?.assign_to?.user?.fullName,
            sortOrder: questionStage.sortOrder,
            bidStageColor:
              questionStage?.stageColor?.name || questionStage.stageColor,
              responseTrackerStatusId:questionStage?.responseTrackerStatus?.id,
              responseTrackerStatus:questionStage?.responseTrackerStatus,
              date:questionStage?.date
            //...questionStage
            }}else{
              return {
                bidId,
                name: questionStage.name,
                isChecked: questionStage.isChecked,
                bidStageId: questionStage.bidStageId,
                bidMemberId: questionStage.assign_to && questionStage.assign_to.id,
                wordEquiv: questionStage.wc_equiv,
                wordEquivRt : questionStage.wc_equiv,
                label:conversionToHours(questionStage.wc_equiv),
                overhead: questionStage.overhead,
                bidMember: {bidId:questionStage.assign_to && questionStage.assign_to?.bidId,
                userId:questionStage.assign_to && questionStage.assign_to?.userId,
                skillId:questionStage.assign_to && questionStage.assign_to?.skillId,
                skill:questionStage.assign_to && questionStage.assign_to?.skill,
                id:questionStage.assign_to && questionStage.assign_to?.id,
                user:{
                   id:questionStage.assign_to && questionStage.assign_to?.user?.id,
                  userRoleId:questionStage.assign_to && questionStage.assign_to?.user?.userRoleId,
                userRole:questionStage.assign_to && questionStage.assign_to?.user?.userRole,
                }
                },
              //  bidMemberName:
                //  questionStage?.assign_to && questionStage?.assign_to?.user?.fullName,
                sortOrder: questionStage.sortOrder,
                bidStageColor:
                  questionStage?.stageColor?.name || questionStage.stageColor,
                  responseTrackerStatusId:questionStage?.responseTrackerStatus?.id,
                  responseTrackerStatus:questionStage?.responseTrackerStatus,
                  date:questionStage?.date,
                //  bidQuestionStageId:uuidv4(),
                 // bidMemberRole:questionStage.assign_to && questionStage?.assign_to?.user?.userRoleId
                //...questionStage
                }
            }
        }),
      };

      if (questionIdForEdit !== "" && questionIdForEdit != null) {
        bidShushi
          .editQuestion(questionIdForEdit.id, questionObject)
          .then((res) => {
            questionObject.id = res.id;
            questionObject.questionComplexity = res.questionComplexity;
            questionObject.questionPriority = res.questionPriority;
            questionObject.sme = res.sme;
            questionObject.questionOwner = res.questionOwner;
            questionObject.bidQuestionStages = res.bidQuestionStages;
            questionObject.bidQuestionStagesJSON = res.bidQuestionStagesJSON;
            questionObject.teamMembers =
              res.bidQuestionStagesJSON &&
              res.bidQuestionStagesJSON.length &&
              res.bidQuestionStagesJSON.map((m) => m.bidMember);
            dispatch({
              type: QUESTIONS_EDIT_ACTION,
              payload: {
                index: questions.indexOf(questionIdForEdit),
                questionObject,
              },
            }); // TODO: Update it later

            dispatch({
              type: BID_ALL_EDIT_QUESTIONS,
              payload: {
                index: allQuestions.findIndex((a) => a.id == res.id),
                questionObject,
              },
            });
            api.success({
              message: `Success`,
              description: BIDSUSHI_TEXT.questionUpdated,
              placement: "topRight",
            });
            if(isBidError){
              checkErrorFromApi()
            }
           
            if (isRedirectTo) {
              handleShowMessage(2);
              setViewQuestion(true);
            }
            setClearStates();
            //add once its success
            setQuestionIdForEdit("");
            setLoading(false);
          })
          .catch((err) => {
            api.error({
              message: `Error`,
              description: "Error in editing the question.",
              placement: "topRight",
            });
            console.log(err);
            setLoading(false);
          });
      } else {
        bidShushi
          .addQuestion(questionObject)
          .then((res) => {
          //  console.log(res);
            setQuestionCount();
            questionObject.id = res.id;
            questionObject.questionComplexity = res.questionComplexity;
            questionObject.questionPriority = res.questionPriority;
            questionObject.sme = res.sme;
            questionObject.questionOwner = res.questionOwner;
            questionObject.bidQuestionStages = res.bidQuestionStages;
            questionObject.bidQuestionStagesJSON = res.bidQuestionStagesJSON;
            questionObject.teamMembers =
              res.bidQuestionStagesJSON &&
              res.bidQuestionStagesJSON.length &&
              res.bidQuestionStagesJSON.map((m) => m.bidMember);
            dispatch({
              type: QUESTIONS_ADD_ACTION,
              payload: { questionObject },
            });
            dispatch({
              type: BID_ALL_ADD_QUESTIONS,
              payload: { questionObject },
            });
            api.success({
              message: `Success`,
              description: BIDSUSHI_TEXT.questionAdded,
              placement: "topRight",
            });
            if(isBidError){
              checkErrorFromApi()
            }
          
            if (isRedirectTo) {
              handleShowMessage(1);
              setViewQuestion(true);
            }
            setClearStates();
            setLoading(false);
            //add once its success
            scrollUp()
          //  console.log(res);
          })
          .catch((err) => {
            api.error({
              message: `Error`,
              description: "Error in adding the question.",
              placement: "topRight",
            });
            console.log(err);
            setLoading(false);
          });
      }

      setCanShowDialogLeavingPage(false);
      setQuestionChange(false);
      setShowQuestionStagesErrors(false);
    } else {
      // window.scrollTo({
      //   top: 400,
      //   behavior: "smooth",
      // });
      scrollUp()
      setLoading(false);
      setShowQuestionStagesErrors(true);
      checkForError();
    }

  };
  

  const checkErrorFromApi=()=>{
    bidShushi
    .getBidInvalidQuestion(bidId)
    .then((res) => {
      if (res && res.data.isError) {
        dispatch({ type: BID_ERROR, payload: true });
      }  else {
       dispatch({ type: BID_ERROR, payload: false });
     }
   //   setIsCheckedLoading(false);
    })
    .catch((err) => {
      console.log(err);
    }) 
  };

  const scrollUp=()=>{
    window.scrollTo({
      top: 450,
      behavior: "smooth",
    });
    if(tableRef.current){
     ///  tableRef.current.offsetHeight=-1000
       tableRef.current.scrollTop = 0;
    }
  }
  // Usage of DebounceSelect

  //const DebounceSelectSME = DebounseSelectFunction('multiple', fetchUserList);

  const [error, setError] = useState({
    //questionNumber: false,
    questionName: false,
    //weighting: false,
    priority: false,
    //wordCount: false,
    complexity: false,
    //questionText: false,
    //questionOwner: false,
    //sme: false,
    documentLink: false,
  });

  const checkForError = () => {

    // if (!questionNumber) {
    //     setError((preState) => {
    //         return {
    //             ...preState,
    //             questionNumber: true,
    //         };
    //     });
    // }
    if (!questionName) {
      setError((preState) => {
        return {
          ...preState,
          questionName: true,
        };
      });
    }
    // if (!weighting) {
    //     setError((preState) => {
    //         return {
    //             ...preState,
    //             weighting: true,
    //         };
    //     });
    // }
    if (!priority) {
      setError((preState) => {
        return {
          ...preState,
          priority: true,
        };
      });
    }
    // if (!wordCount) {
    //     setError((preState) => {
    //         return {
    //             ...preState,
    //             wordCount: true,
    //         };
    //     });
    // }
    if (!complexity) {
      setError((preState) => {
        return {
          ...preState,
          complexity: true,
        };
      });
    }
    // if (!questionText) {
    //     setError((preState) => {
    //         return {
    //             ...preState,
    //             questionText: true,
    //         };
    //     });
    // }
    // if (!questionOwner) {
    //     setError((preState) => {
    //         return {
    //             ...preState,
    //             questionOwner: true,
    //         };
    //     });
    // }
    // if (sme.length == 0) {
    //     setError((preState) => {
    //         return {
    //             ...preState,
    //             sme: true,
    //         };
    //     });
    // }
  };

  const onChangeHandler = (e) => {
    let name = e.target.name;
    let value = e.target.value.trimStart();
    if (value.length > 0) {
      setCanShowDialogLeavingPage(true);
      setQuestionChange(true);
    }
    if (name === "questionNumber") {
      setQuestionNumber(value);
      if (value.length > 4) {
        setError((preState) => {
          return {
            ...preState,
            questionNumber: true,
          };
        });
      } else {
        setError((preState) => {
          return {
            ...preState,
            questionNumber: false,
          };
        });
      }
    }

    if (name === "questionName") {
      setQuestionName(value);
      if (value.length == 0) {
        setError((preState) => {
          return {
            ...preState,
            questionName: true,
          };
        });
      } else if (value.length > 255) {
        setError((preState) => {
          return {
            ...preState,
            questionName: true,
          };
        });
      } else {
        setError((preState) => {
          return {
            ...preState,
            questionName: false,
          };
        });
      }
    }

    if (name === "weighting") {
      setWeighting(value);
      if (value.length > 255) {
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

    if (name === "wordCount") {
      setWordCount(value);
    let limit=  bidQuestionType == BID_WORD_COUNT_TYPE? 70000000:100000
      if (parseInt(value) >limit ) {
        setError((preState) => {
          return {
            ...preState,
            wordCount: true,
          };
        });
      } else {
        setError((preState) => {
          return {
            ...preState,
            wordCount: false,
          };
        });
      }
    }

    if (name === "questionText") {
      setQuestionText(value);
      // if (value.length == 0) {
      //     setError((preState) => {
      //         return {
      //             ...preState,
      //             questionText: true,
      //         };
      //     });
      // } else {
      //     setError((preState) => {
      //         return {
      //             ...preState,
      //             questionText: false,
      //         };
      //     });
      // }
    }

    if (name === "documentLink") {
      setDocumentLink(value);
      if (value !== "") {
        if (!URL_REGEX.test(value) || value.length > 255) {
          setError((preState) => {
            return {
              ...preState,
              documentLink: true,
            };
          });
        } else {
          setError((preState) => {
            return {
              ...preState,
              documentLink: false,
            };
          });
        }
      }
    }
  };

  function handlePaste(event) {
    event.preventDefault();
  }

  function handleCopy(event) {
    event.preventDefault();
  }

  const onChangeHandlerSelect = (name, value) => {
    if (name === "priority") {
      setPriority(value);
      setCanShowDialogLeavingPage(true);
      setQuestionChange(true);
      if (value == 0) {
    
        setError((preState) => {
          return {
            ...preState,
            priority: true,
          };
        });
      } else {
        setError((preState) => {
          return {
            ...preState,
            priority: false,
          };
        });
      }
    }

    if (name === "complexity") {
      setComplexity(value);
      if (value == 0) {
        setCanShowDialogLeavingPage(true);
        setQuestionChange(true);
        setError((preState) => {
          return {
            ...preState,
            complexity: true,
          };
        });
      } else {
        setError((preState) => {
          return {
            ...preState,
            complexity: false,
          };
        });
      }
    }

    if (name === "questionOwner") {
      setQuestionOwner(value);
      setCanShowDialogLeavingPage(true);
      setQuestionChange(true);
    }
  };
  const uniqueData =
    questionIdForEdit &&
    questionIdForEdit?.detail?.length > 0 &&
    questionIdForEdit.detail.reduce((acc, curr) => {
      const existingItem = acc.find((item) => item.Key === curr.Key);
      if (existingItem) {
        existingItem.value = curr.value;
      } else {
        acc.push(curr);
      }
      return acc;
    }, []);
  return (
    <div className="tab-content">
      {contextHolder}

      {questionIdForEdit && questionIdForEdit?.detail?.length > 0 && (
        <div className="row">
          {questionIdForEdit && questionIdForEdit.detail && (
            <Collapse className="custom-error-collpase">
              {
                <Panel
                  header="Click here to view all errors on this page"
                  key="1"
                >
                  <ul>
                    {uniqueData && uniqueData.map((a) => <li>{a.value}</li>)}
                  </ul>
                </Panel>
              }
            </Collapse>
          )}
        </div>
      )}
      <div className="form-wrapper border-rounded">
        <div className="row">
          <div className="col-md-6">
            <div className="row">
              <div className="col-2 form-group">
                <label>Qn No.</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter QN."
                  name="questionNumber"
                  value={questionNumber}
                  onChange={(e) => {
                    setQuestionNumber(e.target.value);
                    setError((preState) => {
                      return {
                        ...preState,
                        questionNumber: false,
                      };
                    });
                  }}
                  onBlur={(e) => onChangeHandler(e)}
                />
                {questionNumber && error.questionNumber ? (
                  <span className="text-danger text-error">
                    Qn No. cannot be greater than 4 characters.
                  </span>
                ) : null}
              </div>
              <div className="col-10 form-group">
                <label>Question Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Question Name"
                  name="questionName"
                  value={questionName}
                  onChange={(e) => {
                    setQuestionName(e.target.value);
                    setError((preState) => {
                      return {
                        ...preState,
                        questionName: false,
                      };
                    });
                  }}
                  onBlur={(e) => onChangeHandler(e)}
                />
                {!questionName && error.questionName ? (
                  <span className="text-danger text-error">
                    Question Name is required.
                  </span>
                ) : null}
                {questionName && error.questionName ? (
                  <span className="text-danger text-error">
                    Question Name must be less than 255 characters.
                  </span>
                ) : null}
              </div>
              <div className="col-12 form-group">
                <label>Question Text</label>
                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Enter Question Text"
                  name="questionText"
                  value={questionText}
                  onChange={(e) => {
                    setQuestionText(e.target.value);
                  }}
                  onBlur={(e) => onChangeHandler(e)}
                ></textarea>

                {/* <ReactQuill
                    value={questionText}
                    className="form-control"
                    placeholder="Enter Question Text"
                    modules={{ toolbar: { container: formats } }}
                    formats={formats}
                    onChange={(e) => {
                        setQuestionText(e);
                    }}
                  /> */}
                {/* {!questionText && error.questionText ? (
                                    <span className="text-danger text-error">Question Text cannot be empty.</span>
                                ) : null} */}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="row">
              <div className="col-3 form-group">
                <label>Weighting</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Weighting"
                  name="weighting"
                  value={weighting}
                  onChange={(e) => {
                    setWeighting(e.target.value);
                    setError((preState) => {
                      return {
                        ...preState,
                        weighting: false,
                      };
                    });
                  }}
                  onBlur={(e) => onChangeHandler(e)}
                />
                {weighting && error.weighting ? (
                  <span className="text-danger text-error">
                    Weighting must be less than 255 characters.
                  </span>
                ) : null}
              </div>

              <div className="col-3 form-group">
                <label>Priority</label>
                <Select
                  showSearch
                  className="form-select"
                  name="priority"
                  optionFilterProp="children"
                  placeholder="Select Priority"
                  onChange={(e) => {
                    setCanShowDialogLeavingPage(true);
                    setPriority(e);
                    setError((preState) => {
                      return {
                        ...preState,
                        priority: false,
                      };
                    });
                  }}
                  value={priority}
                  onBlur={() => onChangeHandlerSelect("priority", priority)}
                  notFoundContent="No Priorties found"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {priorites.map((priority) => (
                    <Option
                      key={priority.id}
                      value={priority.id}
                      label={priority.name}
                    >
                      {priority.name}
                    </Option>
                  ))}
                </Select>

                {error.priority ? (
                  <span className="text-danger text-error">
                    Please select priority.
                  </span>
                ) : null}
              </div>

              <div className="col-3 form-group">
                <label>
                  {bidQuestionType == BID_WORD_COUNT_TYPE ? "Word " : "Page "}{" "}
                  Count
                </label>
                <NumberFormat
                  type="text"
                  onKeyPress={(e) => {
                    if (e.charCode === 45) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    const pastedText = e.clipboardData.getData("text");
                    if (pastedText.includes("-")) {
                      e.preventDefault();
                    }
                    handlePaste(e);
                  }}
                  onCopy={handleCopy}
                  className="form-control"
                  placeholder={
                    bidQuestionType == BID_WORD_COUNT_TYPE
                      ? "Enter Word Count"
                      : "Enter Page Count"
                  }
                  name="wordCount"
                  value={wordCount}
                  onChange={(e) => {
                    const regex = /^[0-9\b]+$/; // regular expression to allow only numbers and backspace
                    const inputValue = e.target.value;
                    if (inputValue === "" || regex.test(inputValue)) {
                      setWordCount(inputValue);
                    }

                    setError((preState) => {
                      return {
                        ...preState,
                        wordCount: false,
                      };
                    });
                  }}
                  onBlur={(e) => {
                    onChangeHandler(e);
                    updateQuestionWcEquiv(e.target.value, complexity);
                  }}
                />
                {wordCount && error.wordCount ? (
                  <span className="text-danger text-error">
                    {bidQuestionType == BID_WORD_COUNT_TYPE
                      ? "Word Count cannot be greater than 70000000."
                      : "Page Count cannot be greater than 100000."}
                  </span>
                ) : null}
              </div>

              <div className="col-3 form-group">
                <label>Complexity</label>
                <Select
                  showSearch
                  className="form-select"
                  name="complexity"
                  placeholder="Select a Complexity"
                  optionFilterProp="children"
                  onChange={(e) => {
                    setComplexity(e);
                  }}
                  notFoundContent="No complexity found"
                  value={complexity}
                  onBlur={(e) => {
                    setCanShowDialogLeavingPage(true);
                    onChangeHandlerSelect("complexity", complexity);
                    updateQuestionWcEquiv(wordCount, complexity);
                  }}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  //defaultValue={complexities.find((option) => option.id == 2)?.id}
                >
                  {complexities.map((complexity) => (
                    <Option
                      key={complexity.id}
                      value={complexity.id}
                      label={complexity.name}
                    >
                      {complexity.name}
                    </Option>
                  ))}
                </Select>
                {error.complexity ? (
                  <span className="text-danger text-error">
                    Please select complexity.
                  </span>
                ) : null}
              </div>

              <div className="col-6 form-group mt-1">
                <div className="search-group">
                  <label>Question Owner</label>
                  <Select
                    showSearch
                    className="form-select"
                    name="questionOwner"
                    value={questionOwner ? questionOwner?.user?.fullName : null}
                    placeholder="Search and Select Question Owner"
                    onBlur={(e) => {
                      onChangeHandlerSelect("questionOwner", questionOwner);
                    }}
                    onChange={(newValue) => {
                      setCanShowDialogLeavingPage(true);
                      let itemToPush = questionOwners.find(
                        (questionOwner) => questionOwner.userId == newValue
                      );
                      setQuestionOwner(itemToPush);
                      //  setCanShowDialogLeavingPage(true);
                    }}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    style={{
                      width: "100%",
                    }}
                    notFoundContent={
                      <p className="font-weight-bold text--center m-0">
                      {BIDSUSHI_TEXT.noSme}
                      </p>
                    }
                  >
                    {questionOwners &&
                      questionOwners
                        .filter(
                          (questionOwner) =>
                            questionOwner?.user?.userRole?.name !== EXTERNAL_ROLE
                        )
                        .map((item) => {
                          return (
                            <Option
                              key={item.id}
                              value={item.userId}
                              label={item?.user?.fullName}
                            >
                              {item?.user?.fullName||item.fullName}
                            </Option>
                          );
                        })}
                  </Select>
                  {/* {!questionOwner && error.questionOwner ? (
                                        <span className="text-danger text-error">Question Owner cannot be empty.</span>
                                    ) : null} */}
                </div>
              </div>

              <div className="col-6 form-group mt-1">
                <div className="search-group">
                  <label>SME</label>
                  {/* <Select
                      name="sme"
                      className="form-select"
                       mode="multiple"
                      allowClear={true}
                      showSearch={true}
                      value={
                        sme && sme.length > 0 ?  sme.map((s) => s.userId): []
                      }
                      placeholder="Search and Select SME"
                      onBlur={(e) => onChangeHandlerSelect("sme", sme)}

                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      style={{
                        width: "100%",
                      }}
                      notFoundContent={
                        <p className="font-weight-bold text--center m-0">
                          Sorry! No SMEs found
                        </p>
                      }
                    >
                      {questionOwners &&
                        questionOwners
                          .filter(
                            (questionOwner) =>
                              questionOwner.role?.name == EXTERNAL_ROLE
                          )
                          .map((item) => {
                            return (
                              <Option
                                key={item.id}
                                value={item.userId}
                                label={item.fullName}
                              >
                                {item.fullName}
                              </Option>
                            );
                          })}
                    </Select> */}
                </div>
                <Select
                  mode="multiple"
                  placeholder="Search and Select SME"
                  value={sme.map((opt) => opt.id)}
                  onChange={handleSelectChange}
                  name="sme"
                  className="form-select sme-multiple-select"
                  allowClear={true}
                  showSearch={true}
                  style={{
                    width: "100%",
                  }}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  notFoundContent={
                    <p className="font-weight-bold text--center m-0">
                      {questionOwners &&
                    questionOwners
                      .filter(
                        (questionOwner) =>
                          questionOwner?.user?.userRole?.name== EXTERNAL_ROLE
                      )?.length==0?"No SMEs found":BIDSUSHI_TEXT.noSme}
                    </p>
                  }
                >
                  {questionOwners &&
                    questionOwners
                      .filter(
                        (questionOwner) =>
                          questionOwner?.user?.userRole?.name== EXTERNAL_ROLE
                      )
                      .map((item) => {
                        return (
                          <Option
                            key={item.id}
                            value={item.id}
                            label={item?.user?.fullName}
                          >
                            {item?.user?.fullName}
                          </Option>
                        );
                      })}
                </Select>
              </div>

              <div className="col-12 form-group mt-1 doc-link">
                <label>Link With Document</label>
                {!isLinkEdit ? (
                  <>
                    <br />
                    <a
                      className="text-ellipse doc-url"
                      href={documentLink}
                      target="_blank"
                    >
                      {documentLink}
                    </a>
                    <i
                     style={{cursor:"pointer"}}
                      onClick={() => setIsLinkEdit((preState) => !preState)}
                      className="fa fa-pencil"
                    ></i>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Document Link"
                      name="documentLink"
                      value={documentLink}
                      onChange={(e) => {
                        setDocumentLink(e.target.value);
                        setError((preState) => {
                          return {
                            ...preState,
                            documentLink: false,
                          };
                        });
                      }}
                      onBlur={(e) => onChangeHandler(e)}
                    />
                    {/* {documentLink &&
                      documentLink.length < 255 &&
                      !error.documentLink && (
                        <i
                          onClick={() => setIsLinkEdit((preState) => !preState)}
                          className="fa fa-check"
                        ></i>
                      )} */}
                    {documentLink &&
                    documentLink.length < 255 &&
                    error.documentLink ? (
                      <span className="text-danger text-error">
                        Invalid document link provided.
                      </span>
                    ) : null}
                    {documentLink &&
                    documentLink.length > 255 &&
                    error.documentLink ? (
                      <span className="text-danger text-error">
                        Document link cannot be greater than 255 characters.
                      </span>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container table-responsive table-question" ref={tableRef}>
        {questionsStages && questionsStages.length > 0 && (
          <table className="table">
            <tr>
              <th width="90">Included?</th>
              <th>Stage</th>
              <th width="130" className="text-center">
                Time Equivalent (Days)
              </th>
              <th width="120" className="text-center">
                Default Overhead%
              </th>
              <th width="280">Assign To</th>
              <th width="80"></th>
            </tr>
            {questionsStages &&
              questionsStages
                .filter((a) => a.bidStageChecked)
                .sort((a, b) => a.sortOrder - b.sortOrder).map((stage, index) => (
                  <tr key={index}>
                    <td>
                      <div className="custom-rounded-check">
                        <input
                          type="checkbox"
                          name={index}
                          id={index}
                          checked={!stage.isChecked}
                          onChange={(newValue) => {
                            setCheckboxWithIndex(stage, newValue);
                            setCanShowDialogLeavingPage(true);
                          }}
                        />
                        <label htmlFor={index}></label>
                      </div>
                    </td>
                    <td>
                      {" "}
                      <Tooltip placement="top" color="#fff" title={stage.name}>
                        <div className="td-title text-ellipse">
                          {stage.name}
                        </div>
                      </Tooltip>
                    </td>

                    <td>
                      <NumberFormat
                        disabled={!stage.isChecked}
                        value={stage.wc_equiv || stage.wc_equiv=='0.00'? stage.wc_equiv : ""}
                        className="form-control"
                        onBlur={(e) => {
                          setWordCountForStage(stage, e.target.value);
                        }}
                        onKeyPress={(e) => {
                          if (e.charCode === 45) {
                            e.preventDefault();
                          }
                        }}
                        onPaste={(e) => {
                          const pastedText = e.clipboardData.getData("text");
                          if (pastedText.includes("-")) {
                            e.preventDefault();
                          }
                        }}
                        maxLength={8}
                      />
                      {/* {showQuestionStagesErrors && !stage.wc_equiv && stage.isChecked ? <span className="text-danger text-error">Please assign the word count first</span> : ''} */}
                    </td>
                    <td className="text-center">{stage.overhead + "%"}</td>
                    <td>
                      {stage.isChecked ? (
                        stage.assign_to == null ? (
                          <Select
                            showSearch
                            //disabled={!wordCount}
                            className="form-select table-select"
                            name="teamAssignee"
                            value={stage.assign_to ? stage.assign_to : null}
                            placeholder="Search/Select..."
                            //onBlur={(e) => onChangeHandlerSelect('questionOwner', questionOwner)}
                            onChange={(newValue) => {
                              setTeamAssigneeWithIndex(stage, newValue);
                            }}
                            filterOption={(input, option) =>
                              (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            style={{
                              width: "100%",
                            }}
                            notFoundContent={
                              <p className="font-weight-bold text--center m-0">
                                Sorry! No User found
                              </p>
                            }
                          >
                            {questionOwners &&
                              questionOwners
                                .filter(
                                  (questionOwner) =>
                                    questionOwner?.user?.isDeleted==0
                                )
                                .map((item) => {
                                  return (
                                    <Option
                                      key={item.id}
                                      value={item.id}
                                      label={item?.user?.fullName}
                                    >
                                      <div className="d-flex align-items-center">
                                        {item?.user?.avatar != null &&
                                        item?.user?.avatar != "null" ? (
                                          <img
                                            src={avatarURL + item?.user?.avatar}
                                            class="tag-img"
                                            alt=""
                                          />
                                        ) : (
                                          <img
                                            src="/images/user-circle.png"
                                            class="tag-img"
                                            alt=""
                                          />
                                        )}
                                        <div>
                                          <p className="mb-0 d-flex">
                                          <div className="text-ellipse user-full-name d-inline-block">{item?.user?.fullName}</div>
                                            <>{item?.user?.userRole?.name == EXTERNAL_ROLE ? (
                                            <span className="tag tag-blue">External </span>
                                            
                                          ) : (
                          ""
                        )}</>
                                          </p>
                                          <p className="user-email text-ellipse mb-0">
                                            {item?.user?.email}
                                          </p>
                                        </div>
                                      </div>
                                    </Option>
                                  );
                                })}
                          </Select>
                        ) : (
                            <span className="tag tag-white assign-tag">
                              {stage?.assign_to?.user?.avatar != null &&
                              stage?.assign_to?.user?.avatar != "null" ? (
                                <img
                                  src={avatarURL + stage?.assign_to?.user?.avatar}
                                  class="tag-img"
                                  alt=""
                                />
                              ) : (
                                <img
                                  src="/images/user-circle.png"
                                  class="tag-img"
                                  alt=""
                                />
                              )}
                              <Tooltip
                                placement="top"
                                color="#fff"
                                title={stage.assign_to?.user?.fullName}
                              >
                                <span className="user-full-name">{stage.assign_to?.user?.fullName} </span>
                                <span >{stage?.assign_to?.user?.userRole?.name == EXTERNAL_ROLE ? (
                          <span className="tag tag-blue mx-1">External </span>
                        ) : (
                          ""
                        )}</span>
                              </Tooltip>
                              <i
                                onClick={() => {
                                  showSearchBox(stage);
                                }}
                                className="fa fa-close"
                              ></i>
                            </span>
                        )
                      ) : (
                        ""
                      )}
                      {/* {showQuestionStagesErrors && !stage.assign_to && stage.isChecked ? <span className="text-danger text-error">Please assign the team member first</span> : ''} */}
                    </td>
                    <td className="text-center">
                      {stage.isChecked &&
                      index != questionsStages
                      .filter((a) => a.bidStageChecked).length - 1 ? (
                        stage.assign_to ? (
                          <a
                            onClick={() => copyDownTeamMember(stage)}
                            className="dup-icon"
                          >
                            <Tooltip
                              placement="top"
                              color="#fff"
                              title="Copy Team Member Downwards"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                id="Layer_1"
                                data-name="Layer 1"
                                viewBox="0 0 405.25296 470"
                              >
                                <path
                                  d="M3977,637c-6.0523-2.156-12.5904-3.47159-18.061-6.63388-13.55633-7.83633-20.80855-20.19745-20.83553-35.83157q-.25872-149.9497-.01565-299.90006a41.97828,41.97828,0,0,1,40.77328-41.71957c13.4695-.39142,26.95969-.07183,41.13891-.07183V295.2518c-5.7567,0-11.038-.04747-16.31813.00919-14.05469.15078-22.897,8.79831-22.90467,22.7299q-.07,126.70793.00121,253.41594c.00828,13.95181,8.89044,22.57837,22.98357,22.58334q93.96883.03315,187.93767.00428c14.95129-.00306,23.53137-8.54316,23.53628-23.55909q.0407-123.709.01386-247.41793c0-2.13057,0-4.26114,0-7.01743H4258V600c-.32227.91748-.72147,1.81583-.95532,2.75534q-6.46875,25.98546-32.34394,32.84009c-1.89071.504-3.8.93808-5.70074,1.40457Z"
                                  transform="translate(-3852.74704 -167)"
                                />
                                <path
                                  d="M4020,167v43h-5.6615q-47.48392,0-94.96784.00348c-15.53686.00561-24.10867,8.544-24.11209,24.12071q-.02735,124.70775-.05943,249.41548a36.28517,36.28517,0,0,1-1.24889,10.81784,20.7769,20.7769,0,0,1-22.65862,14.07343c-10.47069-1.59287-17.884-9.55182-18.46424-19.8476-.07492-1.3295-.07331-2.66449-.07336-3.99691q-.00505-135.954.00694-271.90791c.0056-21.03541,10.80768-36.98452,29.15233-43.09492,3.28466-1.09409,6.7206-1.734,10.0867-2.58357Z"
                                  transform="translate(-3852.74704 -167)"
                                />
                                <path
                                  d="M4188,167q-.06972,40.24289-.1449,80.48576c-.01,4.66326,2.46366,6.53583,6.91055,6.51782,11.16553-.04521,22.33176.03773,33.49689-.04164,3.91074-.02777,7.3523.54449,9.04627,4.65736,1.64764,4.00044-.62857,6.63395-3.19132,9.19493q-41.72973,41.70146-83.45639,83.40591c-5.226,5.21608-8.15475,5.16963-13.48718-.15482q-41.56994-41.50767-83.09853-83.05678c-2.67917-2.6773-5.13417-5.38748-3.2939-9.60238,1.79528-4.11186,5.32685-4.46354,9.17935-4.44035,11.16532.06719,22.33146-.01205,33.49692.03929,4.48123.02061,6.892-1.92767,6.88849-6.552q-.03034-39.49606-.05627-78.99214A7.52881,7.52881,0,0,0,4100,167Z"
                                  transform="translate(-3852.74704 -167)"
                                />
                              </svg>
                            </Tooltip>
                          </a>
                        ) : (
                          <a className="dup-icon disable-icon color-secondary">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              id="Layer_1"
                              data-name="Layer 1"
                              viewBox="0 0 405.25296 470"
                            >
                              <path
                                d="M3977,637c-6.0523-2.156-12.5904-3.47159-18.061-6.63388-13.55633-7.83633-20.80855-20.19745-20.83553-35.83157q-.25872-149.9497-.01565-299.90006a41.97828,41.97828,0,0,1,40.77328-41.71957c13.4695-.39142,26.95969-.07183,41.13891-.07183V295.2518c-5.7567,0-11.038-.04747-16.31813.00919-14.05469.15078-22.897,8.79831-22.90467,22.7299q-.07,126.70793.00121,253.41594c.00828,13.95181,8.89044,22.57837,22.98357,22.58334q93.96883.03315,187.93767.00428c14.95129-.00306,23.53137-8.54316,23.53628-23.55909q.0407-123.709.01386-247.41793c0-2.13057,0-4.26114,0-7.01743H4258V600c-.32227.91748-.72147,1.81583-.95532,2.75534q-6.46875,25.98546-32.34394,32.84009c-1.89071.504-3.8.93808-5.70074,1.40457Z"
                                transform="translate(-3852.74704 -167)"
                              />
                              <path
                                d="M4020,167v43h-5.6615q-47.48392,0-94.96784.00348c-15.53686.00561-24.10867,8.544-24.11209,24.12071q-.02735,124.70775-.05943,249.41548a36.28517,36.28517,0,0,1-1.24889,10.81784,20.7769,20.7769,0,0,1-22.65862,14.07343c-10.47069-1.59287-17.884-9.55182-18.46424-19.8476-.07492-1.3295-.07331-2.66449-.07336-3.99691q-.00505-135.954.00694-271.90791c.0056-21.03541,10.80768-36.98452,29.15233-43.09492,3.28466-1.09409,6.7206-1.734,10.0867-2.58357Z"
                                transform="translate(-3852.74704 -167)"
                              />
                              <path
                                d="M4188,167q-.06972,40.24289-.1449,80.48576c-.01,4.66326,2.46366,6.53583,6.91055,6.51782,11.16553-.04521,22.33176.03773,33.49689-.04164,3.91074-.02777,7.3523.54449,9.04627,4.65736,1.64764,4.00044-.62857,6.63395-3.19132,9.19493q-41.72973,41.70146-83.45639,83.40591c-5.226,5.21608-8.15475,5.16963-13.48718-.15482q-41.56994-41.50767-83.09853-83.05678c-2.67917-2.6773-5.13417-5.38748-3.2939-9.60238,1.79528-4.11186,5.32685-4.46354,9.17935-4.44035,11.16532.06719,22.33146-.01205,33.49692.03929,4.48123.02061,6.892-1.92767,6.88849-6.552q-.03034-39.49606-.05627-78.99214A7.52881,7.52881,0,0,0,4100,167Z"
                                transform="translate(-3852.74704 -167)"
                              />
                            </svg>
                          </a>
                        )
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                ))}
          </table>
        )}
        {questionsStages && questionsStages?.filter((a) => a.bidStageChecked)?.length == 0 && (
          <div className="row m-0">
            <div className="no-data bg-gray border-rounded">
              <img src="/images/Stages.png" alt="" height={70} />
              <h3>You have not added any Stages to the Questions yet</h3>
            </div>
          </div>
        )}
      </div>

      <div className="row">
        <div className="col-12 text-center">
          <span className="total-value">
            Total Time Equivalent:{" "}
            <strong>
              {
                //console.log(selectedWordCounts){}

                questionsStages &&
                  questionsStages
                    .reduce((accumulator, currentValue) => {
                      if (
                        currentValue.wc_equiv != null &&
                        currentValue.isChecked
                      ) {
                        return accumulator + parseFloat(currentValue.wc_equiv);
                      }
                      return accumulator;
                    }, 0)
                    .toFixed(2)
              }{" "}
              days
            </strong>
          </span>
          <hr />
        </div>

        <div className="col-12 text-end">
          <button className="btn btn-secondary me-2" onClick={showModal}>
            Cancel
          </button>
          <button
            disabled={loading}
            className="btn btn-primary me-2"
            onClick={() => {
              saveQuestions(true);
            }}
          >
            Save & Finish Question
          </button>
          <button
            disabled={loading}
            className="btn btn-success"
            onClick={() => {
              saveQuestions(false);
            }}
          >
            Save & Add New Question
          </button>
        </div>
      </div>
      <Modal
        title="Confirmation Message"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={BIDSUSHI_TEXT.Yes}
        cancelText={BIDSUSHI_TEXT.No}
      >
        <p className="confirmation-text">
          {BIDSUSHI_TEXT.cancelQuestionButton}
        </p>
      </Modal>
    </div>
  );
};

export default AddQuestion;
