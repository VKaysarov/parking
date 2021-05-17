import { createStore } from "vuex";
const defaultPoints: parkingPlacesArrayType = [];

export default createStore({
  state: {
    points: defaultPoints,
    drawLine: false,
    addPoint: false,
    action: "auto",
  },
  mutations: {
    savePoint(state, points) {
      state.points = points;
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
    savePoint(context, points) {
      context.commit("savePoint", points);
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
