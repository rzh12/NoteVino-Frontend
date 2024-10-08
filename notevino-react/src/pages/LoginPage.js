import React, { useState } from "react";
import { Button, TextField, Box, Typography, Link } from "@mui/material";
import axios from "axios";
import nvLogo from "../nv-logo.svg";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // 發送登入請求
      const response = await axios.post("/api/users/signin", {
        email,
        password,
      });

      // 存儲 JWT token 到 localStorage
      const { token } = response.data;
      localStorage.setItem("token", token);

      // 登入成功的回調，並導航到首頁
      onLoginSuccess();
      navigate("/home");
    } catch (error) {
      // 錯誤處理
      console.error("Sign In Error:", error);
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("An error occurred during sign in.");
      }
    }
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #DCD6F7, #b4869f)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: "0 10%",
      }}
    >
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.5 }}
        style={{
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "60%",
          color: "#fff",
        }}
      >
        <motion.img
          src={nvLogo}
          alt="Logo"
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{
            width: 200,
            height: 200,
            marginBottom: 20,
          }}
        />
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          Welcome to NoteVino!
        </Typography>
        <Typography
          sx={{
            color: "#4b2e2a",
            fontSize: "22px",
            marginBottom: "10px",
            fontWeight: "bold",
            lineHeight: "2",
          }}
        >
          Let each sip become a memory.<br></br>Preserve the essence of each
          wine in your notes.
        </Typography>
      </motion.div>

      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.5 }}
        style={{
          backgroundColor: "white",
          padding: "60px 40px",
          borderRadius: "10px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <Typography
          component="h1"
          variant="h5"
          sx={{
            fontSize: "28px",
            fontWeight: "bold",
            marginBottom: "20px",
            color: "#333",
          }}
        >
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              marginBottom: "20px",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#ccc",
                },
                "&:hover fieldset": {
                  borderColor: "#888",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#880e25",
                },
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              marginBottom: "20px",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#ccc",
                },
                "&:hover fieldset": {
                  borderColor: "#888",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#880e25",
                },
              },
            }}
          />
          {errorMessage && (
            <Typography
              color="error"
              variant="body2"
              sx={{
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "20px",
                color: "#cf1538",
              }}
            >
              {errorMessage}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: "#880e25",
              color: "white",
              padding: "12px 20px",
              marginTop: "20px",
              "&:hover": {
                backgroundColor: "#cf1538",
              },
            }}
          >
            Sign In
          </Button>
          <Link
            href="/register"
            sx={{
              display: "inline-block",
              marginTop: "20px",
              padding: "10px 20px",
              borderRadius: "5px",
              fontSize: "14px",
              fontWeight: "bold",
              color: "#880e25",
              border: "2px solid #880e25",
              textDecoration: "none",
              "&:hover": {
                backgroundColor: "#880e25",
                color: "white",
              },
            }}
          >
            Don't have an account? Sign Up!
          </Link>
        </Box>
      </motion.div>
    </Box>
  );
}
