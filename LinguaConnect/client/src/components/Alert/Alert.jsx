// Desc: Alert component to display messages to user using react-toastify library.
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { clearAlert } from "../../slices/alertSlice";

const Alert = () => {
  const dispatch = useDispatch();
  const { message, type } = useSelector((state) => state.alert);

  useEffect(() => {
    if (message) {
      switch (type) {
        case "error":
          toast.error(message, { onClose: () => dispatch(clearAlert()) });
          break;
        case "success":
          toast.success(message, { onClose: () => dispatch(clearAlert()) });
          break;
        case "info":
          toast.info(message, { onClose: () => dispatch(clearAlert()) });
          break;
        default:
          toast(message, { onClose: () => dispatch(clearAlert()) });
      }
    }
  }, [message, type, dispatch]);

  return null;
};

export default Alert;
