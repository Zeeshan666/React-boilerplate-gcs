import React, { useState, useEffect } from "react";
import moment from "moment";
import { Modal, DatePicker, notification, Skeleton, Tooltip } from "antd";
import dayjs from "dayjs";
import InfiniteScroll from "react-infinite-scroll-component";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { BACKEND_DATE_FORMAT, FRONTEND_DATE_FORMAT } from "../../Common";
import bidShushiText from "../../Common/Constant";
import bidShushi from "../../Services/Api/Api";
dayjs.extend(customParseFormat);

const Public = ({ tab }) => {
  const [api, contextHolder] = notification.useNotification();
  const [Holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalHolidays, setTotalHolidays] = useState(null);
  const [startDate, setStartDate] = useState(
    moment().format(FRONTEND_DATE_FORMAT)
  );
  const [endDate, setEndDate] = useState(
    moment().add(1, "days").format(FRONTEND_DATE_FORMAT)
  );
  const [page, setPage] = useState(0);
  const [description, setDescription] = useState(null);
  const [error, setError] = useState({
    startDate: false,
    endDate: false,
    description: false,
  });

  const [isDataSending,setIsDataSending]= useState(false);
  const [sortColumn, setSortColumn] = useState('Date');
  const [sortDirection, setSortDirection] = useState('asc');
  
  useEffect(() => {
    setLoading(true);
    setTotalHolidays([]);
    fetchMoreData(true, sortColumn, sortDirection);
  }, [sortColumn, sortDirection]);

  const fetchMoreData = (p=false,sortColumnBy = sortColumn,  sortBy = sortDirection) => {
    setIsLoadingData(true);
    if (p) {
      setPage(0)
      setHolidays([])
      setLoading(true);
    }
    bidShushi
      .getCalendar(p?0:page, 25,1, sortColumnBy, sortBy)
      .then((res) => {
      //  console.log(res);
        setLoading(false);
        // setIsLoadingData(false)
        if (res && res.data) {
          let modifiesDates =
            res.data &&
            res.data
              .filter((a) => a.calendarTypeId === 1)
              .map((h) => {
                return {
                  formatedStartDate: moment(h.startDate).format(
                    "ddd, MMM D, YYYY"
                  ),
                  sameDate: moment(h.startDate).isSame(h.endDate)
                    ? true
                    : false,
                  formatedEndDate: h.endDate
                    ? moment(h.endDate).format("ddd, MMM D, YYYY")
                    : null,
                  ...h,
                };
              });
          setTotalHolidays(res.totalItems);

          setHolidays((preState) => {
            return [...preState, ...modifiesDates];
          });
          setPage((p) => p + 1);
        }
        setIsLoadingData(false);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };
  const deleteHoliday = () => {
    //Api needed
    bidShushi
      .deleteCalendar(selectedHoliday.id)
      .then((res) => {
        let updatedData = Holidays.filter((a) => a.id !== selectedHoliday.id);
        setHolidays(updatedData);
        clearSelectedHoliday();
        api.success({
          message: `Success`,
          description: "Public Holiday has been deleted.",
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const clearSelectedHoliday = () => {
    setSelectedHoliday(null);
    setShowDelete(false);
    setShowHolidayForm(false);
    setDescription(null);
    setError((preState) => {
      return {
        ...preState,
        startDate: false,
        endDate: false,
        description: false,
      };
    });
  };

  const holidayToDelete = (holiday) => {
    setSelectedHoliday(holiday);
    setShowDelete(true);
  };

  const holidayToEdit = (holiday) => {
   // console.log(holiday);
    setSelectedHoliday(holiday);
    setShowHolidayForm(true);
    setStartDate(
      moment(holiday.startDate, BACKEND_DATE_FORMAT).format(
        FRONTEND_DATE_FORMAT
      )
    );
    if (holiday.endDate) {
      setEndDate(
        moment(holiday.endDate, BACKEND_DATE_FORMAT).format(
          FRONTEND_DATE_FORMAT
        )
      );
    } else {
      setEndDate(null);
    }
    setDescription(holiday && holiday.description);
  };

  const checkForError = () => {
    if (!startDate) {
      setError((preState) => {
        return {
          ...preState,
          startDate: true,
        };
      });
    }
    if (!endDate) {
      setError((preState) => {
        return {
          ...preState,
          endDate: true,
        };
      });
    }
    if (!description) {
      setError((preState) => {
        return {
          ...preState,
          description: true,
        };
      });
    }
  };
  const showForm = () => {
    setDescription(null);
    setStartDate("");
    setEndDate("");
    setShowHolidayForm(true);
  };

  const disabledDate = (current) => {
    return current && current < moment(startDate, "DD-MM-YYYY");
  };

  const disabledDateStart = (current) => {
    return current && current > moment(endDate, "DD-MM-YYYY");
  };

  const onChangeStartDate = (date, dateString) => {
    if (dateString) {
      //  setCanShowDialogLeavingPage(true);
      setStartDate(dateString);
      if(!endDate){
        setEndDate(dateString);
      }
      setError((preState) => {
        return {
          ...preState,
          startDate: false,
        };
      });
    } else {
      setStartDate("");
      setError((preState) => {
        return {
          ...preState,
          startDate: true,
        };
      });
    }
  };

  const onChangeEndDate = (date, dateString) => {
    if (dateString) {
      setEndDate(dateString);
      setError((preState) => {
        return {
          ...preState,
          endDate: false,
        };
      });
    } else {
      setEndDate("");
    }
  };

  const saveHoliday = () => {
    //Api required
   
    if (startDate && endDate && description && error.description == false) {
      setIsDataSending(true)
      if (selectedHoliday) {
        let index = Holidays.findIndex((h) => h.id === selectedHoliday.id);
        const updatedData = [...Holidays];
        updatedData[index] = {
          ...updatedData[index],
          startDate: moment(startDate, FRONTEND_DATE_FORMAT).format(
            BACKEND_DATE_FORMAT
          ),
          formatedStartDate: moment(startDate, FRONTEND_DATE_FORMAT).format(
            "ddd, MMM D, YYYY"
          ),
          endDate: endDate
            ? moment(endDate, FRONTEND_DATE_FORMAT).format(BACKEND_DATE_FORMAT)
            : null,
          formatedEndDate: endDate
            ? moment(endDate, FRONTEND_DATE_FORMAT).format("ddd, MMM D, YYYY")
            : null,
          
          sameDate: startDate===endDate ? true : false,
          description: description,
          calendarTypeId: 1,
        };
       // console.log(moment(startDate,BACKEND_DATE_FORMAT).isSame(endDate,BACKEND_DATE_FORMAT) ? true : false)
        bidShushi
          .updateCalendar(updatedData[index], selectedHoliday.id)
          .then((res) => {
            setIsDataSending(false)
            //console.log(res);
            api.success({
              message:"Success",
              description: bidShushiText.publicHolidayUpdated,
            });
            setHolidays(updatedData);
            setSelectedHoliday(null);
            setShowHolidayForm(false);
          })
          .catch((err) => {
            setIsDataSending(false)
            api.error({
              message:"failed",
              description: bidShushiText.calendarEntryExist,
            });
          });
      } else {
        const newHoliday = {
          startDate: moment(startDate, FRONTEND_DATE_FORMAT).format(
            BACKEND_DATE_FORMAT
          ),
          formatedStartDate: moment(startDate, FRONTEND_DATE_FORMAT).format(
            "ddd, MMM D, YYYY"
          ),
          endDate: endDate
            ? moment(endDate, FRONTEND_DATE_FORMAT).format(BACKEND_DATE_FORMAT)
            : null,
          formatedEndDate: endDate
            ? moment(endDate, FRONTEND_DATE_FORMAT).format("ddd, MMM D, YYYY")
            : null,
          sameDate:
            endDate &&
            moment(startDate, FRONTEND_DATE_FORMAT).isSame(
              moment(endDate, FRONTEND_DATE_FORMAT)
            )
              ? true
              : false,
          description: description,
          calendarTypeId: 1,
        };
        bidShushi
          .createCalendar(newHoliday)
          .then((res) => {
            setIsDataSending(false)
           // newHoliday.id = res.id;
            setHolidays([]);
            setPage(0)
            fetchMoreData(true)
          //  const updatedData = [...Holidays, newHoliday];
            //setHolidays(updatedData);
            api.success({
              message: `Success`,
              description: bidShushiText.publicHolidayAdded,
            });
            setShowHolidayForm(false);
          })
          .catch((err) => {
            setIsDataSending(false)
            api.error({
              message: `Failed`,
              description:bidShushiText.calendarEntryExist,
            });
          });
      }
    } else {
      checkForError();
    }
  };

  const onChangeHandler = (e) => {
    let name = e.target.name;
    let value = e.target.value.trimStart();
    if (name === "description") {
      setDescription(value);
      if (value.length < 255 && value.length > 2) {
        setError((preState) => {
          return {
            ...preState,
            description: value ? false : true,
          };
        });
      } else {
        setError((preState) => {
          return {
            ...preState,
            description: true,
          };
        });
      }
    }
  };

  const sortingFunction = (column) => {
    if (sortColumn === column) {
      // Reverse the sort direction if the same column is clicked again
      setSortDirection(sortDirection === 'asc'?  'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  return (
    <div>
      {contextHolder}
      <Modal
        title={bidShushiText.confirmation}
        open={showDelete}
        onOk={deleteHoliday}
        onCancel={clearSelectedHoliday}
        okText={bidShushiText.Yes}
        cancelText={bidShushiText.No}
      >
        <p className="confirmation-text">
          {bidShushiText.deletingPublicHoliday}{" "}
        </p>
      </Modal>
      <Modal
        destroyOnClose
        title={!selectedHoliday ? "Add Holidays" : "Edit Holidays"}
        open={showHolidayForm}
        onOk={saveHoliday}
        onCancel={clearSelectedHoliday}
        okText={"Save Holiday"}
        okButtonProps={{disabled:isDataSending?true:false}}

      >
        <p className="color-gray mark-holiday">
          Mark holidays for your business{" "}
        </p>
        <div className="row form-wrapper">
          <div className="col-6 form-group">
            <label>Holiday From</label>
            <DatePicker
              className="form-control"
              value={startDate ? dayjs(startDate, FRONTEND_DATE_FORMAT) : ""}
              format={FRONTEND_DATE_FORMAT}
              onChange={onChangeStartDate}
              allowClear={true}
              disabledDate={disabledDateStart}
              // onBlur={(e) => onChangeHandler(e)}
            />
            {!startDate && error.startDate ? (
              <span className="text-danger text-error">
                Start Date is required.
              </span>
            ) : null}
          </div>
          <div className="col-6 form-group">
            <label>Holiday To</label>
            <DatePicker
              className="form-control"
              value={endDate ? dayjs(endDate, FRONTEND_DATE_FORMAT) : ""}
              format={FRONTEND_DATE_FORMAT}
              onChange={onChangeEndDate}
              allowClear={true}
              // onBlur={(e) => onChangeHandler(e)}
              disabledDate={disabledDate}
            />
            {!endDate && error.endDate ? (
              <span className="text-danger text-error">
                End Date is required.
              </span>
            ) : null}
          </div>
        </div>
        <div className="row form-wrapper">
          <div className="col-md-12 form-group">
            <label>Holiday Description</label>
            <textarea
              className="d-block w-100 text-area"
              value={description || ""}
              onChange={(e) => {
                setDescription(e.target.value);
                setError((preState) => {
                  return {
                    ...preState,
                    description: false,
                  };
                });
              }}
              onBlur={(e) => onChangeHandler(e)}
              rows={5}
              placeholder="Enter Comment"
              resize="false"
              name="description"
            ></textarea>
            {description && error.description ? (
              <span className="text-danger text-error">
                Description must be greater than 2 characters and less than 255 characters
              </span>
            ) : null}
            {!description && error.description ? (
              <span className="text-danger text-error">
                Description cannot be empty.
              </span>
            ) : null}
          </div>
        </div>
      </Modal>
      <div className="tab-content">
        <div className="user-list">
          {!loading ? (
            <>
              <div
                className={
                  tab === "public"
                    ? "row form-wrapper top-section publice"
                    : "row form-wrapper top-section"
                }
              >
                <div className="public-holiday">
                  <p
                    className="mark-holiday m-0"
                    style={{ color: "#6a6a6a", fontSize: "18px" }}
                  >
                    Mark holidays for your business
                  </p>
                  <div className={"col-2 form-group float-right m-0"}>
                    <button className="btn btn-success" onClick={showForm}>
                      <i
                        className={
                          "fa fa-plus-square-o me-2 font-18 align-middle "
                        }
                      ></i>{" "}
                      Add Holiday
                    </button>
                  </div>
                </div>
                <hr class="line"/>
              </div>

              {Holidays && Holidays.length == 0 && !loading  && (
                <div class="row m-0">
                  <div class="no-data bg-gray border-rounded">
                    <i className="fa fa-calendar no-holiday"></i>
                    <h3>
                      You have not added any Public Holidays yet.
                      <br />
                    </h3>
                  </div>
                </div>
              )}
              <InfiniteScroll
                dataLength={Holidays.length}
                next={fetchMoreData}
                hasMore={Holidays.length === totalHolidays ? false : true}
                loader={
                  <p>
                    <Skeleton loading={isLoadingData} />
                  </p>
                }
              >
                <table class="table">
                  {Holidays && Holidays.length > 0 && (
                    <thead>
                      <tr>
                      <th onClick={()=>sortingFunction('Description')} className={sortColumn==='Description'&&sortDirection==="asc"?"asc-active sorting-th":sortColumn==='Description'&&sortDirection==="desc"?"desc-active sorting-th":"sorting-th"} scope="col" width="320">Holiday
                    <i className="fa fa-caret-up ms-2"></i>
                  
                    </th>
                    <th onClick={()=>sortingFunction('Date')} className={sortColumn==='Date'&&sortDirection==="asc"?"asc-active sorting-th":sortColumn==='Date'&&sortDirection==="desc"?"desc-active sorting-th":"sorting-th"} scope="col">Date
                    <i className="fa fa-caret-up ms-2"></i>
                    </th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                  )}
                  <tbody>
                  {Holidays &&
                    Holidays.map((holiday, index) => {
                      return (
                        <>
                          <tr>
                            <td scope="row">
                              <div class="user-full-name">
                                <img
                                  class="header-profile-user img-fluid"
                                  src="/images/calendar-icon.png"
                                  alt="Header Avatar"
                                />
                                 <Tooltip  color="#fff" title={holiday?.description}>
                                   <>
                                 <span class="public-name ms-2">
                                  {holiday?.description || "N/A"}
                                </span>
                                     </>
                        </Tooltip>
                             
                              </div>
                            </td>
                            <td>
                              {holiday?.formatedStartDate}{" "}
                              {!holiday.sameDate &&
                                holiday?.formatedEndDate &&
                                "-"}{" "}
                              {!holiday.sameDate && holiday?.formatedEndDate}
                            </td>
                            <td>
                              <div className="action-btn">
                                <Tooltip title="Edit" color="#fff">
                                  <a onClick={() => holidayToEdit(holiday)}>
                                    <svg
                                      class="pencil"
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
                                        class="cls-1"
                                        d="M4497,624a21.77952,21.77952,0,0,0,15-15v15Z"
                                        transform="translate(-4128 -240)"
                                      />
                                      <path
                                        class="cls-1"
                                        d="M4128,609a21.65194,21.65194,0,0,0,15,15h-15Z"
                                        transform="translate(-4128 -240)"
                                      />
                                    </svg>
                                  </a>
                                </Tooltip>

                                <Tooltip title="Delete" color="#fff">
                                  <a onClick={() => holidayToDelete(holiday)}>
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
                                  </a>
                                </Tooltip>
                              </div>
                            </td>
                          </tr>
                        </>
                      );
                    })}
                </tbody>
                </table>
              </InfiniteScroll>
            </>
          ) : (
            <Skeleton active avatar />
          )}
        </div>
      </div>
    </div>
  );
};

export default Public;
