import { createStore } from "vuex";

export default createStore({
  state: {
    lines: [] as parkingPlacesArrayType,
    action: "waitAction",
    selectedLine: 0,
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
  },
  modules: {},
});
