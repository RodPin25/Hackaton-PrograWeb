import React, { useEffect } from "react";
import LoginModal from "../components/LoginModal";
import { api } from "../services/api";

function Login({ onLoginSuccess }) {
    useEffect(() => {
        const checkLogin = async () => {
            try {
                const token = localStorage.getItem("Token");
                if (token) {
                    if (onLoginSuccess) {
                        onLoginSuccess();
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        checkLogin();
    }, [onLoginSuccess]);

    return (
        <LoginModal onLoginSuccess={onLoginSuccess} />
    );
}

export default Login;