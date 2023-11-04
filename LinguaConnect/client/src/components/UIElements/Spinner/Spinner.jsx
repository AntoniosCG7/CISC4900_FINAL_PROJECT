import { BeatLoader } from "react-spinners";

function Spinner() {
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <BeatLoader color={"var(--secondary-color)"} />
    </div>
  );
}

export default Spinner;
