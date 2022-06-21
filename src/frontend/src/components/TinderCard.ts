/* global WebKitCSSMatrix */

import React, { PropsWithChildren } from "react";
import { sleep } from "../common/utils";

export type Direction = "left" | "right" | "up" | "down" | "none";
declare type SwipeHandler = (direction: Direction) => void;
declare type CardLeftScreenHandler = (direction: Direction) => void;
declare type SwipeRequirementFufillUpdate = (direction: Direction) => void;
declare type SwipeRequirementUnfufillUpdate = () => void;

export interface TinderCardInstance {
  /**
   * Programmatically trigger a swipe of the card in one of the valid directions `'left'`, `'right'`, `'up'` and `'down'`. This function, `swipe`, can be called on a reference of the TinderCard instance. Check the [example](https://github.com/3DJakob/react-tinder-card-demo/blob/master/src/examples/Advanced.js) code for more details on how to use this.
   *
   * @param dir The direction in which the card should be swiped. One of: `'left'`, `'right'`, `'up'` and `'down'`.
   */
  swipe(dir?: Direction): Promise<void>;

  /**
   * Restore swiped-card state. Use this function if you want to undo a swiped-card (e.g. you have a back button that shows last swiped card or you have a reset button. The promise is resolved once the card is returned
   */
  restoreCard(): Promise<void>;
}

declare interface Props {
  ref?: React.Ref<TinderCardInstance>;

  /**
   * Whether or not to let the element be flicked away off-screen after a swipe.
   *
   * @default true
   */
  flickOnSwipe?: boolean;

  /**
   * Callback that will be executed when a swipe has been completed. It will be called with a single string denoting which direction the swipe was in: `'left'`, `'right'`, `'up'` or `'down'`.
   */
  onSwipe?: SwipeHandler;

  /**
   * Callback that will be executed when a `TinderCard` has left the screen. It will be called with a single string denoting which direction the swipe was in: `'left'`, `'right'`, `'up'` or `'down'`.
   */
  onCardLeftScreen?: CardLeftScreenHandler;

  /**
   * An array of directions for which to prevent swiping out of screen. Valid arguments are `'left'`, `'right'`, `'up'` and `'down'`.
   *
   * @default []
   */
  preventSwipe?: string[];

  /**
   * What method to evaluate what direction to throw the card on release. 'velocity' will evaluate direction based on the direction of the swiping movement. 'position' will evaluate direction based on the position the card has on the screen like in the app tinder.
   * If set to position it is recommended to manually set swipeThreshold based on the screen size as not all devices will accommodate the default distance of 300px and the default native swipeThreshold is 1px which most likely is undesirably low.
   *
   * @default 'velocity'
   */
  swipeRequirementType?: "velocity" | "position";

  /**
   * The threshold of which to accept swipes. If swipeRequirementType is set to velocity it is the velocity threshold and if set to position it is the position threshold.
   * On native the default value is 1 as the physics works differently there.
   * If swipeRequirementType is set to position it is recommended to set this based on the screen width so cards can be swiped on all screen sizes.
   *
   * @default 300
   */
  swipeThreshold?: number;

  /**
   * Callback that will be executed when a `TinderCard` has fulfilled the requirement necessary to be swiped in a direction on release. This in combination with `onSwipeRequirementUnfulfilled` is useful for displaying user feedback on the card. When using this it is recommended to use `swipeRequirementType='position'` as this will fire a lot otherwise.
   * It will be called with a single string denoting which direction the user is swiping: `'left'`, `'right'`, `'up'` or `'down'`.
   */
  onSwipeRequirementFulfilled?: SwipeRequirementFufillUpdate;

  /**
   * Callback that will be executed when a `TinderCard` has unfulfilled the requirement necessary to be swiped in a direction on release.
   */
  onSwipeRequirementUnfulfilled?: SwipeRequirementUnfufillUpdate;

  /**
   * HTML attribute class
   */
  className?: string;
}

interface Vector2 {
  x: number;
  y: number;
}

interface Location extends Vector2 {
  time: number;
}

const settings = {
  snapBackDuration: 300,
  maxTilt: 5,
  bouncePower: 0.2,
  swipeThreshold: 300, // px/s
};

const getElementSize = (element: HTMLElement) => {
  const elementStyles = window.getComputedStyle(element);
  const widthString = elementStyles.getPropertyValue("width");
  const width = Number(widthString.split("px")[0]);
  const heightString = elementStyles.getPropertyValue("height");
  const height = Number(heightString.split("px")[0]);
  return { x: width, y: height };
};

const pythagoras = (x: number, y: number) => {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
};

const normalize = (vector: Vector2, multiplier = 1) => {
  const length = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
  return {
    x: (vector.x * multiplier) / length,
    y: (vector.y * multiplier) / length,
  };
};

const animateOut = async (
  element: HTMLElement,
  speed: Vector2,
  easeIn = false
) => {
  const startPos = getTranslate(element);
  const bodySize = getElementSize(document.body);
  const diagonal = pythagoras(bodySize.x, bodySize.y);

  const velocity = pythagoras(speed.x, speed.y);
  const time = diagonal / velocity;
  const multiplier = diagonal / velocity;

  const translateString = translationString(
    speed.x * multiplier + startPos.x,
    -speed.y * multiplier + startPos.y
  );
  let rotateString = "";

  const rotationPower = 200;

  if (easeIn) {
    element.style.transition = "ease " + time + "s";
  } else {
    element.style.transition = "ease-out " + time + "s";
  }

  if (getRotation(element) === 0) {
    rotateString = rotationString((Math.random() - 0.5) * rotationPower);
  } else if (getRotation(element) > 0) {
    rotateString = rotationString(
      (Math.random() * rotationPower) / 2 + getRotation(element)
    );
  } else {
    rotateString = rotationString(
      ((Math.random() - 1) * rotationPower) / 2 + getRotation(element)
    );
  }

  element.style.transform = translateString + rotateString;

  await sleep(time * 1000);
};

const animateBack = async (element: HTMLElement) => {
  element.style.transition = settings.snapBackDuration + "ms";
  const startingPoint = getTranslate(element);
  const translation = translationString(
    startingPoint.x * -settings.bouncePower,
    startingPoint.y * -settings.bouncePower
  );
  const rotation = rotationString(getRotation(element) * -settings.bouncePower);
  element.style.transform = translation + rotation;

  await sleep(settings.snapBackDuration * 0.75);
  element.style.transform = "none";

  await sleep(settings.snapBackDuration);
  element.style.transition = "10ms";
};

const getSwipeDirection = (property: Vector2) => {
  if (Math.abs(property.x) > Math.abs(property.y)) {
    if (property.x > settings.swipeThreshold) {
      return "right";
    } else if (property.x < -settings.swipeThreshold) {
      return "left";
    }
  } else {
    if (property.y > settings.swipeThreshold) {
      return "up";
    } else if (property.y < -settings.swipeThreshold) {
      return "down";
    }
  }
  return "none";
};

const calcSpeed = (oldLocation: Location, newLocation: Location) => {
  const dx = newLocation.x - oldLocation.x;
  const dy = oldLocation.y - newLocation.y;
  const dt = (newLocation.time - oldLocation.time) / 1000;
  return { x: dx / dt, y: dy / dt };
};

const translationString = (x: number, y: number) => {
  const translation = "translate(" + x + "px, " + y + "px)";
  return translation;
};

const rotationString = (rot: number) => {
  const rotation = "rotate(" + rot + "deg)";
  return rotation;
};

const getTranslate = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);
  const matrix = new WebKitCSSMatrix(style.webkitTransform);
  const ans = { x: matrix.m41, y: -matrix.m42 };
  return ans;
};

const getRotation = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);
  const matrix = new WebKitCSSMatrix(style.webkitTransform);
  const ans = (-Math.asin(matrix.m21) / (2 * Math.PI)) * 360;
  return ans;
};

const dragableTouchmove = (
  coordinates: Vector2,
  element: HTMLElement,
  offset: Vector2,
  lastLocation: Location
) => {
  const pos = { x: coordinates.x + offset.x, y: coordinates.y + offset.y };
  const newLocation = { x: pos.x, y: pos.y, time: new Date().getTime() };
  const translation = translationString(pos.x, pos.y);
  const rotCalc = calcSpeed(lastLocation, newLocation).x / 1000;
  const rotation = rotationString(rotCalc * settings.maxTilt);
  element.style.transform = translation + rotation;
  return newLocation;
};

const touchCoordinatesFromEvent = (e: TouchEvent) => {
  const touchLocation = e.targetTouches[0];
  return { x: touchLocation.clientX, y: touchLocation.clientY };
};

const mouseCoordinatesFromEvent = (e: MouseEvent) => {
  return { x: e.clientX, y: e.clientY };
};

export const TinderCard = React.forwardRef<
  TinderCardInstance,
  PropsWithChildren<Props>
>(
  (
    {
      flickOnSwipe = true,
      children,
      onSwipe,
      onCardLeftScreen,
      className,
      preventSwipe = [],
      swipeRequirementType = "velocity",
      swipeThreshold = settings.swipeThreshold,
      onSwipeRequirementFulfilled,
      onSwipeRequirementUnfulfilled,
    },
    ref
  ) => {
    settings.swipeThreshold = swipeThreshold;
    const swipeAlreadyReleased = React.useRef(false);

    const element = React.useRef<HTMLDivElement>();

    React.useImperativeHandle(ref, () => ({
      async swipe(dir = "right") {
        if (!element.current) return;
        if (onSwipe) onSwipe(dir);
        const power = 1000;
        const disturbance = (Math.random() - 0.5) * 100;
        if (dir === "right") {
          await animateOut(element.current, { x: power, y: disturbance }, true);
        } else if (dir === "left") {
          await animateOut(
            element.current,
            { x: -power, y: disturbance },
            true
          );
        } else if (dir === "up") {
          await animateOut(element.current, { x: disturbance, y: power }, true);
        } else if (dir === "down") {
          await animateOut(
            element.current,
            { x: disturbance, y: -power },
            true
          );
        }
        element.current.style.display = "none";
        if (onCardLeftScreen) onCardLeftScreen(dir);
      },
      async restoreCard() {
        if (!element.current) return;
        element.current.style.display = "block";
        await animateBack(element.current);
      },
    }));

    const handleSwipeReleased = React.useCallback(
      async (speed: Vector2, element?: HTMLElement) => {
        if (swipeAlreadyReleased.current || !element) {
          return;
        }
        swipeAlreadyReleased.current = true;

        const currentPostion = getTranslate(element);
        // Check if this is a swipe
        const dir = getSwipeDirection(
          swipeRequirementType === "velocity" ? speed : currentPostion
        );

        if (dir !== "none") {
          if (onSwipe) onSwipe(dir);

          if (flickOnSwipe) {
            if (!preventSwipe.includes(dir)) {
              const outVelocity =
                swipeRequirementType === "velocity"
                  ? speed
                  : normalize(currentPostion, 600);
              await animateOut(element, outVelocity);
              element.style.display = "none";
              if (onCardLeftScreen) onCardLeftScreen(dir);
              return;
            }
          }
        }

        // Card was not flicked away, animate back to start
        animateBack(element);
      },
      [
        swipeAlreadyReleased,
        flickOnSwipe,
        onSwipe,
        onCardLeftScreen,
        preventSwipe,
        swipeRequirementType,
      ]
    );

    const handleSwipeStart = React.useCallback(() => {
      swipeAlreadyReleased.current = false;
    }, [swipeAlreadyReleased]);

    React.useLayoutEffect(() => {
      let offset: Vector2;
      let speed = { x: 0, y: 0 };
      let lastLocation = { x: 0, y: 0, time: new Date().getTime() };
      let mouseIsClicked = false;
      let swipeThresholdFulfilledDirection = "none";

      element.current?.addEventListener("touchstart", (ev) => {
        ev.preventDefault();
        handleSwipeStart();
        offset = {
          x: -touchCoordinatesFromEvent(ev).x,
          y: -touchCoordinatesFromEvent(ev).y,
        };
      });

      element.current?.addEventListener("mousedown", (ev) => {
        ev.preventDefault();
        mouseIsClicked = true;
        handleSwipeStart();
        offset = {
          x: -mouseCoordinatesFromEvent(ev).x,
          y: -mouseCoordinatesFromEvent(ev).y,
        };
      });

      const handleMove = (coordinates: Vector2) => {
        if (!element.current) return;
        // Check fulfillment
        if (onSwipeRequirementFulfilled || onSwipeRequirementUnfulfilled) {
          const dir = getSwipeDirection(
            swipeRequirementType === "velocity"
              ? speed
              : getTranslate(element.current)
          );
          if (dir !== swipeThresholdFulfilledDirection) {
            swipeThresholdFulfilledDirection = dir;
            if (swipeThresholdFulfilledDirection === "none") {
              if (onSwipeRequirementUnfulfilled)
                onSwipeRequirementUnfulfilled();
            } else {
              if (onSwipeRequirementFulfilled) onSwipeRequirementFulfilled(dir);
            }
          }
        }

        // Move
        const newLocation = dragableTouchmove(
          coordinates,
          element.current,
          offset,
          lastLocation
        );
        speed = calcSpeed(lastLocation, newLocation);
        lastLocation = newLocation;
      };

      element.current?.addEventListener("touchmove", (ev) => {
        ev.preventDefault();
        handleMove(touchCoordinatesFromEvent(ev));
      });

      element.current?.addEventListener("mousemove", (ev) => {
        ev.preventDefault();
        if (mouseIsClicked) {
          handleMove(mouseCoordinatesFromEvent(ev));
        }
      });

      element.current?.addEventListener("touchend", (ev) => {
        ev.preventDefault();
        handleSwipeReleased(speed, element.current);
      });

      element.current?.addEventListener("mouseup", (ev) => {
        if (mouseIsClicked) {
          ev.preventDefault();
          mouseIsClicked = false;
          handleSwipeReleased(speed, element.current);
        }
      });

      element.current?.addEventListener("mouseleave", (ev) => {
        if (mouseIsClicked) {
          ev.preventDefault();
          mouseIsClicked = false;
          handleSwipeReleased(speed, element.current);
        }
      });
    }, []); // TODO fix so swipeRequirementType can be changed on the fly. Pass as dependency cleanup eventlisteners and update new eventlisteners.

    return React.createElement("div", { ref: element, className }, children);
  }
);
