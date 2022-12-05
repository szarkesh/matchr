import Button from "./Button";
import {
  Link,
  BrowserRouter,
  Routes,
  Route,
  useParams,
  useLocation,
} from "react-router-dom";
import { useState } from "react";

function Home() {
  let [viewPdf, setViewPdf] = useState(false);
  return (
    <div class="flex-1 flex-grow flex flex-col items-center justify-center pb-8">
      <div class="text-4xl">Welcome to Matchr.</div>
      <div class="flex flex-row items-center space-x-4 my-4">
        <Link to="/signup?mode=participant">
          <Button>
            Sign up as Partner (I'm looking for professional advice)
          </Button>
        </Link>
        <Link to="/signup?mode=partner">
          <Button>
            Sign up as Participant (I'm looking to give professional advice)
          </Button>
        </Link>
      </div>
      <Link to="/login">
        <Button>Log in</Button>
      </Link>
      <div className="my-8">
        To read more about the initiative,{" "}
        <a onClick={() => setViewPdf(!viewPdf)}>view the intro document</a>
      </div>
      {viewPdf && (
        <embed
          src={require("../asset/matchr_kit.pdf")}
          width={parseInt((window.innerWidth * 2) / 3) + "px"}
          height={parseInt(window.innerHeight - 300) + "px"}
        />
      )}
    </div>
  );
}

export default Home;
