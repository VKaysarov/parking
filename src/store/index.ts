import { createStore } from "vuex";

export default createStore({
  state: {
    lines: [] as parkingPlacesArrayType,
    drawLine: false,
    addPoint: false,
    action: "waitAction",
  },
  mutations: {
    SAVE_POINT(state, lines) {
      state.lines = lines;
    },
    START_DRAW(state) {
      state.drawLine = true;
    },
    END_DRAW(state) {
      state.drawLine = false;
    },
    ADD_POINT(state) {
      state.addPoint = !state.addPoint;
    },
    CHANGE_ACTION(state, action) {
      state.action = action;
    },
  },
  actions: {
    savePoint(context, lines) {
      context.commit("SAVE_POINT", lines);
    },
    startDraw(context) {
      context.commit("START_DRAW");
    },
    endDraw(context) {
      context.commit("END_DRAW");
    },
    addPoint(context) {
      context.commit("ADD_POINT");
    },
    changeAction(context, action) {
      context.commit("CHANGE_ACTION", action);
    },
  },
  modules: {},
});
