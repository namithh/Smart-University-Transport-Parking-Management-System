import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  cardList: [],
};

export const addNewCard = createAsyncThunk(
  "/cards/addNewCard",
  async (formData) => {
    const response = await axios.post(
      "http://localhost:5000/api/shop/card/add",
      formData
    );

    return response.data;
  }
);

export const fetchAllCards= createAsyncThunk(
  "/cards/fetchAllCards",
  async (userId) => {
    const response = await axios.get(
      `http://localhost:5000/api/shop/card/get/${userId}`
    );

    return response.data;
  }
);

export const editCard = createAsyncThunk(
  "/cards/editCard",
  async ({ userId, cardId, formData }) => {
    const response = await axios.put(
      `http://localhost:5000/api/shop/card/update/${userId}/${cardId}`,
      formData
    );

    return response.data;
  }
);

export const deleteCard = createAsyncThunk(
  "/cards/deleteCard",
  async ({ userId, cardId }) => {
    const response = await axios.delete(
      `http://localhost:5000/api/shop/card/delete/${userId}/${cardId}`
    );

    return response.data;
  }
);

const cardSlice = createSlice({
  name: "card",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addNewCard.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addNewCard.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(addNewCard.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchAllCards.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllCards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cardList = action.payload.data;
      })
      .addCase(fetchAllCards.rejected, (state) => {
        state.isLoading = false;
        state.cardList = [];
      });
  },
});

export default cardSlice.reducer;
