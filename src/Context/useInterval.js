import { useRef, useEffect } from "react";

const UseInterval = (callback, delay) => {
  const saveCallBack = useRef();

  useEffect(() => {
    saveCallBack.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      saveCallBack.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => {
        clearInterval(id);
      };
    }
  }, [callback, delay]);
};

export default UseInterval;
