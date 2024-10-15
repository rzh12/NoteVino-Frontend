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

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatar(file);
    }
  };

  const validateForm = () => {
    if (!email.includes("@")) {
      setErrorMessage("請輸入有效的電子郵件地址");
      return false;
    }
    if (password.length < 8) {
      setErrorMessage("密碼至少應為 8 個字元");
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage("密碼不一致");
      return false;
    }
    if (!username) {
      setErrorMessage("使用者名稱為必填項目");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
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
        formData.append("picture", avatar);
      }

      const response = await axios.post("/api/users/signup", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { token } = response.data;
      localStorage.setItem("token", token);

      navigate("/home");
    } catch (error) {
      console.error("Sign Up Error:", error);
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("註冊過程中發生錯誤");
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
                    color: "#880e25",
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
                  borderColor: "#880e25",
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
                    color: "#880e25",
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            slotProps={{
              inputLabel: {
                sx: {
                  "&.Mui-focused": {
                    color: "#880e25",
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
                  borderColor: "#880e25",
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
                    color: "#880e25",
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
                  borderColor: "#880e25",
                },
              },
            }}
          />

          {/* Avatar 與上傳按鈕排成一行 */}
          <Button
            variant="contained"
            component="label"
            sx={{
              backgroundColor: "#880e25",
              color: "white",
              padding: "6px 16px",
              "&:hover": {
                backgroundColor: "#cf1538",
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
                marginTop: "20px",
                marginBottom: "0px",
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
              color: "#880e25",
              border: "2px solid #880e25",
              textDecoration: "none",
              "&:hover": {
                backgroundColor: "#880e25",
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
