import Input from "./Input";
import Button from "./Button";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import React, { useState } from "react";

import { SERVER_URL } from "../Constants";
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
    <div className="container py-8">
      <div className="flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-72">
          <div className="my-4">
            <Input
              className="my-2"
              labelText="Email"
              type="text"
              id="email"
              placeholder="*******"
              required
            />
            <Input
              className="my-2"
              labelText="Password"
              type="password"
              id="password"
              placeholder="******"
              required
            />
          </div>
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
