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
import nvLogo from "../nv-logo-2.svg";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(null); // 用於存儲用戶上傳的頭像
  const [errorMessage, setErrorMessage] = useState("");

  // 處理頭像上傳
  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatar(file); // 將頭像圖片存入 state
    }
  };

  // 發送註冊 API 請求
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      // 創建 FormData 對象來存儲要發送的資料
      const formData = new FormData();
      formData.append(
        "user",
        JSON.stringify({
          username,
          email,
          password,
        })
      );
      if (avatar) {
        formData.append("picture", avatar); // 如果用戶上傳了頭像，將圖片附加到表單中
      }

      // 發送 API 請求
      const response = await axios.post("/api/users/signup", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // 存儲 JWT token
      const { token } = response.data;
      localStorage.setItem("token", token); // 你可以選擇使用 sessionStorage 或 localStorage

      // 跳轉到首頁
      navigate("/home");
    } catch (error) {
      console.error("Sign Up Error:", error);
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("An error occurred during sign up.");
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
        {/* logo 頭像放在頂部 */}
        <Avatar
          sx={{
            width: 80,
            height: 80,
            marginBottom: 2,
          }}
          src={nvLogo} // 顯示 logo
        />
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
          Sign Up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            slotProps={{
              inputLabel: {
                sx: {
                  "&.Mui-focused": {
                    color: "#901B4E",
                  },
                },
              },
            }}
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
                  borderColor: "#901B4E",
                },
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            slotProps={{
              inputLabel: {
                sx: {
                  "&.Mui-focused": {
                    color: "#901B4E",
                  },
                },
              },
            }}
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
                  borderColor: "#901B4E",
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            slotProps={{
              inputLabel: {
                sx: {
                  "&.Mui-focused": {
                    color: "#901B4E",
                  },
                },
              },
            }}
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
                  borderColor: "#901B4E",
                },
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            slotProps={{
              inputLabel: {
                sx: {
                  "&.Mui-focused": {
                    color: "#901B4E",
                  },
                },
              },
            }}
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
                  borderColor: "#901B4E",
                },
              },
            }}
          />

          {/* Avatar 與上傳按鈕排成一行 */}
          <Button
            variant="contained"
            component="label"
            sx={{
              backgroundColor: "#901B4E",
              color: "white",
              padding: "6px 16px",
              "&:hover": {
                backgroundColor: "#d22772",
              },
            }}
          >
            Upload Avatar
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleAvatarUpload}
            />
          </Button>

          {errorMessage && (
            <Typography
              color="error"
              variant="body2"
              sx={{
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "20px",
                color: "#d22772",
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
              backgroundColor: "#901B4E",
              color: "white",
              padding: "12px 20px",
              marginTop: "20px",
              "&:hover": {
                backgroundColor: "#d22772",
              },
            }}
          >
            Sign Up
          </Button>
          <Link
            href="/login"
            sx={{
              display: "inline-block",
              marginTop: "20px",
              padding: "10px 20px",
              borderRadius: "5px",
              fontSize: "14px",
              fontWeight: "bold",
              color: "#901B4E",
              border: "2px solid #901B4E",
              textDecoration: "none",
              "&:hover": {
                backgroundColor: "#901B4E",
                color: "white",
              },
            }}
          >
            Already have an account? Sign In!
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
