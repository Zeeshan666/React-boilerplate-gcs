import RoutesConstant from "../Routes/Constant";
import pathToRegexp from 'path-to-regexp';
import { BASE_URL } from "../Services/Api/Constant";

// The email address regex
export const USER_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const BID_DRAFT_NAME = 'DRAFT';
export const RESET_PASSWORD_VERIFY = 'RESET_PASSWORD';
export const ACCOUNT_ACTIVATION_VERIFY = 'VERIFY_EMAIL';
export const USER_SPEED_KEY = 'USER_SPEED';
export const WORD_COUNT_PER_PAGE_KEY = 'WORD_COUNT_PER_PAGE';
export const USER_PASSWORD_REGEX = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*)(?=.*[A-Z]).{8,16}$/g;
export const URL_REGEX = /^((http|https):\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
export const colorsList = [
    "#f16667",
    "#FF6633",
    "#FFB399",
    "#FF33FF",
    "#FFFF99",
    "#00B3E6",
    "#E6B333",
    "#3366E6",
    "#999966",
    "#99FF99",
    "#B34D4D",
    "#80B300",
    "#809900",
    "#E6B3B3",
    "#6680B3",
    "#66991A",
    "#FF99E6",
    "#CCFF1A",
    "#FF1A66",
    "#E6331A",
    "#33FFCC",
    "#66994D",
    "#B366CC",
    "#4D8000",
    "#B33300",
    "#CC80CC",
    "#66664D",
    "#991AFF",
    "#E666FF",
    "#4DB3FF",
    "#1AB399",
    "#E666B3",
    "#33991A",
    "#CC9999",
    "#B3B31A",
    "#00E680",
    "#4D8066",
    "#809980",
    "#E6FF80",
    "#1AFF33",
    "#999933",
    "#FF3380",
    "#CCCC00",
    "#66E64D",
    "#4D80CC",
    "#9900B3",
    "#E64D66",
    "#4DB380",
    "#FF4D4D",
    "#99E6E6",
    "#6666FF",
    "#E6C880",
    "#FF99CC",
    "#39E64D",
    "#CC6666",
    "#66994D",
    "#8E44AD",
    "#2C3E50",
    "#3498DB",
    "#F1C40F",
    "#E74C3C",
    "#D35400",
    "#2ECC71",
    "#ECF0F1",
    "#95A5A6",
    "#16A085",
    "#F39C12",
    "#C0392B",
    "#BDC3C7",
    "#7F8C8D",
    "#27AE60",
    "#2980B9",
    "#8E44AD",
    "#34495E",
    "#FFC312",
    "#FF5733",
    "#FFC312",
    "#C70039",
    "#900C3F",
    "#FFC312",
    "#DAF7A6",
    "#FFC312",
    "#FF5733",
    "#581845",
];
export const DEFAULT_QUESTIONS_COLOR = '#f16667';
export const EXTERNAL_TAG_TYPE = 'EXTERNAL';
export const USER_TYPE_ASSIGNEE = 'USER';
export const FRONTEND_DATE_FORMAT = 'DD-MM-YYYY';
export const BACKEND_DATE_FORMAT = 'YYYY-MM-DD';
export const BID_WORD_COUNT_TYPE = 'WORD_COUNT';
export const BID_PAGE_COUNT_TYPE = 'PAGE_COUNT';

export const EXTERNAL_ROLE = 'External';
export const BID_MANAGER_WITH_ADMIN_ROLE = 'Bid Manager Admin';
export const BID_MANAGER_ROLE = 'Bid Manager';
//todo need to fix
export const TEAM_MEMBER_ROLE = 'Team Member';

export const DEFAULT_COMPLEXITY_SELECT = 'Standard'; // In bid question form
export const DEFAULT_USER_ROLE_SELECTED = 'Team Member'; // In user management form
export const DEFAULT_USER_SKILL_SELECTED = 'Standard'; // In user management form
export const USER_SKILL_Expert = 'Expert'; // In user management form

export const DEFAULT_FLAG_LEVEL = 'Amber';
export const DEFAULT_FLAG_STATUS = 'Unresolved';

export const WORD_COUNT_PER_PAGE = 700; // Must come from backend but for now

export const USER_SKILL_TO_WORDCOUNT = 1000;


export const thousandSeprator = (x = 0) => {
    x = x ? x.toString() : 0;
    if (x) {
        var pattern = /(-?\d+)(\d{3})/;
        while (pattern.test(x))
            x = x.replace(pattern, "$1,$2");
        // return x;
    }
    return x;

}

export const headerName = (currentUrl) => {
    let header = 'Bid Management'; // Default header value

    const userManagementUrls = [RoutesConstant.userManagement, RoutesConstant.userForm, RoutesConstant.userFormEdit];
    if (userManagementUrls.includes(currentUrl) || userManagementUrls.find((route) => {
        const pattern = pathToRegexp(route);
        return pattern.test(currentUrl);
    })) {
        header = 'User Management'
    }

    const externalUserManagementUrls = [RoutesConstant.externalUserManagement, RoutesConstant.externalUserForm, RoutesConstant.externalUserFormEdit];
    if (externalUserManagementUrls.includes(currentUrl) || externalUserManagementUrls.find((route) => {
        const pattern = pathToRegexp(route);
        return pattern.test(currentUrl);
    })) {
        header = 'External User Management'
    }

    const stageMasterList = [RoutesConstant.stageMasterList];
    if (stageMasterList.includes(currentUrl)) {
        header = 'Stage Master List'
    }

    const userProfile = [RoutesConstant.userProfile];
    if (userProfile.includes(currentUrl)) {
        header = 'User Profile'
    }

    return header;
}


export const avatarURL = `${BASE_URL}/users/getUserAvatar/`