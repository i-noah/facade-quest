import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/system";
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

  const selectedGroupItem = questGroupProcess.find(
    (item) => item.id === selectedGroup
  );

  useEffect(() => {
    service
      .get<QuestGroupProcessItem[]>("/api/dataset/group")
      .then((res) => setQuestGroupProcess(res.data));
  }, []);

  return (
    <>
      <Grid sx={{ my: 3 }}>Hello, {auth.user}</Grid>
      <Grid
        container
        spacing={2}
        style={{ height: "90%", overflowY: "scroll", padding: "6px" }}
      >
        {questGroupProcess.map((item, i) => (
          <Grid key={i} item xs={4}>
            <Item
              square
              sx={{ position: "relative" }}
              onClick={() => handleClickOpen(item.id)}
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
        item={selectedGroupItem}
        selectedValue={selectedValue}
        open={open}
        onClose={handleClose}
      />
    </>
  );
};

export interface SimpleDialogProps {
  item?: QuestGroupProcessItem;
  open: boolean;
  selectedValue: number;
  onClose: (value: number) => void;
}

function SimpleDialog(props: SimpleDialogProps) {
  const { onClose, item, open } = props;

  const handleClose = () => {
    onClose(-1);
  };

  const handleListItemClick = (value: number) => {
    onClose(value);
  };

  if (!item) return null;

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>{item.title}</DialogTitle>
      <DialogContent>
        <Box sx={{ pb: 2 }}>问题</Box>
        <Box sx={{ pb: 2 }}>
          <Typography variant="subtitle2">
            {item.question}{" "}
            {item.help && item.help.startsWith("https://") && (
              <a href={item.help} target="_blank">
                查看帮助
              </a>
            )}
          </Typography>
          <Typography variant="caption">
            ⚠️注意：请先搞明白问题再作答。
          </Typography>
        </Box>
        <Box sx={{ pb: 2 }}>选择数量</Box>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Item sx={{ height: 40 }} onClick={() => handleListItemClick(50)}>
              开始
            </Item>
          </Grid>
          <Grid item xs={6}>
            <Item sx={{ height: 40 }} onClick={() => handleListItemClick(-1)}>
              先不做了
            </Item>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
