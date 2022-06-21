import {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import service from "../common/service";
import {
  Direction,
  TinderCard,
  TinderCardInstance,
} from "../components/TinderCard";
import useCountDown from "react-countdown-hook";
import { Button, Fab, Grid, IconButton, LinearProgress } from "@mui/material";
import { Check, CheckCircleOutline, Clear, Refresh } from "@mui/icons-material";
import { ProgressiveBackgroundImage } from "../components/ProgressiveBackgroundImage";

export const QuestPage = () => {
  const params = useParams();

  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [answer, setAnswer] = useState<QuestAnswerItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-2);
  const [lastDirection, setLastDirection] = useState<{ dir: string }>();
  const [done, setDone] = useState(false);

  const [showDirIndicator, setShowDirIndicator] = useState(false);
  const [uploadTimeLeft, uploadTimer] = useCountDown(5000, 500);
  const [uploading, setUploading] = useState(false);

  const nav = useNavigate();

  const canGoBack = currentIndex < quests.length - 1;

  const canSwipe = currentIndex >= 0;

  let childRefs = useMemo(
    () =>
      Array(quests.length)
        .fill(0)
        .map(() => createRef<TinderCardInstance>()),
    [quests]
  );

  useEffect(() => {
    if (showDirIndicator) {
      setTimeout(() => {
        setShowDirIndicator(false);
      }, 500);
    }
  }, [showDirIndicator]);

  useEffect(() => {
    service
      .get<QuestItem[]>(`/api/quest/next/${params.group}/${params.cnt}`)
      .then((res) => {
        setQuests(res.data);
        setCurrentIndex(res.data.length - 1);
      });
  }, []);

  useEffect(() => {
    const quest = quests[currentIndex + 1];
    if (!quest || !lastDirection) return;
    const idx = answer.findIndex(
      (item) => item.uuid === quest.uuid && item.qid === quest.qid
    );
    if (idx < 0) {
      setAnswer([
        ...answer,
        { ...quest, answer: lastDirection.dir === "left" },
      ]);
    } else {
      setAnswer([
        ...answer.slice(0, idx),
        {
          ...answer[idx],
          answer: lastDirection.dir === "left",
        },
        ...answer.slice(idx + 1),
      ]);
    }
  }, [lastDirection]);

  useEffect(() => {
    if (
      answer.length === quests.length &&
      answer.length > 0 &&
      currentIndex == -1
    ) {
      uploadTimer.reset();
      uploadTimer.start();
    }
  }, [answer]);

  useEffect(() => {
    if (currentIndex === -1 && uploadTimeLeft === 0) {
      setUploading(true);
      service
        .post("/api/quest/list", { quests: answer })
        .then(() => {
          setUploading(false);
          setDone(true);
        })
        .catch((err) => {
          console.log(err);
          setUploading(false);
        });
    }
  }, [uploadTimeLeft]);

  const swiped = (dir: string, index: number) => {
    setCurrentIndex(index - 1);
    setLastDirection({ dir });
    setShowDirIndicator(true);
  };

  const swipe = async (dir: Direction) => {
    if (canSwipe && currentIndex < quests.length) {
      setLastDirection({ dir });
      await childRefs[currentIndex].current?.swipe(dir); // Swipe the card!
    }
  };

  const goBack = async () => {
    if (!canGoBack) return;
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    await childRefs[newIndex].current?.restoreCard();
  };

  return (
    <>
      <div
        className="dir-indicator"
        style={{
          opacity: !showDirIndicator ? 0 : 1,
          backgroundColor:
            lastDirection?.dir === "left" ? "darkgreen" : "darkred",
        }}
      ></div>
      <div className="dir-indicator">
        {currentIndex === -1 && uploadTimeLeft > 0 && (
          <LinearProgress
            variant="determinate"
            value={(uploadTimeLeft * 100) / 5000}
            style={{ height: 3 }}
          />
        )}
      </div>
      <div className="question">
        {currentIndex === -1 && !uploading && !done
          ? `已完成 ${params.cnt} 个，${Math.floor(
              uploadTimeLeft / 1000
            ).toFixed()}s之后自动上传`
          : currentIndex >= 0 && currentIndex < quests.length
          ? `[${quests.length - currentIndex}/${quests.length}] ${
              quests[currentIndex].quest
            }`
          : ""}
        {currentIndex === -1 && uploadTimeLeft > 500 && (
          <Button size="small" onClick={() => uploadTimer.pause()}>
            点击取消
          </Button>
        )}
      </div>
      <div className="swipe-container">
        {quests.map((item, i) => (
          <TinderCard
            ref={childRefs[i]}
            className="swipe"
            key={i}
            onSwipe={(dir) => swiped(dir, i)}
          >
            <ProgressiveBackgroundImage className="card" src={item.image} />
          </TinderCard>
        ))}
        {currentIndex === -1 && done && (
          <Grid container alignContent="space-between" sx={{ height: "80%" }}>
            <Grid
              item
              sx={{
                alignSelf: "center",
                textAlign: "center",
                width: "100%",
                color: "darkgreen",
              }}
            >
              <CheckCircleOutline sx={{ fontSize: 200 }} />
            </Grid>
            <Grid
              item
              container
              sx={{ height: 36 }}
              justifyContent="space-around"
            >
              <Button onClick={() => nav("/", { replace: true })}>
                先不整了
              </Button>
              <Button
                onClick={() => {
                  service
                    .get<QuestItem[]>(
                      `/api/quest/next/${params.group}/${params.cnt}`
                    )
                    .then((res) => {
                      setQuests(res.data);
                      setCurrentIndex(res.data.length - 1);
                      setAnswer([]);
                      setDone(false);
                      setLastDirection(undefined);

                      for (const card of childRefs) {
                        card.current?.restoreCard();
                      }
                    });
                }}
                autoFocus
              >
                再来一把
              </Button>
            </Grid>
          </Grid>
        )}
      </div>
      {!done && (
        <div className="btn-group">
          <Fab disabled={!canSwipe} onClick={() => swipe("left")}>
            <Check sx={{ color: canSwipe ? "darkgreen" : "grey" }} />
          </Fab>
          <Fab disabled={!canGoBack} onClick={() => goBack()}>
            <Refresh sx={{ color: canGoBack ? "darkorange" : "grey" }} />
          </Fab>
          <Fab disabled={!canSwipe} onClick={() => swipe("right")}>
            <Clear sx={{ color: canSwipe ? "darkred" : "grey" }} />
          </Fab>
        </div>
      )}
    </>
  );
};
