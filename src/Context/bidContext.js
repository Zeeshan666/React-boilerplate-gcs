import { createContext, useReducer, useEffect } from 'react'
import { TEAMS_ADD_ACTION,BID_ALL_DELETE_QUESTIONS, BID_ERROR,TEAMS_ADD_ACTION_API, STAGES_ADD_ACTION, TEAMS_DELETE_ACTION, QUESTIONS_ADD_ACTION, QUESTIONS_ADD_ACTION_API, QUESTIONS_DELETE_ACTION, QUESTIONS_EDIT_ACTION, QUESTIONS_COLOR_ACTION, BID_CONTEXT_RESET_ACTION, BID_ALL_QUESTIONS, BID_ALL_ADD_QUESTIONS, BID_ALL_EDIT_QUESTIONS} from './Actions'

export const BidContext = createContext()

export const bidReducer = (state, action) => {
    switch (action.type) {
        case TEAMS_ADD_ACTION:
          return {
            ...state,
            teams: [...state.teams, action.payload]
          };
          case TEAMS_ADD_ACTION_API:
            return {
              ...state,
              teams: action.payload
            };
        case STAGES_ADD_ACTION:
          return {
            ...state,
            stages: action.payload
          };
        case TEAMS_DELETE_ACTION:
          return { 
            ...state,
            teams: state.teams.filter((team) => team !== action.payload) 
          };
        case QUESTIONS_ADD_ACTION:
          return {
            ...state,
            questions: [...state.questions, action.payload.questionObject]
          };
       
          case QUESTIONS_ADD_ACTION_API:
            return {
              ...state,
              questions: action.payload
            };
          case QUESTIONS_EDIT_ACTION:
            return {
              ...state,
              questions: [...state.questions.slice(0, action.payload.index), action.payload.questionObject, ...state.questions.slice(action.payload.index + 1)]
            }
          case QUESTIONS_COLOR_ACTION:
            return {
              ...state,
              questions: action.payload
            }
          case QUESTIONS_DELETE_ACTION:
            return {
              ...state,
              questions: state.questions.filter((question) => question !== action.payload) 
          };
        
          case BID_ALL_QUESTIONS : return{
              ...state,
              allQuestions:action.payload,
          };
          case BID_ALL_ADD_QUESTIONS:
            return {
              ...state,
              allQuestions: [...state.allQuestions, action.payload.questionObject]
            };
            case BID_ALL_DELETE_QUESTIONS:
              return {
                ...state,
                allQuestions: state.allQuestions.filter((question) => question.id !== action.payload.id) 
            };
            case BID_ALL_EDIT_QUESTIONS:
              return {
                ...state,
                allQuestions: [...state.allQuestions.slice(0, action.payload.index), action.payload.questionObject, ...state.allQuestions.slice(action.payload.index + 1)]
            };
            case BID_ERROR :    return {
              ...state,
              isBidError:  action.payload
          };
          case BID_CONTEXT_RESET_ACTION:
            return {
              teams: [],
              stages: [],
              questions: [],
              allQuestions:[],
              isBidError: false
            }
        default:
          throw new Error(`Unhandled action type: ${action.type}`);
      }
}

export const BidContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(bidReducer, {
        teams: [], // we will store what the backend will send initially.
        stages: [],
        allQuestions:[],
        questions: [
          // {
          //   'complexity': '1',
          //   'documentLink': '',
          //   'priority': 1,
          //   'questionName': "Test",
          //   'questionNumber': '1A',
          //   'questionOwner': 'Test',
          //   'questionText': 'Question Text',
          //   'sme': 'Test',
          //   'stages': [],
          //   'weighting': 123,
          //   'wordCount': 1234
          // }
      ],
    })


    console.log('BidContext state:', state)

    return (
        <BidContext.Provider value={{ ...state, dispatch }}>
            {children}
        </BidContext.Provider>
    )

}