import { Stack } from "@mui/material";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App";

const Secret = () => {
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(window.location.search);
  const { user } = useContext(UserContext);
  useEffect(() => {
    if (queryParams.get("user") !== user.info?.id) {
        navigate("/");
    }
  }, []);
  return <Stack justifyContent="center" alignItems="center" p={3}>

  </Stack>;
};
export default Secret;
