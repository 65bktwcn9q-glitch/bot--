import { AnimatePresence, motion } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import Toasts from "./components/Toasts";
import ServerDetails from "./pages/ServerDetails";
import ServerList from "./pages/ServerList";
import Settings from "./pages/Settings";

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 }
};

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen text-text-primary">
      <TopBar />
      <div className="flex gap-6 px-6 pb-10">
        <Sidebar />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <motion.div
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <ServerList />
                  </motion.div>
                }
              />
              <Route
                path="/servers/:id"
                element={
                  <motion.div
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <ServerDetails />
                  </motion.div>
                }
              />
              <Route
                path="/settings"
                element={
                  <motion.div
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <Settings />
                  </motion.div>
                }
              />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
      <Toasts />
    </div>
  );
}
