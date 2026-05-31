// Global bridge between TabBar (+) button and AddGoalSheet in layout.
// Avoids prop-drilling or context for a simple cross-component open trigger.

type VoidFn = () => void;

let _present: VoidFn | null = null;
const _refreshListeners = new Set<VoidFn>();

export const addGoalSheetRef = {
  /** Called by (tabs)/_layout.tsx once the sheet ref is ready */
  register(fn: VoidFn) {
    _present = fn;
  },
  unregister() {
    _present = null;
  },

  /** Called by TabBar + button */
  open() {
    _present?.();
  },

  /** Called by home.tsx to subscribe to goal additions */
  onGoalsChanged(fn: VoidFn): VoidFn {
    _refreshListeners.add(fn);
    return () => _refreshListeners.delete(fn);
  },

  /** Called by AddGoalSheet after a goal is saved */
  notifyGoalsChanged() {
    _refreshListeners.forEach(fn => fn());
  },
};
