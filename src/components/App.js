import {
  Link,
  BrowserRouter,
  Routes,
  Route,
  useParams,
  useLocation,
} from "react-router-dom";
import CreateMatches from "./CreateMatches";
import Home from "./Home";
import Login from "./Login";
import Quiz from "./Quiz";
import QuizIntro from "./QuizIntro";
import Signup from "./Signup";
import ViewSideBySide from "./ViewSideBySide";

let navigation = [
  {
    href: "/",
    name: "Home",
  },
  {
    href: "/quiz",
    name: "Quiz",
  },
];

function App() {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col ">
      <div className="w-full">
        {/* <nav className="h-16 flex flex-row items-center space-x-8 px-8">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                className={
                  "hover:bg-slate-300 py-1 px-2 transition duration-100" +
                  (isActive ? " border-b-2" : "")
                }
                to={item.href}
              >
                {item.name}
              </Link>
            );
          })}
        </nav> */}
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route path="quiz" element={<QuizIntro />} />
        <Route path="match" element={<CreateMatches />} />
        <Route path="sidebyside" element={<ViewSideBySide />} />
      </Routes>
    </div>
  );
}

export default App;
