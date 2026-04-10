export const DEFAULT_UNASSIGNED_GROUP_NAME = "Unassigned";

export const initialLassoState = Object.freeze({
  mode: "idle",
  targetColumn: "",
  groups: [],
  activeGroupId: null,
  selectionMode: "add",
  assignments: {},
  unassignedGroupName: DEFAULT_UNASSIGNED_GROUP_NAME,
  nextGroupIndex: 1,
});

function createGroup(state) {
  const id = `lasso-group-${state.nextGroupIndex}`;
  return {
    id,
    name: `Group ${state.groups.length + 1}`,
  };
}

function ensureActiveGroup(state) {
  if (state.groups.length > 0) {
    return state.activeGroupId ? state : { ...state, activeGroupId: state.groups[0].id };
  }

  const firstGroup = createGroup(state);
  return {
    ...state,
    groups: [firstGroup],
    activeGroupId: firstGroup.id,
    nextGroupIndex: state.nextGroupIndex + 1,
  };
}

function sanitizeSelectionMode(selectionMode) {
  return selectionMode === "remove" ? "remove" : "add";
}

export function lassoReducer(state, action) {
  switch (action.type) {
    case "START": {
      const targetColumn = action.payload.targetColumn;
      const next = ensureActiveGroup({
        ...state,
        mode: "editing",
        targetColumn,
      });
      return next;
    }

    case "STOP":
      return {
        ...state,
        mode: "idle",
      };

    case "ADD_GROUP": {
      const group = createGroup(state);
      return {
        ...state,
        groups: [...state.groups, group],
        activeGroupId: group.id,
        nextGroupIndex: state.nextGroupIndex + 1,
      };
    }

    case "RENAME_GROUP": {
      const { groupId, name } = action.payload;
      return {
        ...state,
        groups: state.groups.map((group) =>
          group.id === groupId ? { ...group, name } : group,
        ),
      };
    }

    case "SET_ACTIVE_GROUP":
      return {
        ...state,
        activeGroupId: action.payload.groupId,
      };

    case "SET_SELECTION_MODE":
      return {
        ...state,
        selectionMode: sanitizeSelectionMode(action.payload.selectionMode),
      };

    case "SET_UNASSIGNED_NAME":
      return {
        ...state,
        unassignedGroupName: action.payload.unassignedGroupName,
      };

    case "CLEAR_ASSIGNMENTS":
      return {
        ...state,
        assignments: {},
      };

    case "TOGGLE_POINT": {
      if (!state.activeGroupId) return state;

      const orderKey = action.payload.orderKey;
      const assignments = { ...state.assignments };
      if (assignments[orderKey] === state.activeGroupId) {
        delete assignments[orderKey];
      } else {
        assignments[orderKey] = state.activeGroupId;
      }

      return {
        ...state,
        assignments,
      };
    }

    case "APPLY_SELECTION": {
      if (!state.activeGroupId) return state;
      const { orderKeys, mode } = action.payload;
      if (!Array.isArray(orderKeys) || orderKeys.length === 0) return state;

      const assignments = { ...state.assignments };
      orderKeys.forEach((orderKey) => {
        if (mode === "remove") {
          if (assignments[orderKey] === state.activeGroupId) {
            delete assignments[orderKey];
          }
          return;
        }
        assignments[orderKey] = state.activeGroupId;
      });

      return {
        ...state,
        assignments,
      };
    }

    default:
      return state;
  }
}

export function isLassoEnabled(state) {
  return state.mode === "editing";
}
