import React, { useEffect, useState } from 'react'
import { CirclePicker } from 'react-color';

import { colorsList as colors } from '../../Common';
import bidShushi from '../../Services/Api/Api';
import BidSetup from '../BidSetup';
import { Skeleton, notification } from 'antd';

const Form = ({ title, selectedStage, isSaved, isCancel,totalLength }) => {
  const [colorsList, setColorsList] = useState([]);
  const [allColors,setAllColors]= useState([]);
  const [api, contextHolder] = notification.useNotification();
  const [stageName, setStageName] = useState('');
  const [overhead, setOverhead] = useState(null);
  const [stageColor, setStageColor] = useState();
  const [loading,setLoading] = useState(false);

  const [error, setError] = useState({
    stageName: false,
    overhead: false,
  });


  useEffect(() => {
    setLoading(true);
    bidShushi.colorsList()
    .then((res)=>{
      setAllColors(res.filter(a=>a.name!=null));
      setColorsList(res.filter((a,i)=>a.name!=null && i <= 9));
      setLoading(false);
    }).catch(err=>{
      console.log(err)
    })
 
  }, [])

  useEffect(() => {
    if (selectedStage) {
      console.log(selectedStage && selectedStage.color?.name);
      setStageName(selectedStage && selectedStage.name);
      setOverhead(selectedStage && selectedStage.overhead);
      setStageColor(selectedStage && selectedStage?.color?.name);
    }
         showLessColor();
  }, [selectedStage])

  const showLessColor = () => {
    let updated = colorsList.filter((a, i) => i <= 9)
    setColorsList(updated)
  }

  const showMoreColor = () => {
  //  let updated = [...colors];
    setColorsList(allColors)
  }

  const onChangeHandler = (e) => {
    let name = e.target.name;
    let value = e.target.value.trimStart();
    if (name === "stageName") {
      setStageName(value);
      if (value.length > 255 || value.length == 0) {
        setError((preState) => {
          return {
            ...preState,
            stageName: true,
          };
        });
      } else {
        setError((preState) => {
          return {
            ...preState,
            stageName: false,
          };
        });
      }
    } else if (name === 'overhead') {
      setOverhead(value);
      if (parseInt(value) < 101 || parseInt(value > 1)) {
        setError((preState) => {
          return {
            ...preState,
            overhead: value ? false : true,
          };
        });
      } else {
        setError((preState) => {
          return {
            ...preState,
            overhead: true,
          };
        });
      }
    }
  };

  const handleColorChange = (color) => {
    // create a copy of the stage array
    console.log(color);
    setStageColor(color?.hex)
    //  toggleColorPickerMenu(index);
  };


  const submitHandler = () => {
    if (overhead < 0 || overhead > 100){
      checkForError();
      return;
    }
    if (stageName && overhead && Object.values(error).every(value => value === false)) {
       setLoading(true)
      if (selectedStage) {

        let data = {
          "name": stageName,
          "overhead": overhead,
          "colorId": stageColor ?  allColors.find(a=>a.name.toUpperCase()==stageColor.toUpperCase())?.id : allColors.find(a=>a.name.toLowerCase()=='#f16667')?.id,
        }
        bidShushi.updateStage(data, selectedStage.id)
          .then((res) => {
            clearState();
            isSaved(res, false,data);
          setLoading(false)
          }).catch((err) => {
            console.log(err)
          })
      } else {
        let data = {
          "name": stageName,
          "overhead": overhead,
          "colorId": stageColor? allColors.find(a=>a.name?.toUpperCase()==stageColor.toUpperCase())?.id:allColors.find(a=>a.name.toLowerCase()=='#f16667')?.id,
          "createdBy": "SYSTEM",
          "updatedBy": "SYSTEM",
          "sortOrder":totalLength+1
        }
        bidShushi.createStage(data)
          .then((res) => {
            console.log(res);
            clearState();
            isSaved(res, false,null);
          setLoading(false)
          }).catch((err) => {
            console.log(err)
          })
      }
    } else {
      checkForError()
    }

  }

  const checkForError = () => {
    if (!stageName) {
      setError((preState) => {
        return {
          ...preState,
          stageName: true,
        };
      });
    }
    if (!overhead) {
      setError((preState) => {
        return {
          ...preState,
          overhead: true,
        };
      });
    }
    if (overhead > 100){
      setError((preState) => {
        return {
          ...preState,
          overhead: true,
        };
      });
    }
    if (overhead < 0){
      setError((preState) => {
        return {
          ...preState,
          overhead: true,
        };
      });
    }
  }

  const clearState = () => {
    setStageColor('');
    setStageName('');
    setOverhead(null);
    showLessColor();
    setError((preState) => {
      return {
        ...preState,
        stageName: false,
        overhead: false,
      };
    });
  }

  const cancelHandler = () => {
    clearState();
    isCancel();
  }

  return (
    <div>
      {contextHolder}
      <div className="form-wrapper row add-stage">
        <div className="col-12 form-group">
          <label>Name of Stage</label>
          <input onChange={(e) => {
            setStageName(e.target.value);
            setError((preState) => {
              return {
                ...preState,
                stageName: false,
              };
            });
          }

          } onBlur={(e) => onChangeHandler(e)} name="stageName" value={stageName}
            type="text" className="form-control" placeholder="Enter Stage Title" />
          {
            !stageName && error.stageName ? (
              <span className="text-danger text-error">Stage Name cannot be empty.</span>
            ) : null}
          {stageName && error.stageName ? (
            <span className="text-danger text-error">Stage Name cannot be greater than 255 characters.</span>
          ) : null}


        </div>
        <div className="col-4 form-group">
          <label>Overhead %</label>
          <input name="Overhead" value={overhead?overhead:''}
            type="number"
             onChange={(e) => {
              const regex = /^[0-9\b]+$/; // regular expression to allow only numbers and backspace
              const inputValue = e.target.value;
              if (inputValue === '' || regex.test(inputValue)) {
                setOverhead(inputValue);
              }
              setError((preState) => {
                return {
                  ...preState,
                  overhead: false,
                };
              });
            }} onBlur={(e) => onChangeHandler(e)} className="form-control" placeholder="Enter Overhead" />
          {
            !overhead && error.overhead ? (
              <span className="text-danger text-error">Stage Overhead % cannot be empty.</span>
            ) : null}
          {overhead && error.overhead && parseInt(overhead) > 100 ? (
            <span className="text-danger text-error">Stage Overhead % must be less than or equal to 100.</span>
          ) : null}
          {overhead && error.overhead && parseInt(overhead) < 0 ? (
            <span className="text-danger text-error">Stage Overhead % must be greater than or equal to 0.</span>
          ) : null}
        </div>
        {
          loading? <Skeleton avatar loading={loading}/>: <div className='col-12 form-group modal-color-picker'>
          <label className="mb-3">Select Colours (for legend in Bid Plan)</label>
          <CirclePicker color={stageColor&&stageColor} className={colorsList.find(a=>a?.name===stageColor)?`s-${stageColor&&stageColor.slice(1)}`:""}  colors={colorsList.map(a=>a.name)} onChange={(color) => handleColorChange(color)} />
          {
            colorsList.length > 19 ? <a className='view-link float-end me-3 mt-3' onClick={showLessColor}>View less</a>
              : <a className='view-link float-end me-3 mt-3' onClick={showMoreColor}>View more</a>
          }


        </div>
        }
       
        <div className="col-12 text-end mt-3">
          <button type='button' onClick={cancelHandler} className='btn btn-bordered-black me-3'>
            Cancel
          </button>

          <button disabled={loading} className='btn btn-primary px-4' onClick={submitHandler}>
            Save Stage
          </button>
        </div>


      </div>
    </div>
  )
}

export default Form