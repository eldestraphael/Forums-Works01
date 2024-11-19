import {StateCreator} from 'zustand';


export interface loginState {
  isLoading: boolean;
  setIsLoading:(newState: boolean) => void;
  accesstoken:string,
  setAccessToken:(newState: string) => void;
}

export const  loginSlice:StateCreator<loginState>=(
  set: (partial: loginState | ((state: loginState) => loginState)) => void,
)=>({
  isLoading:false,
  setIsLoading:(newState: boolean) => set(state => ({...state, isLoading: newState})),
  accesstoken:"",
  setAccessToken:(newState: string) => set(state => ({...state, accesstoken: newState})),
})