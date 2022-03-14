const withinDotOffsetPx = 0.5;

export default {
  dotByDotOffsetCoordArgs(x, y, offsetPx = withinDotOffsetPx) {
    let offsetX = Math.round(x);
    let offsetY = Math.round(y);
    return [ offsetX + offsetPx, offsetY + offsetPx ];
  },

  dotByDotOffsetRectArgs(x, y, width, height, offsetPx = withinDotOffsetPx) {
    let offsetX = Math.round(x);
    let offsetY = Math.round(y);
    let endX = x + width;
    let endY = y + height;
    let offsetEndX = Math.round(endX);
    let offsetEndY = Math.round(endY);
    let offsetWidth = offsetEndX - offsetX;
    let offsetHeight = offsetEndY - offsetY;
    return [ offsetX + offsetPx, offsetY + offsetPx, offsetWidth, offsetHeight ];
  },
}