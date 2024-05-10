import BusStatus from "../../Driver/BusStatus/BusStatus";
import RegisterDriver from "../../Driver/RegisterDriver/RegisterDriver";

export default function AdminDashBoard() {
  return (
    <div>
      <RegisterDriver />
      <BusStatus />
    </div>
  );
}
