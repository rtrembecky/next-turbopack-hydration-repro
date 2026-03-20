import { useEffect } from "react";

const Dynamic: React.FC = () => {
  useEffect(() => {
    console.log("[Dynamic] mounted");
    return () => {
      console.log("[Dynamic] unmounted");
    };
  }, []);

  return <h1 data-testid="dynamic-component">Dynamic Component</h1>;
};

export default Dynamic;
