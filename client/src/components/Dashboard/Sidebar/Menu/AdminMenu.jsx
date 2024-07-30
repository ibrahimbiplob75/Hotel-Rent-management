import { FaUserCog } from "react-icons/fa";
import MenuItem from "./MenuItem";
import { BsGraphUp } from "react-icons/bs";

const AdminMenu = () => {
  return (
    <>
      <MenuItem label="Statistics" address="/dashboard/admin-statis" icon={BsGraphUp} />
      <MenuItem icon={FaUserCog} label="Manage Users" address="manage-users" />
    </>
  );
};

export default AdminMenu;
