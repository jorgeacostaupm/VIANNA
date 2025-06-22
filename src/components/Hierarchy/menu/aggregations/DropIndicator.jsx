export const DropIndicator = ({ used, nodeID, isHidden = false }) => {
  const styles = {
    width: '0.125rem', // Equivalent to w-0.5
    backgroundColor: 'rgba(139, 92, 246, 0.05)', // Equivalent to bg-violet-500 opacity-5
    marginRight: nodeID === '-1' ? '0.25rem' : '', // Equivalent to mr-1 when nodeID is '-1'
    display: isHidden ? 'none' : 'block' // Equivalent to hidden class
  };

  return <div data-used={used} data-before={nodeID || '-1'} style={styles} />;
};

export const HorizontalDropIndicator = ({ used, nodeID, isHidden = false }) => {
  const styles = {
    width: '100%', // Equivalent to w-full
    height: '0.25rem', // Equivalent to h-1
    backgroundColor: 'rgba(139, 92, 246, 0.05)', // Equivalent to bg-violet-500 opacity-5
    marginRight: nodeID === '-1' ? '0.25rem' : '', // Equivalent to mr-1 when nodeID is '-1'
    display: isHidden ? 'none' : 'block' // Equivalent to hidden class
  };

  return <div data-used={used} data-before={nodeID || '-1'} style={styles} />;
};

// Helper functions remain unchanged
export function getIndicators(used) {
  return Array.from(document.querySelectorAll(`[data-used="${used}"]`));
}

export function getNearestIndicator(event, indicators) {
  const MARGINY = 10;
  const MARGINX = 15;

  const element = indicators.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      if (box.top - MARGINY > event.clientY || box.bottom + MARGINY < event.clientY) {
        return closest;
      }

      if (box.left - MARGINX > event.clientX || box.right + MARGINX < event.clientX) {
        return closest;
      }
      return { element: child };
    },
    {
      element: indicators[indicators.length - 1]
    }
  );

  return element;
}

export function clearHightlight(els, used) {
  const indicators = els || getIndicators(used);
  indicators.forEach((indicator) => (indicator.style.opacity = '0'));
}

export function highlightIndicators(event, used) {
  const indicators = getIndicators(used);
  const el = getNearestIndicator(event, indicators);
  el.element.style.opacity = '1';
}

export default DropIndicator;
