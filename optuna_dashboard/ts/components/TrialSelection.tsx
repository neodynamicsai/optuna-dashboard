import DownloadIcon from "@mui/icons-material/Download"
import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  IconButton,
  Switch,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material"
import { PlotParallelCoordinate, TrialTable } from "@optuna/react"
import React, { type FC, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import type { StudyDetail } from "ts/types/optuna"
import { studyDetailToStudy } from "../graphUtil"
import { SelectedTrialArtifactCards } from "./Artifact/SelectedTrialArtifactCards"
import { GraphHistory } from "./GraphHistory"
import { GraphParetoFront } from "./GraphParetoFront"

export const TrialSelection: FC<{ studyDetail: StudyDetail | null }> = ({
  studyDetail,
}) => {
  const theme = useTheme()
  const [selectedTrials, setSelectedTrials] = useState<number[]>([])
  const [includeInfeasibleTrials, setIncludeInfeasibleTrials] =
    useState<boolean>(true)
  const [includeDominatedTrials, setIncludeDominatedTrials] =
    useState<boolean>(true)
  const [showArtifacts, setShowArtifacts] = useState<boolean>(false)

  const handleSelectionChange = (selectedTrials: number[]) => {
    setSelectedTrials(selectedTrials)
  }
  const handleIncludeInfeasibleTrialsChange = () => {
    setIncludeInfeasibleTrials(!includeInfeasibleTrials)
  }
  const handleShowArtifactsChange = () => {
    setShowArtifacts(!showArtifacts)
  }
  const handleIncludeDominatedTrialsChange = () => {
    if (includeDominatedTrials) {
      setIncludeInfeasibleTrials(false)
    }
    setIncludeDominatedTrials(!includeDominatedTrials)
  }

  const study = studyDetailToStudy(studyDetail)
  const linkURL = (studyId: number, trialNumber: number) => {
    return `/dashboard/studies/${studyId}/trials?numbers=${trialNumber}`
  }

  const width = window.innerWidth - 100

  const csvUrl = useMemo(() => {
    const prefix = (window as any).rootPrefix || ""
    const selectedTrialIds = selectedTrials
    return selectedTrialIds.length > 0
      ? `${prefix}/csv/${studyDetail?.id}?trial_ids=${selectedTrialIds.join(",")}`
      : `${prefix}/csv/${studyDetail?.id}`
  }, [studyDetail?.id, selectedTrials])

  return (
    <Box
      component="div"
      sx={{ display: "flex", width: width, flexDirection: "column" }}
    >
      <Typography
        variant="h5"
        sx={{
          margin: theme.spacing(2),
          marginTop: theme.spacing(4),
          fontWeight: theme.typography.fontWeightBold,
        }}
      >
        Trial (Selection)
      </Typography>
      <Card sx={{ margin: theme.spacing(2) }}>
        <FormControl
          component="fieldset"
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            padding: theme.spacing(2),
          }}
        >
          {studyDetail && (
            <FormControlLabel
              control={
                <Switch
                  checked={includeInfeasibleTrials}
                  onChange={handleIncludeInfeasibleTrialsChange}
                  value="enable"
                />
              }
              label="Include Infeasible trials"
            />
          )}
          {studyDetail && (
            <FormControlLabel
              control={
                <Switch
                  checked={includeDominatedTrials}
                  onChange={handleIncludeDominatedTrialsChange}
                  disabled={!(studyDetail.directions.length > 1)}
                  value="enable"
                />
              }
              label="Include dominated trials"
            />
          )}
          {studyDetail && (
            <FormControlLabel
              control={
                <Switch
                  checked={showArtifacts}
                  onChange={handleShowArtifactsChange}
                  disabled={studyDetail.trials[0].artifacts.length === 0}
                  value="enable"
                />
              }
              label="Show Artifacts"
            />
          )}
        </FormControl>
        <CardContent>
          <PlotParallelCoordinate
            study={studyDetail}
            includeDominatedTrials={includeDominatedTrials}
            includeInfeasibleTrials={includeInfeasibleTrials}
            onSelectionChange={handleSelectionChange}
          />
        </CardContent>
      </Card>
      {studyDetail?.directions.length === 1 ? (
        <Card sx={{ margin: theme.spacing(2) }}>
          <CardContent>
            <GraphHistory
              studies={studyDetail !== null ? [studyDetail] : []}
              logScale={false}
              includePruned={false}
              selectedTrials={selectedTrials}
            />
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ margin: theme.spacing(2) }}>
          <CardContent>
            <GraphParetoFront
              study={studyDetail}
              selectedTrials={selectedTrials}
            />
          </CardContent>
        </Card>
      )}
      {studyDetail != null && showArtifacts ? (
        <Card sx={{ margin: theme.spacing(2) }}>
          <CardContent>
            <SelectedTrialArtifactCards
              study={studyDetail}
              selectedTrials={selectedTrials}
            />
          </CardContent>
        </Card>
      ) : null}
      {study && (
        <Box component="div" sx={{ display: "flex", flexDirection: "column" }}>
          <Card sx={{ margin: theme.spacing(2) }}>
            <CardContent>
              <TrialTable
                study={study}
                selectedTrials={selectedTrials}
                linkComponent={Link}
                linkURL={linkURL}
              />
              <Tooltip title="Download selected trials as CSV" placement="top">
                <span>
                  <IconButton
                    component="a"
                    href={csvUrl}
                    disabled={selectedTrials.length === 0}
                  >
                    <DownloadIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  )
}
