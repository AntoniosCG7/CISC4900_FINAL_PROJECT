import { configureStore } from "@reduxjs/toolkit";
import * as reducers from "../slices";

const store = configureStore({
  reducer: reducers,
});

export default store;
