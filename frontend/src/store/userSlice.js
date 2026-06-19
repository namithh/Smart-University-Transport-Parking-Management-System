import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    user : null
  }
  
  export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
      setUserdetails : (state, action) => {
        state.user = action.payload

      }
    },
  })
  
  // Action creators are generated for each case reducer function
  export const { setUserdetails} = userSlice.actions
  
  export default userSlice.reducer