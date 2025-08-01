import { useTranslation } from 'react-i18next';

import { Box, Divider, Stack, Typography, alpha, styled } from '@mui/material';

import { Account, AppAction } from '@graasp/sdk';

import { format } from 'date-fns/format';
import countBy from 'lodash.countby';

import { CodeVersionType } from '@/interfaces/codeVersions';
import { roundDateToIntervalStart } from '@/utils/chart';

import MemberVersionsSparkLine from './MemberVersionsSparkLine';

type Props = {
  member: Account;
  isMemberSelected: boolean;
  onClick: () => void;
  runningVersions: AppAction<CodeVersionType>[];
};

const StyledListItem = styled(Stack, {
  shouldForwardProp(propName) {
    return propName !== 'isMemberSelected';
  },
})<{ isMemberSelected: boolean }>(({ isMemberSelected, theme }) => ({
  cursor: 'pointer',
  background: isMemberSelected
    ? ` ${alpha(theme.palette.primary.main, 0.07)}`
    : '',
}));

const MemberListItem = ({
  member,
  isMemberSelected,
  onClick,
  runningVersions,
}: Props): JSX.Element => {
  const { t } = useTranslation();

  const timeOfLastVersion = format(
    runningVersions[runningVersions.length - 1].createdAt,
    'MMM/dd/yyyy HH:mm',
  );

  const versionsGroupedByIntervals = countBy(runningVersions, (action) =>
    roundDateToIntervalStart(action.createdAt),
  );

  return (
    <>
      <StyledListItem
        alignItems="flex-start"
        onClick={onClick}
        isMemberSelected={isMemberSelected}
      >
        <Stack alignItems="space-between" p={1} gap={1}>
          <Stack
            direction="row"
            justifyContent="space-between"
            width="100%"
            flex={1}
          >
            <Typography
              variant="body2"
              color="text.primary"
              textTransform="capitalize"
            >
              {member.name}
            </Typography>
            <Typography variant="body2" color="text.primary" component="span">
              {t('VERSION_COUNT', { count: runningVersions.length })}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="end"
          >
            <Typography variant="caption" component="span">
              {t('LAST_VERSION', { date: timeOfLastVersion })}
            </Typography>
            <Box sx={{ width: '50%' }}>
              <MemberVersionsSparkLine
                versionsGroupedByIntervals={versionsGroupedByIntervals}
              />
            </Box>
          </Stack>
        </Stack>
      </StyledListItem>
      <Divider
        variant="middle"
        component="li"
        sx={{ '&:last-child': { display: 'none' } }}
      />
    </>
  );
};

export default MemberListItem;
