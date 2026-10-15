// Exercise component event handlers without a browser or production services.
import { setImmediate as nextTurn } from 'node:timers/promises';

export function elements(tree, predicate = () => true) {
  if (Array.isArray(tree)) return tree.flatMap(child => elements(child, predicate));
  if (!tree || typeof tree !== 'object' || !tree.props) return [];
  return [...(predicate(tree) ? [tree] : []), ...elements(tree.props.children, predicate)];
}

export function textContent(tree) {
  if (Array.isArray(tree)) return tree.map(textContent).join('');
  if (tree === null || tree === undefined || typeof tree === 'boolean') return '';
  if (typeof tree !== 'object') return String(tree);
  return textContent(tree.props?.children);
}

export function componentHarness() {
  const slots = [];
  let cursor = 0;
  let dirty = false;
  let effects = [];
  let component;
  let props;
  let tree;
  const react = {
    Suspense: 'suspense',
    use: value => value,
    useMemo: calculate => calculate(),
    useCallback: callback => callback,
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => {
        const updated = typeof value === 'function' ? value(slots[index]) : value;
        if (!Object.is(slots[index], updated)) { slots[index] = updated; dirty = true; }
      }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useEffect(effect, dependencies) {
      const index = cursor++;
      const previous = slots[index];
      if (!previous || dependencies?.some((value, at) => !Object.is(value, previous.dependencies?.[at]))) {
        slots[index] = { dependencies, cleanup: previous?.cleanup };
        effects.push(() => { previous?.cleanup?.(); slots[index].cleanup = effect(); });
      }
    },
  };
  function render() {
    for (let attempt = 0; attempt < 30; attempt++) {
      dirty = false;
      cursor = 0;
      effects = [];
      tree = component(props);
      for (const node of elements(tree, element => element.props.ref?.current !== undefined)) node.props.ref.current ||= {};
      for (const effect of effects) effect();
      if (!dirty) return tree;
    }
    throw new Error('Component did not settle after 30 renders');
  }
  return {
    react,
    mount(target, initialProps = {}) { component = target; props = initialProps; return render(); },
    render,
    update(updatedProps) { props = updatedProps; return render(); },
    async flush() { await nextTurn(); return render(); },
    get tree() { return tree; },
  };
}

export function fixtureCart() {
  const state = {
    items: [],
    clearIfExpired() {},
    getTotal() { return state.items.reduce((total, item) => total + (item.donationAmount ?? item.product.price * item.quantity), 0); },
    addItem(product, quantity = 1, customFields = {}, subscriptionType) { state.items.push({ product, quantity, customFields, subscriptionType }); },
    updateServerSelection(id, server) { state.items.findLast(item => item.product.id === id).serverSelection = server; },
    updateDonationAmount(id, amount) { state.items.findLast(item => item.product.id === id).donationAmount = amount; },
  };
  const useCart = selector => selector ? selector(state) : state;
  useCart.getState = () => state;
  return { state, useCart };
}
