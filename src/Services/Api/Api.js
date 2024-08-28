import { BASE_URL } from "./Constant";
import request from "../requests";
import { BID_MANAGER_ROLE, EXTERNAL_ROLE } from "../../Common";



function login(data) {
  return request({
    url: `${BASE_URL}/auth/login`,
    method: 'POST',
    data
  })
};

function verifyActivationAccountToken(token, type) {
  return request({
    url: `${BASE_URL}/auth/is-account-activation-token-expired?token=${token}&type=${type}`,
    method: 'GET',
  })
}

function verifyResetPasswordToken(token, type) {
  return request({
    url: `${BASE_URL}/auth/is-password-reset-token-expired?token=${token}&type=${type}`,
    method: 'GET',
  })
}

function getAllActiveUsers(page = 0, size = -1) {
  return request({
    url: `${BASE_URL}/users/getUsers?isActive=true&page=${page}&size=${size}`,
    method: 'GET',
  })
};

function getAppSettings() {
  return request({
    url: `${BASE_URL}/appSettings/getAppSettings`,
    method: 'GET',
  })
};

function getAllUsers(page, size) {
  return request({
    url: `${BASE_URL}/users/getUsers?&page=${page}&size=${size}`,
    method: 'GET',
  })
};

function getAllSystemUsers(page, size, sortColumn = '', sortBy = '') {
  let url = `${BASE_URL}/users/getUsers?&role=SYSTEM_USERS&page=${page}&size=${size}`
  if (sortColumn != '' && sortBy != '') {
    url += `&sortBy=${sortColumn} ${sortBy}`
  }
  return request({
    url: url,
    method: 'GET',
  })
};

function getBidStatuses() {
  return request({
    url: `${BASE_URL}/bidStatuses/getBidStatuses`,
    method: 'GET',
  })
}

function getUserById(id) {
  return request({
    url: `${BASE_URL}/users/getUser/` + id,
    method: 'GET',
  })
}

function getAllBidManagers(page = 0, size = -1) {
  return request({
    url: `${BASE_URL}/users/getUsers?isActive=true&role=${BID_MANAGER_ROLE}&page=${page}&size=${size}`,
    method: 'GET',
  })
};

function getAllExternalUsers(page = 0, size = -1, sortColumn, sortBy) {
  let url = `${BASE_URL}/users/getUsers?isActive=true&role=${EXTERNAL_ROLE}&page=${page}&size=${size}`
  if (sortColumn != '' && sortBy != '') {
    url += `&sortBy=${sortColumn} ${sortBy}`
  }
  return request({
    url: url,
    method: 'GET',
  })
};

function createUser(data) {
  return request({
    url: `${BASE_URL}/users/createUser`,
    method: 'POST',
    data
  })
}

function resendEmailVerification(userId) {
  return request({
    url: `${BASE_URL}/users/resendEmailVerification/${userId}`,
    method: 'GET',
  })
}

function updateUser(userId, data) {
  return request({
    url: `${BASE_URL}/users/updateUser/` + userId,
    method: 'PUT',
    data
  })
}

function updateUserProfile(userId, data) {
  return request({
    url: `${BASE_URL}/users/updateUserProfile/` + userId,
    method: 'PUT',
    data
  })
}

function deleteUser(id) {
  return request({
    url: `${BASE_URL}/users/softDeleteUser/${id}`,
    method: 'GET'
  })
}

function getQuestionPriorities() {
  return request({
    url: `${BASE_URL}/questionPriorities/getQuestionPriorities?isActive=true`,
    method: 'GET',
  })
}

function getQuestionComplexities() {
  return request({
    url: `${BASE_URL}/questionComplexities/getQuestionComplexities?isActive=true`,
    method: 'GET',
  })
}

function getUserRole() {
  return request({
    url: `${BASE_URL}/userRoles/getUserRoles?isActive=true`,
    method: 'GET',
  })
}

function getUserSkill() {
  return request({
    url: `${BASE_URL}/userSkills/getUserSkills?isActive=true`,
    method: 'GET',
  })
}

function getBids(pageNumber, query = '', mybid = '', bidStatus = '') {
  let url = `${BASE_URL}/bids/getBids?page=` + pageNumber + `&size=9`;
  if (query != '') {
    url += `&name=` + query;
  }
  if (mybid != '') {
    url += `&isMyBids=`+true;
  }
  if (bidStatus != '' && bidStatus != '0') {
    url += `&bidStatusId=` + bidStatus;
  }
  return request({
    url: url,
    method: 'GET'
  })
};

function getBid(id) {
  return request({
    url: `${BASE_URL}/bids/getBid/${id}`,
    method: 'GET'
  })
};

function createBid(data) {
  return request({
    url: `${BASE_URL}/bids/createBid`,
    method: 'POST',
    data
  })
};

function deleteQuestion(id) {
  return request({
    url: `${BASE_URL}/bidQuestions/deleteBidQuestion/${id}`,
    method: 'DELETE'
  })
}
function getStages(page = 0, size = -1) {
  return request({
    url: `${BASE_URL}/stages/getStages?isActive=true&page=${page}&size=${size}`,
    method: 'GET'
  })
};

function addQuestion(data) {
  return request({
    url: `${BASE_URL}/bidQuestions/createBidQuestion`,
    method: 'POST',
    data
  })
}

function editQuestion(id, data) {
  return request({
    url: `${BASE_URL}/bidQuestions/updateBidQuestion/` + id,
    method: 'PUT',
    data
  })
}

function updateBid(id, data) {
  return request({
    url: `${BASE_URL}/bids/updateBid/${id}`,
    method: 'PUT',
    data
  })
}

function deleteStage(id) {
  return request({
    url: `${BASE_URL}/stages/deleteStage/${id}`,
    method: 'DELETE'
  })
}

function updateStage(data, id) {
  return request({
    url: `${BASE_URL}/stages/updateStage/${id}`,
    method: 'PUT',
    data
  })
}

function createStage(data) {
  return request({
    url: `${BASE_URL}/stages/createStage`,
    method: 'POST',
    data
  })
}

function testAuth() {
  return request({
    url: `${BASE_URL}/auth/testAuth`,
    method: 'POST',
  })
}


function getRefreshToken(data) {
  return request({
    url: `${BASE_URL}/auth/refresh-tokens`,
    method: 'POST',
    data
  })
}

function logout(data) {
  return request({
    url: `${BASE_URL}/auth/logout`,
    method: 'POST',
    data
  })
}


function forgotPassword(data) {
  return request({
    url: `${BASE_URL}/auth/forgot-password`,
    method: 'POST',
    data
  })
};

function verifyEmail(token) {
  return request({
    url: `${BASE_URL}/auth/verify-email?token=${token}`,
    method: 'POST',
  })
};

function updatePassword(data, token) {
  return request({
    url: `${BASE_URL}/auth/reset-password?token=${token}`,
    method: 'POST',
    data
  })
};

function accountActivation(data, token) {
  return request({
    url: `${BASE_URL}/auth/verify-email?token=${token}`,
    method: 'POST',
    data
  })
};


function sortedStages(data) {
  return request({
    url: `${BASE_URL}/stages/updateStagesSortOrder`,
    method: 'POST',
    data
  })
}


function colorsList() {
  return request({
    url: `${BASE_URL}/colors/getColors?isActive=true`,
  })
}

function getEodUpdates(bidId) {
  return request({
    url: `${BASE_URL}/eodUpdates/getEodUpdates?bidId=${bidId}`,
    method: 'GET',
  })
}

function getFlags(bidId, query = '', page = 0, size = -1, sortColumn = '', sortBy = '') {
  let url = `${BASE_URL}/flags/getFlags?bidId=${bidId}&page=${page}&size=${size}`;
  if (query != '') {
    url = `${BASE_URL}/flags/getFlags?bidId=${bidId}&page=${page}&size=${size}` + query
  }
  if (sortColumn != '' && sortBy != '') {
    url += `&sortBy=${sortColumn} ${sortBy}`
  }
  return request({
    url: url,
    method: 'GET',
  })
}

function getFlagLevels() {
  return request({
    url: `${BASE_URL}/flagLevels/getFlagLevels`,
    method: 'GET',
  })
}

function getFlagStatuses() {
  return request({
    url: `${BASE_URL}/flagStatuses/getFlagStatuses`,
    method: 'GET',
  })
}

function createFlag(data) {
  return request({
    url: `${BASE_URL}/flags/createFlag`,
    method: 'POST',
    data
  })
}

function updateFlag(data, id) {
  return request({
    url: `${BASE_URL}/flags/updateFlag/${id}`,
    method: 'PUT',
    data
  })
}

function deleteFlag(id) {
  return request({
    url: `${BASE_URL}/flags/deleteFlag/${id}`,
    method: 'DELETE'
  })
}

function createEodUpdate(data) {
  return request({
    url: `${BASE_URL}/eodUpdates/createEodUpdate`,
    method: 'POST',
    data
  })
}

function updateEodUpdate(data, id) {
  return request({
    url: `${BASE_URL}/eodUpdates/updateEodUpdate/${id}`,
    method: 'PUT',
    data
  })
}

function deleteEodUpdate(id) {
  return request({
    url: `${BASE_URL}/eodUpdates/deleteEodUpdate/${id}`,
    method: 'DELETE'
  })
}

function getBidQuestion(id, page = 1, size = 3,searchText="") {
  return request({
    url: `${BASE_URL}/bidQuestions/getQuestionsOfBid/${id}?page=${page}&size=${size}&searchText=${searchText}`,
    method: 'GET'
  })
}
function getBidInvalidQuestion(id, page = 0, size = -1,searchText='') {
  return request({
    url: `${BASE_URL}/bidQuestions/getInvalidQuestionsOfBid/${id}?page=${page}&size=${size}&searchText=${searchText}`,
    method: 'GET'
  })
}



function validateEmailToken() {
  //wait for api
  // return request({
  //   url: `${BASE_URL}/eodUpdate/getEodUpdates?bidId=${bidId}`,
  //   method: 'GET',
  // })
}

function removeAvatar(id, imageName) {
  return request({
    url: `${BASE_URL}/users/deleteUserAvatar/${id}/${imageName}`,
    method: 'DELETE'
  })
}


function getBidPlan(id) {
  return request({
    url: `${BASE_URL}/bidPlan/get/${id}`,
    method: 'GET'
  })
}

function generateBid(id) {
  return request({
    url: `${BASE_URL}/bidPlan/generate/${id}`,
    method: 'GET'
  })
}

function bidPlanUpdate(data, id) {
  return request({
    url: `${BASE_URL}/bidPlan/update/${id}`,
    method: 'PUT',
    data
  })
}

function getCalendar(page, size, type = 1, sortColumn, sortBy,userId='') {
  let url = `${BASE_URL}/calendar/getAllCalendar?page=${page}&size=${size}&calendarTypeId=${type}&userId=${userId}`
  //if (sortColumn != '' && sortBy != '') {
    url += `&sortBy=${sortColumn} ${sortBy}`
  //}
  return request({
    url: url,
    method: 'GET',
  })
}
function createCalendar(data) {
  return request({
    url: `${BASE_URL}/calendar/createCalendar`,
    method: 'POST',
    data
  })
}
function updateCalendar(data, id) {
  return request({
    url: `${BASE_URL}/calendar/updateCalendar/${id}`,
    method: 'PUT',
    data
  })
}

function deleteCalendar(id) {
  return request({
    url: `${BASE_URL}/calendar/deleteCalendar/${id}`,
    method: 'DELETE',
  })
}

function getResponseTracker(id = 0, value, page = 0, size = 25) {
  return request({
    url: `${BASE_URL}/bidPlan/getResponseTracker/${id}?searchText=${value}&page=${page}&size=${size}`,
    method: 'GET',
  })
};

function isTeamMemberExist(data, bidId) {
  return request({
    url: `${BASE_URL}/bids/isTeamMemberExistsInQuestions/${bidId}`,
    method: 'POST',
    data
  })
}

function isStageExist(data, bidId) {
  return request({
    url: `${BASE_URL}/bids/isStageExistsInQuestions/${bidId}`,
    method: 'POST',
    data
  })
}

function getDetailOfBid(id) {
  return request({
    url: `${BASE_URL}/bids/getBidDetails/${id}`,
    method: 'GET',
  })
}

function updateResponseTracker(data, id) {
  return request({
    url: `${BASE_URL}/bidPlan/updateResponseTracker/${id}`,
    method: 'PUT',
    data
  })
}

function getStatusOfResponse(id) {
  return request({
    url: `${BASE_URL}/bids/getBidDetails/${id ?? '222'}`,
    method: 'GET',
  })
}

function liveBid(data, id) {
  return request({
    url: `${BASE_URL}/bids/liveBid/${id}`,
    method: 'POST',
    data
  })
}


function closeBid(id) {
  return request({
    url: `${BASE_URL}/bids/closeBid/${id}`,
    method: 'GET',
  })
}

function draftBid(id) {
  return request({
    url: `${BASE_URL}/bids/draftBid/${id}`,
    method: 'GET',
  })
}

function updateBidManager(data, BidId) {
  return request({
    url: `${BASE_URL}/bids/updateBidManager/${BidId}`,
    method: 'POST',
    data
  })
}

function bidStatsDashboard() {
  return request({
    url: `${BASE_URL}/bids/getDashboardStats`,
    method: 'GET',
  })
}


function getShowBid(bid) {
  return request({
    url: `${BASE_URL}/bidPlan/isBidPlanExists/${bid}`,
    method: 'GET',
  })
}

function getBidQuestionWithStats(id, page = 0, size = 3,text='') {
  return request({
    url: `${BASE_URL}/bidQuestions/getQuestionsOfBidWithStats/${id}?page=${page}&size=${size}&searchText=${text}`,
    method: 'GET'
  })
};

function getEodData(bid,date=null) {
  return request({
    url: `${BASE_URL}/eodUpdates/getEodUpdates/?bidId=${bid}&messageDate=${date}`,
    method: 'GET',
  })
};

function getTeamMember(bid){
  return request({
    url: `${BASE_URL}/bids/getBidMembers/${bid}/?roleId[]=1&roleId[]=2&roleId[]=3`,
    method: 'GET',
  })
}


function getQuestionById(qId){
  return request({
    url: `${BASE_URL}/bidQuestions/getBidQuestion/${qId}`,
    method: 'GET',
  })
}

function isUserExistInBids(userID){
  return request({
    url: `${BASE_URL}/users/isUserExistInBids/${userID}`,
    method: 'GET',
  })

}

function checkUserHoliday (id,date){
  return request({
    url: `${BASE_URL}/calendar/isUserLeaveExists/${id}/${date}`,
    method: 'GET',
  })

}
const bidShushi = {
  login,
  createUser,
  resendEmailVerification,
  verifyActivationAccountToken,
  verifyResetPasswordToken,
  updateUser,
  updateUserProfile,
  getAppSettings,
  deleteUser,
  getBidStatuses,
  getAllActiveUsers,
  getAllUsers,
  getAllSystemUsers,
  getUserById,
  getUserRole,
  getUserSkill,
  getAllBidManagers,
  getAllExternalUsers,
  getQuestionComplexities,
  getQuestionPriorities,
  getBids,
  getBid,
  createBid,
  getStages,
  addQuestion,
  editQuestion,
  deleteQuestion,
  updateBid,
  deleteStage,
  createStage,
  updateStage,
  testAuth,
  getRefreshToken,
  logout,
  forgotPassword,
  verifyEmail,
  updatePassword,
  accountActivation,
  sortedStages,
  colorsList,
  getEodUpdates,
  getFlags,
  getFlagLevels,
  getFlagStatuses,
  createFlag,
  updateFlag,
  deleteFlag,
  createEodUpdate,
  updateEodUpdate,
  deleteEodUpdate,
  validateEmailToken,
  removeAvatar,
  getBidQuestion,
  generateBid,
  getBidPlan,
  bidPlanUpdate,
  getCalendar,
  updateCalendar,
  deleteCalendar,
  createCalendar,
  getResponseTracker,
  isTeamMemberExist,
  isStageExist,
  getDetailOfBid,
  getStatusOfResponse,
  updateResponseTracker,
  closeBid,
  liveBid,
  draftBid,
  updateBidManager,
  getBidInvalidQuestion,
  bidStatsDashboard,
  getShowBid,
  getBidQuestionWithStats,
  getEodData,
  getTeamMember,
  getQuestionById,
  isUserExistInBids,
  checkUserHoliday
};

export default bidShushi;
