import React, { useState } from "react";
import {
  Avatar,
  Button,
  TextField,
  Box,
  Typography,
  Link,
} from "@mui/material";
import axios from "axios";
import nvLogo from "../nv-logo.svg";
import { useNavigate } from "react-router-dom";

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
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            marginBottom: 2,
          }}
          src={nvLogo} // 使用自定義圖片
        />
        <Typography
          component="h1"
          variant="h5"
          sx={{
            fontSize: "28px", // 確保字體大小正確
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
            slotProps={{
              inputLabel: {
                sx: {
                  "&.Mui-focused": {
                    color: "#880e25", // 當標籤浮動到框框上時的顏色
                  },
                },
              },
            }}
            sx={{
              marginBottom: "20px",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#ccc", // 默認邊框顏色
                },
                "&:hover fieldset": {
                  borderColor: "#888", // 滑鼠懸停時的顏色
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#880e25", // 選中時的顏色
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
            slotProps={{
              inputLabel: {
                sx: {
                  "&.Mui-focused": {
                    color: "#880e25", // 當標籤浮動到框框上時的顏色
                  },
                },
              },
            }}
            sx={{
              marginBottom: "20px",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#ccc", // 默認邊框顏色
                },
                "&:hover fieldset": {
                  borderColor: "#888", // 滑鼠懸停時的顏色
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#880e25", // 選中時的顏色
                },
              },
            }}
          />
          {errorMessage && (
            <Typography
              color="error"
              variant="body2"
              sx={{
                fontSize: "16px", // 字體大小
                fontWeight: "bold", // 字體粗細
                marginBottom: "20px", // 與其他元素的間距
                color: "#cf1538", // 自定義顏色 (可以保持 `color="error"` 或自定義)
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
      </Box>
    </Box>
  );
}
