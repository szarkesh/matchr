import Input from "./Input";
import Button from "./Button";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import React, { useState } from "react";

let SERVER_URL = "http://localhost:5001";
function Login() {
  let navigate = useNavigate();
  let [loginError, setLoginError] = useState("");

  let handleSubmit = (e) => {
    e.preventDefault();
    fetch(
      `${SERVER_URL}/login?email=${e.target.email.value}&password=${e.target.password.value}`,
      { method: "GET", credentials: "include" }
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          console.log("successful login", res.user);
          navigate("/quiz?mode=" + res.user.type);
        } else {
          setLoginError(res.message || "Failed to log in.");
        }
      });
  };

  return (
    <div className="container">
      <div className="flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-72">
          <Input
            labelText="Email"
            type="text"
            id="email"
            placeholder="*******"
            required
          />
          <Input
            labelText="Password"
            type="password"
            id="password"
            placeholder="******"
            required
          />

          {loginError && (
            <div className="text-white rounded-md m-2 p-2 bg-red-400">
              {loginError}
            </div>
          )}
          <Button type="submit">Submit</Button>
        </form>
      </div>
    </div>
  );
}

export default Login;
