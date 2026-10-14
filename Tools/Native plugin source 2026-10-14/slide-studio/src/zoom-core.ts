/** View-only coordinates, in screen pixels relative to the viewport center. */
export type ZoomState = {zoom: number; x: number; y: number};
export const fitZoom = (): ZoomState => ({zoom: 1, x: 0, y: 0});
export function zoomAt(state: ZoomState, factor: number, x = 0, y = 0): ZoomState {
  const zoom = Math.max(.5, Math.min(8, state.zoom * factor));
  const ratio = zoom / state.zoom;
  return {zoom, x: x - (x - state.x) * ratio, y: y - (y - state.y) * ratio};
}
export function constrainPan(state: ZoomState, width: number, height: number, contentWidth: number, contentHeight: number): ZoomState {
  const x = Math.max(0, (contentWidth * state.zoom - width) / 2 + 48);
  const y = Math.max(0, (contentHeight * state.zoom - height) / 2 + 48);
  return {...state, x: Math.max(-x, Math.min(x, state.x)) || 0, y: Math.max(-y, Math.min(y, state.y)) || 0};
}
