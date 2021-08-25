import { Loader5 } from "@styled-icons/remix-line/Loader5";

// TODO: make this full screen.

const Loading = () => {
  return (
    <div className="rounded-md shadow-md">
      <Loader5 className="h-5 w-5 animate-spin text-color-gray-500" />
    </div>
  );
};

export default Loading;
