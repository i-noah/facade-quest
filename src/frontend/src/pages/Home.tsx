import {
  Stack,
  Paper,
  Divider,
  Grid,
  Avatar,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { blue } from "@mui/material/colors";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import service from "../common/service";
import { useAuth } from "../components/AuthProvider";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "unset",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  height: 60,
}));

const cnts = [50, 100, 150, 200, 250, 300];

export const HomePage = () => {
  const auth = useAuth();
  const nav = useNavigate();

  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(-1);
  const [selectedGroup, setSelectedGroup] = useState<string>();

  const handleClickOpen = (group: string) => {
    setSelectedGroup(group);
    setOpen(true);
  };

  const handleClose = (value: number) => {
    setOpen(false);

    selectedGroup &&
      value > 0 &&
      nav(`/quest/${selectedGroup}/${value}`, { replace: true });
  };

  const [questGroupProcess, setQuestGroupProcess] = useState<
    QuestGroupProcessItem[]
  >([]);

  useEffect(() => {
    service
      .get<QuestGroupProcessItem[]>("/api/dataset/group")
      .then((res) => setQuestGroupProcess(res.data));
  }, []);

  return (
    <>
      <Grid sx={{ my: 3 }}>Hello, {auth.user}</Grid>
      <Grid container spacing={2}>
        {questGroupProcess.map((item, i) => (
          <Grid key={i} item xs={6}>
            <Item
              square
              sx={{ position: "relative" }}
              onClick={() => handleClickOpen(item.name)}
            >
              <div>{item.name}</div>
              <div>
                {item.rest} / {item.cnt}
              </div>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: `${((1 - item.rest / item.cnt) * 100).toFixed(2)}%`,
                  backgroundColor: "green",
                  display: "flex",
                  zIndex: -1,
                }}
              ></div>
            </Item>
          </Grid>
        ))}
      </Grid>
      <SimpleDialog
        selectedValue={selectedValue}
        open={open}
        onClose={handleClose}
      />
    </>
  );
};

export interface SimpleDialogProps {
  open: boolean;
  selectedValue: number;
  onClose: (value: number) => void;
}

function SimpleDialog(props: SimpleDialogProps) {
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(-1);
  };

  const handleListItemClick = (value: number) => {
    onClose(value);
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>选择数量</DialogTitle>
      <Grid container spacing={2} sx={{ p: 3 }}>
        {cnts.map((cnt) => (
          <Grid key={cnt} item xs={6}>
            <Item sx={{ height: 40 }} onClick={() => handleListItemClick(cnt)}>
              {cnt}个
            </Item>
          </Grid>
        ))}
        <Grid item xs={6}>
          <Item sx={{ height: 40 }} onClick={() => handleListItemClick(-1)}>
            先不做了
          </Item>
        </Grid>
      </Grid>
    </Dialog>
  );
}
