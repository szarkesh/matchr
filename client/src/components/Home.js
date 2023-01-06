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
      <div class="text-4xl">Welcome to MATCHR.</div>
      <div class="flex flex-col items-center space-y-4 my-4">
        <Link to="/signup?mode=participant">
          <Button>
            Sign up as a Participant (I am looking for assistance to build a
            professional career)
          </Button>
        </Link>
        <Link to="/signup?mode=partner">
          <Button>
            Sign up as Partner (I want to help a participant build a
            professional career)
          </Button>
        </Link>
        <Link to="/login">
          <Button>Log in</Button>
        </Link>
      </div>
      <div className="my-8">
        <a onClick={() => setViewPdf(!viewPdf)}>About the MATCHR.</a>
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
