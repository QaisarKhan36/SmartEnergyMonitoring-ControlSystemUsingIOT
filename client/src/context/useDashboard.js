import { useContext } from "react";
import DashboardContext from "./DashboardContext";

const useDashboard = () => useContext(DashboardContext);

export default useDashboard;