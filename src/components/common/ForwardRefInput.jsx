import { Input } from "antd";
import React, { useImperativeHandle, useRef } from "react";

const ForwardRefInput = React.forwardRef((props, ref) => {
  const inputRef = useRef(null);

  useImperativeHandle(
    ref,
    () => {
      return inputRef.current.input;
    },
    []
  );
  return <Input {...props} ref={inputRef} />;
});

ForwardRefInput.displayName = "ForwardRefInput";

export default ForwardRefInput;
