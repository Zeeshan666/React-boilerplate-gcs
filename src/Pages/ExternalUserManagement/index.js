import { Tooltip, Typography, notification } from "antd";
import { React, useState, useEffect } from "react";
import { Switch, Button, Skeleton, Modal } from "antd";
import bidShushi from '../../Services/Api/Api';
import { Link, useNavigate } from "react-router-dom";
import Form from "./Form";
import RoutesConstant from "../../Routes/Constant";
import InfiniteScroll from "react-infinite-scroll-component";
import BIDSUSHI_TEXT from "../../Common/Constant";

const ExternalUserList = () => {
  const navigate = useNavigate();
  const [externalUsers, setExternalUsers] = useState([]);
  const [isLoading, setIsloading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [externalUserToRemove, setExternalUserToRemove] = useState('');
  const [pageNumber, setPageNumeber] = useState(0);
  const [totalUserLength, setTotalUserLength] = useState('');
  const [api, contextHolder] = notification.useNotification();
  const [dataLoading, setDataLoading] = useState(false);
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isUserExist,setIsUserExist] = useState(false);
  useEffect(() => {
    setIsloading(true);
    fetchMoreData(true, sortColumn, sortDirection)
  }, [sortColumn, sortDirection])


  const fetchMoreData = (start = false, sortColumnBy = sortColumn,  sortBy = sortDirection) => {
    setDataLoading(true);
    if (start) {
      setPageNumeber(0)
      setExternalUsers([])
      setIsloading(true);
    }
    let size;
    bidShushi.getAllExternalUsers(start ? 0 : pageNumber, size = 25, sortColumnBy, sortBy).then((res) => {
        console.log(res)
        setIsloading(false);
        setTotalUserLength(res.totalItems);
        setPageNumeber(preState => preState + 1); // bcz page starts from 0
        setExternalUsers((preState) => {
            return [...preState, ...res.data]
        })
        setDataLoading(false);
    }).catch(err => console.log(err))

};

  const showModal = (u) => {
 //   setIsModalOpen(true);
    setExternalUserToRemove(u);
    bidShushi.isUserExistInBids(u?.id)
    .then(res=>{
      console.log(res)
        if(!res){
          setIsModalOpen(true);
        }else{
          setIsUserExist(true);
        }  
    }).catch(err=>{
      console.log(err)
    })
  };

  const handleOk = () => {
      bidShushi.deleteUser(externalUserToRemove?.id)
      .then(() => {
          let updatedUsers = externalUsers.filter(s => s.id !== externalUserToRemove.id)
        //  setExternalUsers(updatedUsers);
        setIsloading(true);
        fetchMoreData(true, sortColumn, sortDirection)
          api.success({
              message: `Success`,
              description: BIDSUSHI_TEXT.externalUserDeleted,
              placement: 'topRight'
          })
          setIsModalOpen(false);  
          setIsUserExist(false);
      }).catch(err=>{
         console.log(err);
         setIsModalOpen(false);
         setIsUserExist(false);
      })
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsUserExist(false);
  };

  const sortingFunction = (column) => {
    if (sortColumn === column) {
      // Reverse the sort direction if the same column is clicked again
      setSortDirection(sortDirection === 'asc' ?  'desc' : sortDirection==="desc"? " ":  'asc');
    } 
    else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setPageNumeber(0)
  };


  return (
    <>
      <div className="user-list">
        {contextHolder}
        <div className="form-wrapper top-section">
          <h4 className="page-sub-title">External User List</h4>
          <Link className="btn btn-success" to={RoutesConstant.externalUserForm}>
            <i className="fa fa-plus-square-o me-2 font-18 align-middle"></i>
              Add External User
          </Link>
        </div> {
          externalUsers && externalUsers.length == 0 && !isLoading ?
            (<div className="row m-0">
              <div className="no-data bg-gray border-rounded">
                <img src="/images/user-thumb.png" alt="" />
                <h3>
                  There are no External Users in the system
                </h3>
              </div>
            </div>) :
            <Skeleton loading={isLoading} avatar active>
                              <InfiniteScroll
                                    dataLength={externalUsers.length}
                                    next={fetchMoreData}
                                    hasMore={externalUsers.length === totalUserLength ? false : true}
                                    loader={<p><Skeleton loading={isLoading} /></p>}

                                >
              <table class="table">
                <thead>
                  <tr>
                         <th scope="col" width="280" onClick={()=>sortingFunction('fullName')} className={sortColumn==='fullName'&&sortDirection==="asc"?"asc-active sorting-th":sortColumn==='fullName'&&sortDirection==="desc"?"desc-active sorting-th":"sorting-th"} scope="col">Full Name
                    <i className="fa fa-caret-up ms-2"></i>
                    </th>
                    <th scope="col" width="250" onClick={()=>sortingFunction('Email')} 
                    className={sortColumn==='Email'&&sortDirection==="asc"?"asc-active sorting-th":sortColumn==='Email'&&sortDirection==="desc"?"desc-active sorting-th":"sorting-th"}>
                    
                      Email Address <i className="fa fa-caret-up ms-2"></i></th>
                    <th scope="col" width="170">Contact Number</th>
                    <th scope="col"   className={sortColumn==='organization'&&sortDirection==="asc"?"asc-active sorting-th":sortColumn==='organization'&&sortDirection==="desc"?"desc-active sorting-th":"sorting-th"} onClick={()=>sortingFunction('organization')} width="400">
                    
                      Organization <i className="fa fa-caret-up ms-2"></i></th>
                      <th scope="col"  onClick={()=>sortingFunction('userSkill')} className={sortColumn==='userSkill'&&sortDirection==="asc"?"asc-active sorting-th":sortColumn==='userSkill'&&sortDirection==="desc"?"desc-active sorting-th":"sorting-th"}  width="170">Skill
                      <i className="fa fa-caret-up ms-2"></i>
                      </th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>

                  {
                    externalUsers && externalUsers.map((u, i) => {
                      return <tr>
                        <td scope="row" className="wrapword">
                          <div class="user-full-name">
                            <img
                              class="header-profile-user img-fluid"
                              src="/images/user-circle.png"
                              alt="Header Avatar"
                            />
                            <span class="d-inline-block ms-2">{u?.fullName}</span>
                          </div>
                        </td>
                        <td className="wrapword">
                          <span className="color-primary email">
                            {u?.email}
                          </span>
                        </td>
                        <td>{ u.contact ? u.contact : 'N/A'}</td>
                        <td>{u.organization ? u.organization : 'N/A'}</td>
                        <td>{u.userSkill?.name || "N/A"}</td>
                        <td>
                          {!u.isDeleted&& <div className="action-btn">
                            <Link to={RoutesConstant.externalUserFormEdit.replace(':externalUserId', u?.id)}>
                              <Tooltip  placement="top" color="#fff" title="Edit">
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
                           
                            </Link>
                             <a onClick={() => { showModal(u) }}>
                              <Tooltip  placement="top" color="#fff" title="Delete"> 
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
                          }{
                            u.isDeleted&&<span>-</span>
                          }
                        </td>
                      </tr>
                    })

                  }

                </tbody>
              </table>
              </InfiniteScroll>
               {
                dataLoading&&<Skeleton avatar active/>
               }
            </Skeleton>
        }
        <Modal    okText={BIDSUSHI_TEXT.Yes} cancelText={BIDSUSHI_TEXT.No} title={BIDSUSHI_TEXT.confirmation} open={isModalOpen} onOk={() => { handleOk(externalUserToRemove) }} onCancel={handleCancel}>
        <p className="confirmation-text">{BIDSUSHI_TEXT.deletingExternalUser}</p>
      </Modal>
      <Modal  okText={BIDSUSHI_TEXT.Yes} cancelText={BIDSUSHI_TEXT.No} title={BIDSUSHI_TEXT.confirmation} open={isUserExist} onOk={()=>handleOk(externalUserToRemove)} onCancel={handleCancel}>
      
        <p className="confirmation-text color-gray mb-3">This External User is assigned to existing bid(s). If you proceed with the deletion, it cannot be reversed.</p>

<p className="confirmation-text">Are you sure you want to continue?</p> 
        {/* <button  onClick={handleOk}  class="btn btn-primary px-5 ml-0">{BIDSUSHI_TEXT.okText}</button> */}
      </Modal>
      </div>
    </>
  );
}
export default ExternalUserList;
