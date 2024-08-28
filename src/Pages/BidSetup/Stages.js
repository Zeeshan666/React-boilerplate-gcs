import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Card, Checkbox,Modal,Tooltip,Spin} from 'antd';
import { useBidContext } from '../../hooks/useBidContext';
import { STAGES_ADD_ACTION } from '../../Context/Actions';
import { useParams } from "react-router-dom";
import bidShushi from '../../Services/Api/Api';
import BIDSUSHI_TEXT from "../../Common/Constant";

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

const Stages = ({ setStageChange, resBidStages ,selectedTab}) => {

    const [allStages, setAllStages] = useState([]);
    const [loading, setIsloading] = useState(false);
    const [removeStages,setRemoveStages] = useState(false);

    const { stages,questions, dispatch,allQuestions } = useBidContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStageLoader,setIsStageLoader] = useState(false)
    const [isSelectAll,setIsSelectAll] = useState(false);
    const [isModalOpenALL,SetIsModalOpenALL] = useState(false);
    const { bidId } = useParams();
    //move away code
    const [canShowDialogLeavingPage, setCanShowDialogLeavingPage] = useState(
        false
    );

    const stageOrdering = () => {
        let resStages = [];
        if (stages.length > 0) {
            resStages = stages.sort((a, b) => a.sortOrder - b.sortOrder);
        }
        setIsloading(true);
       
        bidShushi.getStages().then((res) => {
            let finalRes = res && res.data.map((r) => {
                return {
                    isChecked: r.isActive,
                    stageId: r.id,
                    ...r
                }
            })
            if (resStages.length == 0) {
                setAllStages(finalRes);
                dispatch({ type: STAGES_ADD_ACTION, payload: finalRes })
            }
            else {
                let diffStages = finalRes.filter((item) => {
                    return !resStages.some((item2) => {
                      return item.id === item2.stageId;
                    });
                }).map((s) => {
                    return {
                        ...s,
                        isChecked: false,
                        newStage: true,
                    }
                });

                let allStages = []
                if (diffStages.length > 0) {
                    allStages = [...resStages, ...diffStages]
                }
                else {
                    allStages = [...resStages]
                }
               let modifiedStages = allStages.map((r) => {
                return {
                  //   alreadyIncluded:allQuestions&&allQuestions.filter(q => q.bidQuestionStagesJSON.some(obj => obj?.bidStageId == r.id&&obj.isChecked)),
                    ...r
                }
            })
               if(modifiedStages&&modifiedStages.length>0&&modifiedStages.every(a=>a.isChecked)){
                setIsSelectAll(true);
               }else{
                setIsSelectAll(false);
               }
                setAllStages(modifiedStages);
                dispatch({ type: STAGES_ADD_ACTION, payload: allStages })
            }
            setIsloading(false);
        }).catch(err => {
            console.log(err)
        })
    }

    const onDragEnd = (result) => {
        if (!result.destination) return;
        if (result.destination.index === result.source.index) return;
        const updatedStages = reorder(
            allStages,
            result.source.index,
            result.destination.index
        );
        setAllStages(updatedStages);
        dispatch({ type: STAGES_ADD_ACTION, payload: updatedStages })
        setStageChange(true);
        setCanShowDialogLeavingPage(true);
    }

    const onChangeHandler = (e, item) => {
        if(item.isChecked){
            setIsStageLoader(true);
            let data = {
                bidStageId:[item.id]
              };
            bidShushi.isStageExist(data,bidId).then((res)=>{
                setIsStageLoader(false);
                if(res){
                    if( item.isChecked){
                        setRemoveStages(item);
                        setIsModalOpen(true);
                    }else{
                      let updatedStages = allStages.map((a) => {
                        if (a.id == item.id) {
                            return {
                                ...a,
                                isChecked: true,
                              };
                        }
                        return a;
                    })
                    setAllStages(updatedStages);
                    dispatch({ type: STAGES_ADD_ACTION, payload: updatedStages });
                    setStageChange(true);
                    setCanShowDialogLeavingPage(true)
                    if(updatedStages&&updatedStages.length>0&&updatedStages.every(a=>a.isChecked)){
                        setIsSelectAll(true);
                       }else{
                        setIsSelectAll(false);
                       }
                    }
                }else{
                    let updatedStages = allStages.map((a) => {
                        if (a.id == item.id) {
                            return {
                                ...a,
                                isChecked: e.target.checked
                              };
                        }
                        return a;
                    })
                    setAllStages(updatedStages);
                    dispatch({ type: STAGES_ADD_ACTION, payload: updatedStages });
                    setStageChange(true);
                    setCanShowDialogLeavingPage(true);
                    if(updatedStages&&updatedStages.length>0&&updatedStages.every(a=>a.isChecked)){
                        setIsSelectAll(true);
                       }else{
                        setIsSelectAll(false);
                       }
                }
    
            }).catch(err=>{
                setIsStageLoader(false);
                console.log(err)
            })
        }else{
            let updatedStages = allStages.map((a) => {
                if (a.id == item.id) {
                    return {
                        ...a,
                        isChecked: !item.isChecked,
                      };
                }
                return a;
            })
            setAllStages(updatedStages);
            dispatch({ type: STAGES_ADD_ACTION, payload: updatedStages });
            if(updatedStages&&updatedStages.length>0&&updatedStages.every(a=>a.isChecked)){
                setIsSelectAll(true);
               }else{
                setIsSelectAll(false);
               }
            setStageChange(true);
            setCanShowDialogLeavingPage(true)
        }
        //do if for unchecked only
      
    };

    const onChangeHandlerIncluded = (e, item) => {
        if( item.isChecked){
            setRemoveStages(item);
            setIsModalOpen(true);
        }else{
          let updatedStages = allStages.map((a) => {
            if (a.id == item.id) {
                return {
                    ...a,
                    isChecked: true,
                  };
            }
            return a;
        })
        setAllStages(updatedStages);
        dispatch({ type: STAGES_ADD_ACTION, payload: updatedStages });
        setStageChange(true);
        setCanShowDialogLeavingPage(true)
        }
    };



    const cancelHandle=()=>{
        
        setRemoveStages(null);
        setIsModalOpen(false);
    };

    const cancelHandleAll=()=>{
     SetIsModalOpenALL(false);
    }

   const handleOk =(removeStages)=>{
       let updatedStages = allStages.map((a) => {
            if (a.id == removeStages.id) {
                return {
                    ...a,
                    isChecked: !removeStages.isChecked,
                  };
            }
            return a;
        })
        setAllStages(updatedStages);
        dispatch({ type: STAGES_ADD_ACTION, payload: updatedStages });
        setStageChange(true);
        setCanShowDialogLeavingPage(true);
        setIsModalOpen(false);
        if(updatedStages&&updatedStages.length>0&&updatedStages.every(a=>a.isChecked)){
            setIsSelectAll(true);
           }else{
            setIsSelectAll(false);
           }
    }
    useEffect(() => {
        stageOrdering()
    }, [])

    useEffect(() => {
        stageOrdering()
    }, [resBidStages])

    const checkBoxChangeHandler = (e) => {
     // setIsSelectAll(e.target.checked);
      if (e.target.checked) {
        setIsSelectAll(e.target.checked);
        selectAllStages();
      } else {
        allStagesWhichExist();
      }
    };

    const allStagesWhichExist = () => {
     setIsStageLoader(true);
      let ids = allStages.map((a) => a.id);
      let data={
        bidStageId:ids
      }
      bidShushi
        .isStageExist(data, bidId)
        .then((res) => {
          setIsStageLoader(false);
          if (res) {
            SetIsModalOpenALL(true)
          } else {
            removeAllStages();
          }
        })
        .catch((err) => {
            SetIsModalOpenALL(true)
        //  removeAllStages();
          setIsStageLoader(false);
          console.log(err);
        });
    };
    
    const selectAllStages = () => {
      const updatedStages = allStages.map((a) => {
        return {
          ...a,
          isChecked: true,
        };
      });
      setAllStages(updatedStages);
      setStageChange(true);
      setCanShowDialogLeavingPage(true);
      dispatch({ type: STAGES_ADD_ACTION, payload: updatedStages });
    };

    const removeAllStages = () => {
      const updatedStages = allStages.map((a) => {
        return {
          ...a,
          isChecked: false,
        };
      });
      setStageChange(true);
      setIsSelectAll(false);
      setCanShowDialogLeavingPage(true);
      SetIsModalOpenALL(false);
      setAllStages(updatedStages);
      dispatch({ type: STAGES_ADD_ACTION, payload: updatedStages });
    };

    return (
        <Card className='stages-card' loading={loading} style={{backgroundColor:'transparent',border:'none'}}>
            
    {     isStageLoader&&    <div className="lds-ripple loader">
        <div></div>
      </div>}
    
                       {allStages && allStages.length > 0 &&<div className="stage-select">
                        <div><Checkbox checked={isSelectAll}  onChange={(e)=>checkBoxChangeHandler(e)}> {!isSelectAll?"Select All":"Unselect All"} </Checkbox></div>
                        </div>}
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="list">
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >

                            {allStages && allStages.length == 0 &&loading&& (
                                <div className="row m-0">
                                    <div className="no-data bg-gray border-rounded">
                                        <img src="/images/Stages.png" alt="" height={70} />
                                        <h3>
                                            There are no stages added yet
                                            <br />
                                            Please contact your administrator.
                                        </h3>
                                    </div>
                                </div>
                            )}
                            {allStages && allStages.map((item, index) =>
                                <Draggable draggableId={item.id} key={item.id} index={index}>
                                    {(provided) => (
                                        <div
                                            className="drag-listing-wrapper"
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <div className="drag-item">
                                                
                                                <div className="drag-icon">
                                                    <img src="/images/drag-icon.png" />
                                                </div>
                                                <div className="drag-item-name">
                                                    <Tooltip placement="top" color="#fff" title={item.name}>

                                                    {item.name}
                                                    </Tooltip>
                                                </div>
                                                <div className="drag-percent">Overhead: <span>{item.overhead}%</span></div>
                                                <div className="custom-rounded-check">
                                                    
                                                     <Checkbox  name="drag1" id="drag1" onChange={(e) => onChangeHandler(e, item)} checked={item.isChecked}></Checkbox>
                                                    

                                                    {/* {
                                                      item.alreadyIncluded&&item.alreadyIncluded.length>0  &&  <Checkbox  name="drag1" id="drag1" onChange={(e) => onChangeHandlerIncluded(e, item)} checked={item.isChecked}></Checkbox>
                                                    }
                                                    */}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Draggable>)}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            {/* onOk={() => { handleOk(teamMemberTRemove) }} */}
            <Modal  okText={BIDSUSHI_TEXT.Yes} cancelText={BIDSUSHI_TEXT.No}  title="Confirmation Message" maskClosable={true} open={isModalOpen}   onOk={() => { handleOk(removeStages) }} onCancel={cancelHandle} >
                  <p className="confirmation-text color-gray mb-3">{BIDSUSHI_TEXT.unselectStage}</p> 
                  <p className="confirmation-text">{BIDSUSHI_TEXT.unselectStage1}</p>
                </Modal>
                <Modal  okText={'Yes'} cancelText={'No'}  title="Confirmation Message" maskClosable={true} open={isModalOpenALL}   onOk={() => { removeAllStages() }} onCancel={cancelHandleAll} >
                  <p className="confirmation-text color-gray mb-3">{BIDSUSHI_TEXT.unselectAllStages}</p> 
                  <p className="confirmation-text">{BIDSUSHI_TEXT.unselectStage1}</p>
                </Modal>
        </Card>
    )
}

export default Stages