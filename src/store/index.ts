import { createStore } from "vuex";
const defaultlines: parkingPlacesArrayType = [];

export default createStore({
  state: {
    lines: defaultlines,
    drawLine: false,
    addPoint: false,
    action: "auto",
  },
  mutations: {
    savePoint(state, lines) {
      state.lines = lines;
    },
    startDraw(state) {
      state.drawLine = true;
    },
    endDraw(state) {
      state.drawLine = false;
    },
    addPoint(state) {
      state.addPoint = !state.addPoint;
    },
    changeAction(state, action) {
      state.action = action;
    },
  },
  actions: {
    savePoint(context, lines) {
      context.commit("savePoint", lines);
    },
    startDraw(context) {
      context.commit("startDraw");
    },
    endDraw(context) {
      context.commit("endDraw");
    },
    addPoint(context) {
      context.commit("addPoint");
    },
    changeAction(context, action) {
      context.commit("changeAction", action);
    },
  },
  modules: {},
});
