import { createStore } from "vuex";

export default createStore({
  state: {
    lines: [] as parkingPlacesArrayType,
    action: "waitAction",
    selectedLine: 0,
    imgId: 100,
  },
  mutations: {
    SAVE_POINT(state, lines) {
      state.lines = lines;
    },
    SELECT_LINE(state, index) {
      state.selectedLine = index;
    },
    CHANGE_ACTION(state, action) {
      state.action = action;
    },
    CHANGE_IMG_ID(state, id) {
      state.imgId = id;
    },
    INCREMENT_IMG_ID(state) {
      state.imgId++;
    },
    DECREMENT_IMG_ID(state) {
      state.imgId--;
    },
  },
  actions: {
    savePoint(context, lines) {
      context.commit("SAVE_POINT", lines);
    },
    selectLine(context, index) {
      context.commit("SELECT_LINE", index);
    },
    changeAction(context, action) {
      context.commit("CHANGE_ACTION", action);
    },
    changeImgId(context, id) {
      context.commit("CHANGE_IMG_ID", id);
    },
    incrementImgId(context) {
      context.commit("INCREMENT_IMG_ID");
    },
    decrementImgId(context) {
      context.commit("DECREMENT_IMG_ID");
    },
  },
  modules: {},
});
