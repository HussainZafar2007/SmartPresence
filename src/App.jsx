import { useState } from "react";
import LoginForm from "./components/LoginForm";
import RegistrationForm from "./components/RegistrationForm";

function App() {
  const [page, setPage] = useState("login");

  const handleLogin = (user) => {
    console.log("Logged in user:", user);
    alert("Login Successful!");
  };

  return (
    <>
      {page === "login" && (
        <LoginForm
          onLogin={handleLogin}
          onSwitchToRegister={() => setPage("register")}
        />
      )}

      {page === "register" && (
        <RegistrationForm
          onSwitchToLogin={() => setPage("login")}
        />
      )}
    </>
  );
}

export default App;
