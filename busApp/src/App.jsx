import { Header } from "./Header.jsx";
import {Link, Outlet} from "react-router-dom";
import SocketProvider from "./Context/SocketContext";
import PageContextProvider from "./Context/PageContext.jsx";


//testing code goes here
// import RegisterAdmin from "./Admin/RegisterAdmin/RegisterAdmin.jsx";
function App()
{
    return (
      <>
      <SocketProvider>
        <PageContextProvider>
          <Outlet />
          {/* <RegisterAdmin /> */}
        </PageContextProvider>
      </SocketProvider>
      </>
    )
}

export default App;