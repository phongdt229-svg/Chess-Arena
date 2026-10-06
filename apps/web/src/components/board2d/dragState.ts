// A drag ends with a click on the square under the pointer; that click must not toggle the selection again
let suppressUntil = 0;

export const suppressNextClick = () => {
  suppressUntil = Date.now() + 350;
};

export const clickSuppressed = () => Date.now() < suppressUntil;
