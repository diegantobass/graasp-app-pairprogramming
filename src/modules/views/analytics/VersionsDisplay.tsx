import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import NotStartedTwoToneIcon from '@mui/icons-material/NotStartedTwoTone';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import SkipNextTwoToneIcon from '@mui/icons-material/SkipNextTwoTone';
import SkipPreviousTwoToneIcon from '@mui/icons-material/SkipPreviousTwoTone';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import { AppAction } from '@graasp/sdk';

import { format } from 'date-fns/format';

import { CodeVersionType } from '@/interfaces/codeVersions';
import { VERSION_STEP_DURATION, formatSeconds } from '@/utils/chart';

import RunView from './RunView';
import TimeLineSlider, { Mark } from './TimeLineSlider';

const formatMarkers = (versions: AppAction<CodeVersionType>[]): Mark[] => {
  const timestamps = versions.map((item) => ({
    value: Date.parse(item.createdAt),
    label: format(item.createdAt, 'MMM/dd HH:mm'),
  }));

  return timestamps;
};

type Props = {
  versions: AppAction<CodeVersionType>[];
  spentTimeInSeconds: number;
};
const VersionsDisplay = ({
  versions,
  spentTimeInSeconds,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [versionIndex, setVersionIndex] = useState(0);
  const [stopRunning, setStopRunning] = useState(false);
  const [isRunnerOpen, setIsRunnerOpen] = useState(false);

  const timeLineMarks = useMemo(() => formatMarkers(versions), [versions]);

  useEffect(() => {
    let interval: number;
    // setinterval to move to next version in case it's still not the last version or we don't stop running
    if (versionIndex < versions.length - 1 && !stopRunning) {
      interval = setInterval(() => {
        setVersionIndex((prev) => prev + 1);
      }, VERSION_STEP_DURATION);
    }
    return () => clearInterval(interval);
  }, [versionIndex, versions, stopRunning]);

  useEffect(() => {
    setVersionIndex(0);
    setStopRunning(false);
  }, [versions]);

  const handleSliderChange = (event: Event, value: number | number[]): void => {
    const index = timeLineMarks.findIndex((ele) => ele.value === value);
    setVersionIndex(index);
  };

  return (
    <>
      <Box>
        <SyntaxHighlighter
          language="python"
          style={docco}
          customStyle={{ height: '300px' }}
          showLineNumbers
        >
          {versions[versionIndex]?.data.code}
        </SyntaxHighlighter>
        <Typography variant="caption" component="div">
          {`${versions.length} ${t('versions')}`}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
          {t('Time Spent')}:
        </Typography>
        <Typography variant="caption">
          {` ${formatSeconds(spentTimeInSeconds).hours} ${t('hours')}, ${
            formatSeconds(spentTimeInSeconds).minutes
          } ${t('minutes')}`}
        </Typography>
        <Grid container alignItems="start" justifyContent="flex-end">
          <Grid size={8} sx={{ paddingTop: 0.5 }}>
            <TimeLineSlider
              handleChange={handleSliderChange}
              marks={timeLineMarks}
              versionIndex={versionIndex}
            />
          </Grid>
          <Grid size={4}>
            <Stack direction="row" justifyContent="flex-end">
              <IconButton
                aria-label="previous"
                color="primary"
                onClick={() => setVersionIndex(versionIndex - 1)}
                disabled={versionIndex === 0}
              >
                <SkipPreviousTwoToneIcon />
              </IconButton>
              <IconButton
                aria-label="start"
                color="primary"
                onClick={() => setStopRunning((isRunning) => !isRunning)}
              >
                {stopRunning ? <NotStartedTwoToneIcon /> : <PauseCircleIcon />}
              </IconButton>
              <IconButton
                aria-label="next"
                color="primary"
                disabled={versionIndex === versions.length - 1}
                onClick={() => setVersionIndex(versionIndex + 1)}
              >
                <SkipNextTwoToneIcon />
              </IconButton>
              <Button
                color="primary"
                onClick={() => {
                  setStopRunning(true);
                  setIsRunnerOpen(true);
                }}
              >
                {t('Run Code')}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
      <RunView
        open={isRunnerOpen}
        handleClose={() => setIsRunnerOpen(false)}
        codeVersion={versions[versionIndex]?.data}
      />
    </>
  );
};

export default VersionsDisplay;
