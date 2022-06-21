import { makeStyles } from "@mui/styles";
import React, { Component, useState } from "react";
import {
  Button,
  TextField,
  Link,
  Grid,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Person, Visibility, Lock } from "@mui/icons-material";
import { AppIcon } from "../components/AppIcon";
import clsx from "clsx";
import axios from "axios";
import { useAuth } from "../components/AuthProvider";
import { useHotkeys } from "react-hotkeys-hook";

const useStyles = makeStyles(() => ({
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: 250,
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  avatar: { margin: "1em 0 3em" },
  form: {
    width: "100%", // Fix IE 11 issue.
  },
  submit: {
    width: "100%",
    minWidth: "unset",
    height: "36px",
    display: "block",
    margin: "1em auto .5em",
    transition: "all 150ms ease-in-out",
  },
  // submitAni: {
  //   width: "36px",
  //   transform: "translateY(10px)",
  //   borderRadius: "50%",
  // },
  bottomLink: {
    opacity: 1,
    transition: "opacity 150ms ease-in-out",
  },
  bottomLinkAni: {
    opacity: 0,
  },
}));

const Signin = () => {
  const styles = useStyles();
  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [passwordRepeat, setPasswordRepeat] = useState<string>();
  const [showPassword, setShowPassword] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);
  const [reg, setReg] = useState(false)
  const auth = useAuth();

  const signIn = async () => {
    if (!username || !password) return;
    if (reg && password !== passwordRepeat) {
      console.log('password not match')
      return
    }

    setShowLoading(true);

    try {
      if (reg) await auth.register(username, password)
      else await auth.signin(username, password);
      setShowLoading(false);
    } catch (err) {
      console.log(err);
      if (!axios.isAxiosError(err) || !err.response) return;
      setShowLoading(false);
      // TODO 增加错误提示
    }
  };

  useHotkeys("enter", (e) => {
    e.preventDefault();
    // TODO 回车登录
  });

  return (
    <div className={styles.paper}>
      <div className={styles.avatar}>
        <AppIcon width={110} background="none" />
      </div>
      <div className={styles.form}>
        <Grid container spacing={1} alignItems="flex-end">
          <Grid item>
            <Person style={{ transform: "translate(-5px, 5px)" }} />
          </Grid>
          <Grid item style={{ width: "85%" }}>
            <TextField
              label="用户名"
              fullWidth
              variant="standard"
              name="username"
              autoComplete="email"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setUsername(event?.target.value)
              }
            />
          </Grid>
        </Grid>
        <Grid container spacing={1} alignItems="flex-end">
          <Grid item>
            <Lock style={{ transform: "translate(-5px, -5px)" }} />
          </Grid>
          <Grid item style={{ width: "85%" }}>
            <TextField
              margin="normal"
              fullWidth
              name="password"
              variant="standard"
              label="密码"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(event?.target.value)
              }
              InputProps={{
                endAdornment: (
                  <Visibility
                    style={{
                      width: "16px",
                      cursor: "pointer",
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    O
                  </Visibility>
                ),
              }}
            />
          </Grid>
        </Grid>
        {
          reg && <Grid container spacing={1} alignItems="flex-end">
            <Grid item>
              <Lock style={{ transform: "translate(-5px, -5px)" }} />
            </Grid>
            <Grid item style={{ width: "85%" }}>
              <TextField
                margin="normal"
                fullWidth
                name="password"
                variant="standard"
                label="重复密码"
                type={showPasswordRepeat ? "text" : "password"}
                autoComplete="current-password"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setPasswordRepeat(event?.target.value)
                }
                InputProps={{
                  endAdornment: (
                    <Visibility
                      style={{
                        width: "16px",
                        cursor: "pointer",
                      }}
                      onClick={() => setShowPasswordRepeat(!showPasswordRepeat)}
                    >
                      O
                    </Visibility>
                  ),
                }}
              />
            </Grid>
          </Grid>
        }
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          // className={clsx(styles.submit)}
          onClick={signIn}
          sx={{ mt: 2 }}
        >
          {showLoading ? (
            <CircularProgress color="secondary" size={24} sx={{ height: '100%' }} />
          ) : (
            <span>{reg ? '注册' : '登录'}</span>
          )}
        </Button>
        <Grid
          container
          className={clsx(
            styles.bottomLink,
            showLoading && styles.bottomLinkAni
          )}
        >
          <Grid item xs container justifyContent="flex-end">
            <Link variant="caption" sx={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => setReg(!reg)}>
              {!reg ? '注册' : '登录'}
            </Link>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export { Signin };
