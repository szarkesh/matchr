import Button from "./Button";
import {
  Link,
  BrowserRouter,
  Routes,
  Route,
  useParams,
  useLocation,
} from "react-router-dom";

function Home() {
  return (
    <div class="flex-1 flex-grow flex flex-col items-center justify-center pb-8">
      <div class="text-4xl">Welcome to Matchr.</div>
      <div class="flex flex-row items-center space-x-4 my-4">
        <Link to="/signup?mode=participant">
          <Button>I'm looking for professional advice.</Button>
        </Link>
        <Link to="/signup?mode=partner">
          <Button>I'm a professional advisor.</Button>
        </Link>
      </div>
      <Link to="/login">
        <Button>Existing users: log in.</Button>
      </Link>
    </div>
  );
}

export default Home;
