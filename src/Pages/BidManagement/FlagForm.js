import React, { useEffect, useState } from 'react'

import { DEFAULT_FLAG_LEVEL, DEFAULT_FLAG_STATUS } from '../../Common';
import bidShushi from '../../Services/Api/Api';
import BidSetup from '../BidSetup';
import { notification, Select } from 'antd';
import { useAuthContext } from '../../hooks/useAuthContext';

const FlagForm = ({bidDetail, title, flagStatuses, flagLevels, selectedFlag, isSaved, isCancel }) => {

  const { Option } = Select;
  const {user} = useAuthContext();

  const [api, contextHolder] = notification.useNotification();
  const [issueDetail, setIssueDetail] = useState('');
  const [dateReported, setDateReported] = useState(null);
  const [flagLevel, setFlagLevel] = useState(flagLevels.find(f => f.name == DEFAULT_FLAG_LEVEL)?.id);
  const [flagStatus, setFlagStatus] = useState(flagStatuses.find(f=> f.name == DEFAULT_FLAG_STATUS)?.id);
  const [loading,setLoading] = useState(false);
  const [error, setError] = useState({
    issueDetail: false,
    flagLevel: false,
    flagStatus: false,
  });


  useEffect(() => {
    if (selectedFlag) {
      setIssueDetail(selectedFlag && selectedFlag?.issueDetail);
      setDateReported(selectedFlag && selectedFlag?.dateReported)
      setFlagLevel(selectedFlag && parseInt(selectedFlag?.flagLevelId));
      setFlagStatus(selectedFlag && parseInt(selectedFlag?.flagStatusId));
    }
  }, [selectedFlag])

  const onChangeHandler = (e) => {
    let name = e.target.name;
    let value = e.target.value.trimStart();
    if (name === "issueDetail") {
      setIssueDetail(value);
      if (value.length < 1000 && value.length > 2) {
        setError((preState) => {
          return {
            ...preState,
            issueDetail: value ? false : true,
          };
        });
      } else {
        setError((preState) => {
          return {
            ...preState,
            issueDetail: true,
          };
        });
      }
    }
  };

  const onChangeHandlerSelect = (name, value) => {
    if (name === "flagLevel") {
      setFlagLevel(value);
      if (value == 0) {
        setError((preState) => {
          return {
            ...preState,
            flagLevel: true,
          };
        });
      } else {
        setError((preState) => {
          return {
            ...preState,
            flagLevel: false,
          };
        });
      }
    }
    if (name === "flagStatus") {
      setFlagStatus(value);
      if (value == 0) {
        setError((preState) => {
          return {
            ...preState,
            flagStatus: true,
          };
        });
      } else {
        setError((preState) => {
          return {
            ...preState,
            flagStatus: false,
          };
        });
      }
    }
  };


  const submitHandler = () => {
    if (issueDetail && Object.values(error).every(value => value === false)) {
      setLoading(true);
      if (selectedFlag) {
        let data = {
          "issueDetail": issueDetail,
          "dateReported": dateReported,
          "bidId": bidDetail.id,
         // "createdByUserId": user.id,
         // "createdByUserFullName": user.fullName,
          //"flagOwnerId": bidDetail.bidMembers.find(member => member.userId == user.id)?.id,
          "flagLevelId": flagLevel,
          "flagStatusId": flagStatus,
        //  "createdBy": "SYSTEM",
          //"updatedBy": "SYSTEM",
        }
        bidShushi.updateFlag(data, selectedFlag.id)
          .then((res) => {
            clearState();
            setLoading(false);
            isSaved(res, false, data);
          }).catch((err) => {
            setLoading(false);
            console.log(err)
          })
      } else {
        let data = {
          "issueDetail": issueDetail,
          "dateReported": new Date(),
          "bidId": bidDetail.id,
          "createdByUserId": user.id,
          "createdByUserFullName": user.fullName,
          //"flagOwnerId": bidDetail.bidMembers.find(member => member.userId == user.id)?.id,
          "flagLevelId": flagLevel,
          "flagStatusId": flagStatus,
          "createdBy": "SYSTEM",
          "updatedBy": "SYSTEM",
        }
        bidShushi.createFlag(data)
          .then((res) => {
            console.log(res);
            clearState();
            isSaved(res, false, null);
            setLoading(false);
          }).catch((err) => {
            console.log(err)
            setLoading(false);
          })
      }
      
    } else {
      checkForError()
    }

  }

  const checkForError = () => {
    if (!issueDetail) {
      setError((preState) => {
        return {
          ...preState,
          issueDetail: true,
        };
      });
    }
  }

  const clearState = () => {
    setIssueDetail('');
    setError((preState) => {
      return {
        ...preState,
        issueDetail: false,
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
      <div className="form-wrapper row">
        <div className="col-12 form-group">
          <label>Issue Details</label>
          <textarea
           rows={5}
          onChange={(e) => {
            setIssueDetail(e.target.value);
            setError((preState) => {
              return {
                ...preState,
                issueDetail: false,
              };
            });
          }

          } onBlur={(e) => onChangeHandler(e)} name="issueDetail" value={issueDetail}
            type="textbox" className="form-control" placeholder="Enter Details" />
          {
            !issueDetail && error.issueDetail ? (
              <span className="text-danger text-error">Issue Details cannot be empty.</span>
            ) : null}
          {issueDetail && error.issueDetail ? (
            <span className="text-danger text-error">Issue Details can not be less than 2 and greater than 1000 characters.</span>
          ) : null}


        </div>
        <div className="col-6 form-group">
          <label>Select Level</label>
          <Select
            className="form-select"
            name='flagLevel'
            placeholder="Select Level"
            // optionFilterProp="children"
            onChange={(e) => {
              setFlagLevel(e);
            }}
            notFoundContent="No Flag level found"
            value={flagLevel}
            onBlur={(e) => {
              onChangeHandlerSelect('flagLevel', flagLevel)
            }}
            // filterOption={(input, option) =>
            //   (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            // }
          //defaultValue={complexities.find((option) => option.id == 2)?.id}
          >
            {flagLevels.map(flagLevel => (
              <Option key={flagLevel.id} value={flagLevel.id} label={flagLevel.name}>
                <i className={flagLevel?.name == DEFAULT_FLAG_LEVEL ? "fa fa-circle small align-middle text-amber" : "fa fa-circle small align-middle text-danger"} ></i> {flagLevel.name}
              </Option>
            ))}
          </Select>

        </div>
        {
          selectedFlag && 
          <div className="col-6 form-group">
          <label>Select Status</label>
          <Select
            className="form-select"
            name='flagStaus'
            placeholder="Select Status"
            optionFilterProp="children"
            onChange={(e) => {
              setFlagStatus(e);
            }}
            notFoundContent="No Flag Status found"
            value={flagStatus}
            onBlur={(e) => {
              onChangeHandlerSelect('flagStatus', flagStatus)
            }}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          //defaultValue={complexities.find((option) => option.id == 2)?.id}
          >
            {flagStatuses.map(flagStatus => (
              <Option key={flagStatus.id} value={flagStatus.id} label={flagStatus.name}>
                {flagStatus.name}
              </Option>
            ))}
          </Select>
        </div>
        }
        {
          selectedFlag && <div className="col-12 form-group">
          <label>Created By</label> <br></br>
          <span className='flag-owner-name'>{selectedFlag?.user?.fullName}</span>
        </div>
        }
        <div className="col-12 text-end mt-3">
          <button type='button' onClick={cancelHandler} className='btn btn-bordered-black me-3'>
            Cancel
          </button>

          <button disabled={loading} className='btn btn-primary px-4' onClick={submitHandler}>
             Save
          </button>
        </div>
      </div>
    </div>
  )

}

export default FlagForm