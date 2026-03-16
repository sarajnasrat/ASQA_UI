import { Outlet } from "react-router-dom";
import Footer from "../components/feature/website/component/Footer";
import Navbar from "../components/feature/website/component/Navbar";

export const WebsiteLayout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};