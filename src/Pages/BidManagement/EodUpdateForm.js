import React, { useEffect, useState } from 'react'

import { DEFAULT_FLAG_LEVEL, DEFAULT_FLAG_STATUS } from '../../Common';
import bidShushi from '../../Services/Api/Api';
import BidSetup from '../BidSetup';
import { notification, Select } from 'antd';
import moment from "moment";
import { useAuthContext } from '../../hooks/useAuthContext';

const EodUpdateForm = ({ bidDetail, title, selectedEod, selectedDate, isSaved, isCancel }) => {

  // console.log(selectedDate);
  const { user } = useAuthContext();

  const [api, contextHolder] = notification.useNotification();
  const [messageText, setMessageText] = useState('');
  const [messageDate, setMessageDate] = useState(selectedDate);
  const [isSend,setIsSend]= useState(false);

  const [error, setError] = useState({
    messageText: false,
  });


  useEffect(() => {
    if (selectedEod) {
      setMessageText(selectedEod && selectedEod?.messageText);
      setMessageDate(selectedEod && selectedEod?.messageDate);
    }
  }, [selectedEod])

  const onChangeHandler = (e) => {
    let name = e.target.name;
    let value = e.target.value.trimStart();
    if (name === "messageText") {
      setMessageText(value);
      if (value.length < 1000 && value.length > 2) {
        setError((preState) => {
          return {
            ...preState,
            messageText: value ? false : true,
          };
        });
      } else {
        setError((preState) => {
          return {
            ...preState,
            messageText: true,
          };
        });
      }
    }
  };

  const submitHandler = () => {
    if (messageText && Object.values(error).every(value => value === false)) {
      const myDate = new Date(messageDate)
      const year = myDate.getFullYear();
      const month = ('0' + (myDate.getMonth() + 1)).slice(-2);
      const day = ('0' + myDate.getDate()).slice(-2);
      const simpleDateString = `${year}-${month}-${day}`;
      setIsSend(true)
      if (selectedEod) {
        let data = {
          "messageText": messageText,
          "messageDate": simpleDateString,
          "bidId": bidDetail.id,
          "createdByUserId": user.id,
          "createdByUserFullName": user.fullName,
          "createdBy": "SYSTEM",
          "updatedBy": "SYSTEM",
        }
        bidShushi.updateEodUpdate(data, selectedEod.id)
          .then((res) => {
            clearState();
            setIsSend(false)
            isSaved(res, false, data);
          }).catch((err) => {
            console.log(err)
          })
      } else {
        let data = {
          "messageText": messageText,
          "messageDate": simpleDateString,
          "bidId": bidDetail.id,
          "createdByUserId": user.id,
          "createdByUserFullName": user.fullName,
          "createdBy": "SYSTEM",
          "updatedBy": "SYSTEM",
        }
        bidShushi.createEodUpdate(data)
          .then((res) => {
            setIsSend(false)
            clearState();
            isSaved(res, false, null);
          }).catch((err) => {
            console.log(err)
          })
      }
    } else {
      checkForError()
    }

  }

  const checkForError = () => {
    if (!messageText) {
      setError((preState) => {
        return {
          ...preState,
          messageText: true,
        };
      });
    }
  }

  const clearState = () => {
    setMessageText('');
    setError((preState) => {
      return {
        ...preState,
        messageText: false,
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
      <div className="form-wrapper row eod-edit-note-modal">
        <div className="col-12 form-group">
          <label>Date</label><br></br>
          <span className='date'>{selectedDate.format(`dddd, MMMM DD, YYYY`)}</span>
        </div>
        <div className="col-12 form-group">
          <label>Description</label>
          <textarea  onChange={(e) => {
            setMessageText(e.target.value);
            setError((preState) => {
              return {
                ...preState,
                messageText: false,
              };
            });
          }

          } onBlur={(e) => onChangeHandler(e)} name="messageText" value={messageText}
            type="textbox" className="form-control" placeholder="Enter comment" rows={5} />
          {
            !messageText && error.messageText ? (
              <span className="text-danger text-error">Description cannot be empty.</span>
            ) : null}
          {messageText && error.messageText ? (
            <span className="text-danger text-error">Description cannot be less than 3 characters and more than 1000 characters.</span>
          ) : null}
          
        </div>
        <div className="col-12 text-end mt-3">
          <button type='button' onClick={cancelHandler} className='btn btn-bordered-black me-3'>
            Cancel
          </button>

          <button disabled={isSend} className='btn btn-primary px-4' onClick={submitHandler}>
            Save
          </button>
        </div>
      </div>
    </div>
  )

}

export default EodUpdateForm