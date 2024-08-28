import { Skeleton, Modal, Tooltip } from "antd";
import React, { useState, useEffect, useRef } from "react";
import { CirclePicker } from 'react-color';
import InfiniteScroll from "react-infinite-scroll-component";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import bidShushi from "../../Services/Api/Api";
import { colorsList as colors } from '../../Common';
import Form from "./Form";
import { notification, Popover } from "antd";
import bidShushiText from "../../Common/Constant";

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

function StageMasterList() {


    const [api, contextHolder] = notification.useNotification();
    const [totalStageLength, setTotalStageLength] = useState('');
    const [pageNumber, setPageNumeber] = useState(0);
    const [stages, setStages] = useState([])
    const [loading, setIsloading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stageModal, setStageModal] = useState(null);
    const [selectedStage, setSelectedStage] = useState(null);
    const [trigger, setTrigger] = useState(false)
    const [allColors,setAllColors]= useState([]);
    const [colorsList, setColorsList] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);

    useEffect(() => {

        bidShushi.colorsList()
        .then((res)=>{
      //   console.log(res);
           setAllColors(res.filter(a=>a.name!=null));
           setColorsList(res.filter(a=>a.name!=null));
         //  showLessColor();
        }).catch(err=>{
          console.log(err)
        })
        setIsloading(true);
     
        fetchMoreData();
    }, [])



    // const getAllStages = () => {
    //     bidShushi.getStages()
    //         .then(res => {
    //             setStages(res&&res.data);
    //             setIsloading(false);
    //         }).catch(err => console.log(err))
    // }

    const showModal = (stage) => {
        setSelectedStage(stage)
        setIsModalOpen(true);
    };

    const fetchMoreData = (p=false) => {
        setDataLoading(true);
        let size;
        bidShushi.getStages(p?0:pageNumber, size = -1).then((res) => {
            console.log(res)
            setIsloading(false);
            setTotalStageLength(res.totalItems);
            setPageNumeber(preState => preState + 1); // bcz page starts from 0
            if (res.data && res.data.length) {
                setStages((preBids) => {
                    return [...preBids, ...res.data]
                })         
            }
            setDataLoading(false);
        }).catch(err => console.log())

    };


    const handleOk = (stage) => {
        bidShushi.deleteStage(stage.id)
            .then((res) => {
              //  console.log(res);
                let updatedStages = stages.filter(s => s.id !== stage.id);
                let data = updatedStages.map((s, i) => {
                  if (i > updatedStages.findIndex(a => a.id === stage.id)) {
                    return {
                      ...s,
                      sortOrder: parseInt(i + 1)
                        };
                  } else {
                    return {
                      ...s
                    };
                  }
                });
              let newOrder = data.map((stage, ind) => {
                    return {
                        id: stage.id,
                        sortOrder: ind+1
                    }
                });
               setStages(updatedStages);
               bidShushi.sortedStages(newOrder)
               .then((data) => {
              //  console.log(data);
            }).catch(err => {
                console.log(err)
            })
               api.success({
                    message: `Success`,
                    description:bidShushiText.stageDeleted,
                    placement: 'topRight'
                })
            })
        setIsModalOpen(false);
    };



    const colorPickerButtonRefs = useRef(Array(stages.length).fill(null));

    const toggleColorPickerMenu = (index) => {

        setStages((prevQuestions) => {
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
        setStages((preState) => {
            return preState.map((q, i) => {
                return { ...q, showColorPicker: false };
            });
        });
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        if (result.destination.index === result.source.index) return;
        const updatedStages = reorder(
            stages,
            result.source.index,
            result.destination.index
        );
        setStages(updatedStages);
        let data = updatedStages.map((stage, ind) => {
            return {
                id: stage.id,
                sortOrder: ind+1
            }
        });
       // console.log(data);

        bidShushi.sortedStages(data)
            .then((data) => {
                //console.log(data);
                api.success({
                    message: `Success`,
                    description: bidShushiText.dragDropStage,
                    placement: 'topRight'
                })
            }).catch(err => {
                console.log(err)
            })
    }

//   useEffect(()=>{
//    if(pageNumber==0&&stages.length==0){
      
//        fetchMoreData()
//    }
//   },[pageNumber])

    const handleColorChange = (color, index) => {
        // create a copy of the stage array
        const updatedStages = [...stages];
        // update the color property of the selected question
        updatedStages[index] = {
            ...updatedStages[index],
            color: allColors.find(a=>a.name.toUpperCase()==color?.hex?.toUpperCase())
        };
        // update the state with the updated questions array
        let postColorData = {
            "name": updatedStages[index].name,
            "overhead": updatedStages[index].overhead,
            "colorId": updatedStages[index].color ? updatedStages[index].color?.id : allColors.find(a=>a.name.toLowerCase()=='#f16667')?.id
        }
        setStages(updatedStages);
        bidShushi.updateStage(postColorData, updatedStages[index].id)
            .then((res) => {
                api.success({
                    message: `Success`,
                    description: bidShushiText.stageColorSet,
                    placement: 'topRight'
                })
                // setStages(updatedStages);
            }).catch((err) => {
                api.error({
                    message: `Error`,
                    description: 'Error in changing the color of the Stage.',
                    placement: 'topRight'
                })
                console.log(err)
            })

        //  toggleColorPickerMenu(index);
    };

    const showLessColor = () => {
        let updated = colorsList.filter((a, i) => i <= 4)
        setColorsList(updated)
    }

    const showMoreColor = () => {
       // let updated = [...colors];
        setColorsList(allColors)
    }

    const handleCancel = () => {
        setSelectedStage(null);
        setIsModalOpen(false);
    };

    const showStageModal = (stage = null) => {
        setStageModal(true);
        setSelectedStage(stage);
    }

    const isSavedData = (data, show, updated) => {
     //   console.log(data, 'calling from child', updated)
        ///setIsloading(true);
        if (updated) {
            let index = stages.findIndex(s => s.id === data.id)
          //  console.log(index);
            const updatedStages = [...stages];
            updatedStages[index] = {
                ...updatedStages[index],
                name: data.name,
                color: data.color,
                overhead: data.overhead
            };
          //  console.log(updatedStages);
            setStages(updatedStages);
            setStageModal(show);
            api.success({
                message: `Success`,
                description: bidShushiText.stageUpdated,
                placement: 'topRight'
            });
            //  fetchMoreData();
        } else {
            // const updatedStages = [ ...stages,data];
            // setStages(updatedStages);
            setPageNumeber(0);
            setIsloading(true)
            setStages([]);
            fetchMoreData(true)
            api.success({
                message: `Success`,
                description: bidShushiText.stageAdded,
                placement: 'topRight'
            })
       //     fetchMoreData();
            setStageModal(show);
            setDataLoading(false);
        }

    };

    const cancelHandler = () => {
        setSelectedStage(null);
        setStageModal(false);
    }
    return (
        <>
            {contextHolder}
            <div className="row">
                <div className="col-12 text-end mb-3">
                    <a onClick={() => {
                        setStageModal(true);
                        setSelectedStage(null);
                    }} className="btn btn-success"><i className="fa fa-plus-square-o me-2"></i> Add Stage</a>
                </div>
            </div>
            <div className="drag-listing-wrapper">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="list">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                <InfiniteScroll
                                    dataLength={stages.length}
                                  //  next={fetchMoreData}
                                    hasMore={stages.length === totalStageLength ? false : true}
                                    loader={<p><Skeleton loading={loading} /></p>}

                                >
                                    {


                                        stages.length > 0 && stages.filter((item, index) => {
                                            return index === stages.findIndex(obj => obj.id === item.id);
                                          }).map((stage, ind) => {
                                            return <Draggable draggableId={stage.id.toString()} key={stage.id} index={ind}>
                                                {(provided) => (
                                                    <div className="drag-item"
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}>
                                                        <div className="drag-icon">
                                                            <img src="/images/drag-icon.png" />
                                                        </div>
                                                        <div className="bg-color-round" style={{ cursor: 'pointer' }}>
                                                            <i className="round" onClick={() => toggleColorPickerMenu(ind)}
                                                                ref={(el) => (colorPickerButtonRefs.current[ind] = el)} style={{ backgroundColor:stage?.color?.name }}></i>
                                                        </div>
                                                        <Popover placement="bottom"
                                                            content={() => <div className='color-wrapper rel'>
                                                                <h3>Choose Colours   <i onClick={hideColorPickerMenu} className="close-color" ><img src="/images/close-icon.png" /></i></h3>
                                                                <CirclePicker className={colorsList.find(a=>a?.name===stage?.color?.name)?`s-${stage?.color?.name?.slice(1)}`:""} color={stage?.color?.name}  colors={colorsList.map(a=>a?.name)} onChange={(color) => handleColorChange(color, ind)} />
                                                                {
                                                                    colorsList.length > 5 ? <p className='view-link' onClick={showLessColor}>View Less</p>
                                                                        : <p className='view-link' onClick={showMoreColor}>View more</p>
                                                                }


                                                            </div>}
                                                       onVisibleChange={hideColorPickerMenu} 
                                                            trigger="click"
                                                            open={stage.showColorPicker}
                                                        >

                                                        </Popover>
                                                        <div className="drag-item-name">
                                                        <Tooltip placement="top" color="#fff" title={stage.name}>
                                                            {stage.name}
                                                            </Tooltip>
                                                        </div>
                                                        <div className="drag-percent">Overhead: <span>{stage.overhead}%</span></div>

                                                        <div className="action-btn ms-5">

                                                            <a onClick={() => showStageModal(stage)} className="me-4">
                                                            <Tooltip placement="top" color="#fff" title="Edit">
                                                                <svg
                                                                    className="pencil gray-pencil"
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
                                                            <a onClick={() => showModal(stage)}>
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

                                                    </div>
                                                )}
                                            </Draggable>
                                        })
                                    }
                                    {
                                        loading && <Skeleton loading={loading} avatar={true} />
                                    }
                                    {
                                        stages.length == 0 && !loading &&
                                        (<div className="row m-0">
                                            <div className="no-data bg-gray border-rounded">
                                                <img src="/images/user-thumb.png" alt="" />
                                                <h3>
                                                    There are no stages in the system.
                                                </h3>
                                            </div>
                                        </div>)
                                    }            {
                                        dataLoading&&<Skeleton avatar active/>
                                       }
                                    {provided.placeholder}
                                </InfiniteScroll>
                    
                            </div>)}
                    </Droppable>
                </DragDropContext>

            </div>
            <Modal  okText={'Yes'} cancelText={'No'}  title="Confirmation Message" open={isModalOpen} onOk={() => handleOk(selectedStage)} onCancel={handleCancel}>
                <p className="confirmation-text">Are you sure you want to delete this Stage? </p>
            </Modal>
            <Modal  className='add-stage-modal' okText={'Yes'} cancelText={'No'} destroyOnClose={true} maskClosable={true} open={stageModal} closable={true}  onCancel={()=>cancelHandler(false)} okButtonProps={{ className: 'd-none' }} cancelButtonProps={{ className: 'd-none' }} title={selectedStage ? 'Edit Stage' : 'Add Stage'}>
                <Form totalLength={totalStageLength} isCancel={() => cancelHandler(false)} title={selectedStage ? 'Edit Stage' : 'Add Stage'} selectedStage={selectedStage} trigger={trigger} isSaved={(data, show, updated) => isSavedData(data, show, updated)} />
            </Modal>
        </>
    );
}

export default StageMasterList;